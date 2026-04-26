// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ICampaign.sol";

/**
 * @title StartupCampaign
 * @notice Milestone-gated investment contract with multi-sig verification.
 *         Funds are released per milestone: 87% to startup, 13% platform fee.
 *         Refund logic: 10% of remaining balance deducted, 90% returned to investors.
 *         Example: raised $100k, released $20k via milestones. $80k remains.
 *                  10% of $80k = $8k kept. $72k distributed to investors proportionally.
 *         Uses cUSD (ERC-20). Deployed as EIP-1167 clone via CampaignFactory.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IVerificationManager {
    function isCampaignVerified(address campaign) external view returns (bool);
    function isMilestoneApproved(address campaign, uint256 index) external view returns (bool);
}

interface IFeeManager {
    function calculateFee(uint256 amount) external pure returns (uint256 fee, uint256 net);
    function feeCollector() external view returns (address);
    function EXTENSION_FEE() external view returns (uint256);
}

contract StartupCampaign is ICampaign {
    // --- Milestone Struct ---
    struct Milestone {
        uint256 amount;
        uint256 milestoneDeadline;
        bool released;
    }

    // --- State ---
    address public startup;
    address public factory;
    address public cUSD;
    address public verificationManager;
    address public feeManager;

    uint256 public fundingGoal;
    uint256 public deadline;
    uint256 public totalRaised;
    uint256 public totalReleased;
    bool public initialized;
    bool public deadlineExtended;

    Status public status;

    Milestone[] public milestones;

    mapping(address => uint256) public investments;
    address[] public investors;
    mapping(address => bool) public hasInvested;
    mapping(address => bool) public refundClaimed;

    // --- Events ---
    event Invested(address indexed investor, uint256 amount);
    event MilestoneReleased(uint256 indexed index, uint256 netAmount, uint256 feeAmount);
    event RefundActivated();
    event RefundClaimed(address indexed investor, uint256 amount);
    event DeadlineExtended(uint256 newDeadline);

    // --- Modifiers ---
    modifier onlyStartup() {
        require(msg.sender == startup, "Not startup");
        _;
    }

    modifier notInitialized() {
        require(!initialized, "Already initialized");
        _;
    }

    // --- Initializer (called by Factory after clone) ---
    function initialize(
        address _startup,
        address _factory,
        address _cUSD,
        address _verificationManager,
        address _feeManager,
        uint256 _goal,
        uint256 _deadline,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external notInitialized {
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_milestoneAmounts.length >= 4, "Startup: minimum 4 milestones");
        require(_milestoneAmounts.length == _milestoneDeadlines.length, "Array length mismatch");

        // Verify milestone amounts sum to goal
        uint256 total = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] > 0, "Milestone amount must be > 0");
            total += _milestoneAmounts[i];
            milestones.push(Milestone({
                amount: _milestoneAmounts[i],
                milestoneDeadline: _milestoneDeadlines[i],
                released: false
            }));
        }
        require(total == _goal, "Milestone amounts must equal goal");

        startup = _startup;
        factory = _factory;
        cUSD = _cUSD;
        verificationManager = _verificationManager;
        feeManager = _feeManager;
        fundingGoal = _goal;
        deadline = _deadline;
        status = Status.Active;
        initialized = true;
    }

    // ═══════════════════════════════════════════
    //  Invest (Investors send cUSD)
    // ═══════════════════════════════════════════

    function invest(uint256 _amount) external {
        require(status == Status.Active, "Campaign not active");
        require(block.timestamp < deadline, "Deadline passed");
        require(_amount > 0, "Amount must be > 0");
        require(
            IVerificationManager(verificationManager).isCampaignVerified(address(this)),
            "Campaign not verified — cannot invest yet"
        );

        IERC20(cUSD).transferFrom(msg.sender, address(this), _amount);

        if (!hasInvested[msg.sender]) {
            investors.push(msg.sender);
            hasInvested[msg.sender] = true;
        }

        investments[msg.sender] += _amount;
        totalRaised += _amount;

        emit Invested(msg.sender, _amount);
    }

    // ═══════════════════════════════════════════
    //  Release Milestone (only after multi-sig approval)
    // ═══════════════════════════════════════════

    function releaseMilestone(uint256 _index) external onlyStartup {
        require(status == Status.Active || status == Status.Successful, "Invalid state");
        require(_index < milestones.length, "Invalid milestone index");

        Milestone storage m = milestones[_index];
        require(!m.released, "Already released");
        require(
            IVerificationManager(verificationManager).isMilestoneApproved(address(this), _index),
            "Milestone not approved by validators"
        );

        m.released = true;

        IFeeManager fm = IFeeManager(feeManager);
        (uint256 fee, uint256 net) = fm.calculateFee(m.amount);
        address collector = fm.feeCollector();

        totalReleased += m.amount;

        // 87% to startup, 13% to fee collector
        IERC20(cUSD).transfer(collector, fee);
        IERC20(cUSD).transfer(startup, net);

        // Check if all milestones released
        bool allReleased = true;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].released) {
                allReleased = false;
                break;
            }
        }
        if (allReleased) {
            status = Status.Successful;
        }

        emit MilestoneReleased(_index, net, fee);
    }

    // ═══════════════════════════════════════════
    //  Refund Logic
    //  10% of remaining balance deducted, 90% back to investors
    // ═══════════════════════════════════════════

    /**
     * @notice Activate refund mode. Can be called by factory/admin
     *         when milestones are missed or campaign fails verification.
     */
    function activateRefunds() external {
        require(msg.sender == factory || msg.sender == verificationManager, "Not authorized");
        require(status == Status.Active, "Not active");

        status = Status.Refunding;
        emit RefundActivated();
    }

    /**
     * @notice Auto-trigger refund if the funding deadline passed
     *         and the campaign didn't raise enough or milestones timed out.
     */
    function triggerRefundIfConditionsMet() external {
        require(status == Status.Active, "Not active");
        require(block.timestamp >= deadline, "Deadline not reached");

        // If goal not met, enter refund mode
        if (totalRaised < fundingGoal) {
            status = Status.Refunding;
            emit RefundActivated();
        }
    }

    /**
     * @notice Investors claim their proportional share of the remaining funds.
     *         Remaining = contract balance (totalRaised - totalReleased).
     *         10% of remaining is deducted, 90% is distributed.
     *         Each investor gets: (their investment / totalRaised) * refundablePool
     */
    function claimRefund() external {
        require(status == Status.Refunding, "Not in refund mode");
        require(investments[msg.sender] > 0, "No investment");
        require(!refundClaimed[msg.sender], "Already refunded");

        refundClaimed[msg.sender] = true;

        uint256 remaining = IERC20(cUSD).balanceOf(address(this));

        // 10% of remaining is kept, 90% is the refundable pool
        uint256 refundablePool = (remaining * 9000) / 10000;

        // Investor's proportional share of original raise
        uint256 investorShare = (investments[msg.sender] * refundablePool) / totalRaised;

        IERC20(cUSD).transfer(msg.sender, investorShare);

        emit RefundClaimed(msg.sender, investorShare);
    }

    // ═══════════════════════════════════════════
    //  Deadline Extension (Startup — once, $2 fee)
    // ═══════════════════════════════════════════

    function extendDeadline() external onlyStartup {
        require(status == Status.Active, "Campaign not active");
        require(!deadlineExtended, "Already extended once");

        deadlineExtended = true;

        // Collect $2 cUSD extension fee
        IFeeManager fm = IFeeManager(feeManager);
        uint256 extFee = fm.EXTENSION_FEE();
        address collector = fm.feeCollector();
        IERC20(cUSD).transferFrom(msg.sender, collector, extFee);

        // Extend by 2 weeks
        deadline += 14 days;

        emit DeadlineExtended(deadline);
    }

    // ═══════════════════════════════════════════
    //  View Helpers
    // ═══════════════════════════════════════════

    function getStatus() external view override returns (Status) {
        return status;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getMilestone(uint256 _index) external view returns (
        uint256 amount,
        uint256 milestoneDeadline,
        bool released
    ) {
        Milestone storage m = milestones[_index];
        return (m.amount, m.milestoneDeadline, m.released);
    }

    function getInvestors() external view returns (address[] memory) {
        return investors;
    }

    function getInvestment(address _investor) external view returns (uint256) {
        return investments[_investor];
    }
}
