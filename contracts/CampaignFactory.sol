// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CampaignFactory
 * @notice Deploys EIP-1167 minimal proxy (clone) contracts for
 *         both Startup and Crowdfund campaigns on Celo.
 *         Each clone points to a shared implementation, saving gas.
 */

// Minimal EIP-1167 Clones library (inlined to avoid external deps in demo)
library Clones {
    function clone(address implementation) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "Clone failed");
    }
}

// Minimal interfaces for initialization
interface IStartupCampaign {
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
    ) external;
}

interface ICrowdfundCampaign {
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
    ) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IFeeManagerFactory {
    function feeCollector() external view returns (address);
    function CROWDFUND_CREATION_FEE() external view returns (uint256);
    function STARTUP_CREATION_FEE() external view returns (uint256);
}

contract CampaignFactory {
    address public owner;
    address public startupImplementation;
    address public crowdfundImplementation;
    address public verificationManager;
    address public feeManager;
    address public cUSD;

    address[] public allCampaigns;

    // Track which type each campaign is
    mapping(address => string) public campaignType;

    // --- Events ---
    event StartupCampaignCreated(
        address indexed campaign,
        address indexed startup,
        uint256 goal,
        uint256 deadline,
        uint256 milestoneCount
    );

    event CrowdfundCampaignCreated(
        address indexed campaign,
        address indexed creator,
        uint256 goal,
        uint256 deadline
    );

    event ImplementationUpdated(string campaignType, address newImpl);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        address _startupImpl,
        address _crowdfundImpl,
        address _verificationManager,
        address _feeManager,
        address _cUSD
    ) {
        owner = msg.sender;
        startupImplementation = _startupImpl;
        crowdfundImplementation = _crowdfundImpl;
        verificationManager = _verificationManager;
        feeManager = _feeManager;
        cUSD = _cUSD;
    }

    // ═══════════════════════════════════════════
    //  Create Startup Campaign
    // ═══════════════════════════════════════════

    function createStartupCampaign(
        address _startup,
        uint256 _fundingGoal,
        uint256 _deadline,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external returns (address campaign) {
        // Collect $5 cUSD creation fee from caller
        _collectCreationFee(IFeeManagerFactory(feeManager).STARTUP_CREATION_FEE());

        campaign = Clones.clone(startupImplementation);

        IStartupCampaign(campaign).initialize(
            _startup,
            address(this),
            cUSD,
            verificationManager,
            feeManager,
            _fundingGoal,
            _deadline,
            _milestoneAmounts,
            _milestoneDeadlines
        );

        allCampaigns.push(campaign);
        campaignType[campaign] = "startup";

        emit StartupCampaignCreated(
            campaign,
            _startup,
            _fundingGoal,
            _deadline,
            _milestoneAmounts.length
        );
    }

    // ═══════════════════════════════════════════
    //  Create Crowdfund Campaign
    // ═══════════════════════════════════════════

    function createCrowdfundCampaign(
        address _creator,
        uint256 _fundingGoal,
        uint256 _deadline,
        string[] calldata _proofTitles,
        string[] calldata _proofDescriptions,
        string[] calldata _proofRecipients,
        uint256[] calldata _proofAmounts
    ) external returns (address campaign) {
        // Collect $1 cUSD creation fee from caller
        _collectCreationFee(IFeeManagerFactory(feeManager).CROWDFUND_CREATION_FEE());

        campaign = Clones.clone(crowdfundImplementation);

        ICrowdfundCampaign(campaign).initialize(
            _creator,
            address(this),
            cUSD,
            verificationManager,
            feeManager,
            _fundingGoal,
            _deadline,
            _proofTitles,
            _proofDescriptions,
            _proofRecipients,
            _proofAmounts
        );

        allCampaigns.push(campaign);
        campaignType[campaign] = "crowdfund";

        emit CrowdfundCampaignCreated(campaign, _creator, _fundingGoal, _deadline);
    }

    // ═══════════════════════════════════════════
    //  Admin Functions
    // ═══════════════════════════════════════════

    function updateStartupImplementation(address _newImpl) external onlyOwner {
        startupImplementation = _newImpl;
        emit ImplementationUpdated("startup", _newImpl);
    }

    function updateCrowdfundImplementation(address _newImpl) external onlyOwner {
        crowdfundImplementation = _newImpl;
        emit ImplementationUpdated("crowdfund", _newImpl);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        owner = _newOwner;
    }

    // ═══════════════════════════════════════════
    //  Internal: Collect Creation Fee
    // ═══════════════════════════════════════════

    function _collectCreationFee(uint256 _fee) internal {
        address collector = IFeeManagerFactory(feeManager).feeCollector();
        IERC20(cUSD).transferFrom(msg.sender, collector, _fee);
    }

    // ═══════════════════════════════════════════
    //  View Helpers
    // ═══════════════════════════════════════════

    function getAllCampaigns() external view returns (address[] memory) {
        return allCampaigns;
    }

    function getCampaignCount() external view returns (uint256) {
        return allCampaigns.length;
    }
}
