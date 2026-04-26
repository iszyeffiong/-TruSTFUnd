// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ICampaign.sol";

/**
 * @title CrowdfundCampaign
 * @notice All-or-nothing crowdfunding. Funds are NOT released until
 *         the campaign is verified by the VerificationManager (2 admins + 1 user).
 *         On release: 87% to creator, 13% platform fee.
 *         On refund (unverified/failed): 90% back to each contributor, 10% kept.
 *         Uses cUSD (ERC-20) — not native CELO.
 *         Deployed as an EIP-1167 clone via CampaignFactory.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IVerificationManager {
    function isCampaignVerified(address campaign) external view returns (bool);
}

interface IFeeManager {
    function calculateFee(uint256 amount) external pure returns (uint256 fee, uint256 net);
    function feeCollector() external view returns (address);
    function EXTENSION_FEE() external view returns (uint256);
}

contract CrowdfundCampaign is ICampaign {
    // --- State ---
    address public creator;
    address public factory;
    address public cUSD;
    address public verificationManager;
    address public feeManager;

    uint256 public fundingGoal;
    uint256 public deadline;
    uint256 public totalRaised;
    bool public initialized;
    bool public fundsClaimedByCreator;
    bool public deadlineExtended;

    Status public status;

    mapping(address => uint256) public contributions;
    address[] public contributors;
    mapping(address => bool) public hasContributed;
    mapping(address => bool) public refundClaimed;

    // Crowdfund: max 2 milestones, min 1
    struct ProofOfUse {
        string title;
        string description;
        string recipient;
        uint256 amount;
    }
    ProofOfUse[] public proofItems;

    // --- Events ---
    event Contributed(address indexed user, uint256 amount);
    event CampaignFinalized(Status status);
    event FundsClaimed(uint256 netAmount, uint256 feeAmount);
    event RefundClaimed(address indexed user, uint256 amount);
    event DeadlineExtended(uint256 newDeadline);

    // --- Modifiers ---
    modifier onlyCreator() {
        require(msg.sender == creator, "Not creator");
        _;
    }

    modifier notInitialized() {
        require(!initialized, "Already initialized");
        _;
    }

    // --- Initializer (called by Factory after clone) ---
    function initialize(
        address _creator,
        address _factory,
        address _cUSD,
        address _verificationManager,
        address _feeManager,
        uint256 _goal,
        uint256 _deadline,
        string[] calldata _proofTitles,
        string[] calldata _proofDescriptions,
        string[] calldata _proofRecipients,
        uint256[] calldata _proofAmounts
    ) external notInitialized {
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_proofTitles.length >= 1 && _proofTitles.length <= 2, "Crowdfund: 1-2 proof items");

        // Verify amounts sum to goal
        uint256 total = 0;
        for (uint256 i = 0; i < _proofAmounts.length; i++) {
            total += _proofAmounts[i];
            proofItems.push(ProofOfUse({
                title: _proofTitles[i],
                description: _proofDescriptions[i],
                recipient: _proofRecipients[i],
                amount: _proofAmounts[i]
            }));
        }
        require(total == _goal, "Proof amounts must equal goal");

        creator = _creator;
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
    //  Contribute (Donors send cUSD)
    // ═══════════════════════════════════════════

    function contribute(uint256 _amount) external {
        require(status == Status.Active, "Campaign not active");
        require(block.timestamp < deadline, "Deadline passed");
        require(_amount > 0, "Amount must be > 0");

        IERC20(cUSD).transferFrom(msg.sender, address(this), _amount);

        if (!hasContributed[msg.sender]) {
            contributors.push(msg.sender);
            hasContributed[msg.sender] = true;
        }

        contributions[msg.sender] += _amount;
        totalRaised += _amount;

        emit Contributed(msg.sender, _amount);
    }

    // ═══════════════════════════════════════════
    //  Finalize (Anyone can call after deadline)
    // ═══════════════════════════════════════════

    function finalizeCampaign() external {
        require(status == Status.Active, "Already finalized");
        require(block.timestamp >= deadline, "Deadline not reached");

        if (totalRaised >= fundingGoal) {
            status = Status.Successful;
        } else {
            status = Status.Failed;
        }

        emit CampaignFinalized(status);
    }

    // ═══════════════════════════════════════════
    //  Claim Funds (Creator — only after verification)
    // ═══════════════════════════════════════════

    function claimFunds() external onlyCreator {
        require(status == Status.Successful, "Campaign not successful");
        require(!fundsClaimedByCreator, "Already claimed");
        require(
            IVerificationManager(verificationManager).isCampaignVerified(address(this)),
            "Campaign not verified by validators"
        );

        fundsClaimedByCreator = true;

        uint256 balance = IERC20(cUSD).balanceOf(address(this));
        IFeeManager fm = IFeeManager(feeManager);
        (uint256 fee, uint256 net) = fm.calculateFee(balance);
        address collector = fm.feeCollector();

        // 87% to creator, 13% to fee collector
        IERC20(cUSD).transfer(collector, fee);
        IERC20(cUSD).transfer(creator, net);

        emit FundsClaimed(net, fee);
    }

    // ═══════════════════════════════════════════
    //  Refund (Contributors — if failed or unverified)
    // ═══════════════════════════════════════════

    function claimRefund() external {
        require(
            status == Status.Failed || status == Status.Refunding,
            "Refund not available"
        );
        require(contributions[msg.sender] > 0, "No contribution");
        require(!refundClaimed[msg.sender], "Already refunded");

        refundClaimed[msg.sender] = true;

        // Refund 90% of what they contributed, 10% kept
        uint256 contributed = contributions[msg.sender];
        uint256 refundAmount = (contributed * 9000) / 10000; // 90%

        IERC20(cUSD).transfer(msg.sender, refundAmount);

        emit RefundClaimed(msg.sender, refundAmount);
    }

    /**
     * @notice Admin can activate refund mode if campaign is successful
     *         but fails verification (validators refuse to verify).
     *         Called by VerificationManager or factory owner.
     */
    function activateRefunds() external {
        require(msg.sender == factory || msg.sender == verificationManager, "Not authorized");
        require(status == Status.Active || status == Status.Successful, "Invalid state");
        require(!fundsClaimedByCreator, "Funds already claimed");

        status = Status.Refunding;
        emit CampaignFinalized(Status.Refunding);
    }

    // ═══════════════════════════════════════════
    //  Deadline Extension (Creator — once, $2 fee)
    // ═══════════════════════════════════════════

    function extendDeadline() external onlyCreator {
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

    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    function getContribution(address _user) external view returns (uint256) {
        return contributions[_user];
    }

    function getProofItemCount() external view returns (uint256) {
        return proofItems.length;
    }
}
