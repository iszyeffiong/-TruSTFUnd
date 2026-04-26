// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VerificationManager
 * @notice On-chain multi-sig verification for TruSTFUnd campaigns.
 *         Threshold: 2 admin signatures + 1 user signature.
 *         Addresses are editable by the contract owner.
 */
contract VerificationManager {
    address public owner;

    // --- Validator Registries ---
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isUser;
    address[] public adminList;
    address[] public userList;

    // --- Signature Tracking ---
    // keccak256(campaign, "verify") => signer => signed
    mapping(bytes32 => mapping(address => bool)) public signatures;
    // keccak256(campaign, "verify") => admin count
    mapping(bytes32 => uint256) public adminSigCount;
    // keccak256(campaign, "verify") => user count
    mapping(bytes32 => uint256) public userSigCount;

    // --- Milestone Signatures ---
    // keccak256(campaign, index) => signer => signed
    mapping(bytes32 => mapping(address => bool)) public milestoneSigs;
    mapping(bytes32 => uint256) public milestoneAdminCount;
    mapping(bytes32 => uint256) public milestoneUserCount;

    // --- Thresholds ---
    uint256 public constant ADMIN_THRESHOLD = 2;
    uint256 public constant USER_THRESHOLD = 1;

    // --- Events ---
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event UserAdded(address indexed user);
    event UserRemoved(address indexed user);
    event CampaignSigned(address indexed campaign, address indexed signer, string role);
    event CampaignVerified(address indexed campaign);
    event MilestoneSigned(address indexed campaign, uint256 indexed index, address indexed signer);
    event MilestoneApproved(address indexed campaign, uint256 indexed index);
    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyValidator() {
        require(isAdmin[msg.sender] || isUser[msg.sender], "Not a validator");
        _;
    }

    constructor(address[] memory _admins, address[] memory _users) {
        owner = msg.sender;

        for (uint256 i = 0; i < _admins.length; i++) {
            isAdmin[_admins[i]] = true;
            adminList.push(_admins[i]);
        }
        for (uint256 i = 0; i < _users.length; i++) {
            isUser[_users[i]] = true;
            userList.push(_users[i]);
        }
    }

    // ═══════════════════════════════════════════
    //  Address Management (Owner only)
    // ═══════════════════════════════════════════

    function addAdmin(address _admin) external onlyOwner {
        require(!isAdmin[_admin], "Already admin");
        isAdmin[_admin] = true;
        adminList.push(_admin);
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        require(isAdmin[_admin], "Not admin");
        isAdmin[_admin] = false;
        // Remove from array
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == _admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        emit AdminRemoved(_admin);
    }

    function addUser(address _user) external onlyOwner {
        require(!isUser[_user], "Already user validator");
        isUser[_user] = true;
        userList.push(_user);
        emit UserAdded(_user);
    }

    function removeUser(address _user) external onlyOwner {
        require(isUser[_user], "Not user validator");
        isUser[_user] = false;
        for (uint256 i = 0; i < userList.length; i++) {
            if (userList[i] == _user) {
                userList[i] = userList[userList.length - 1];
                userList.pop();
                break;
            }
        }
        emit UserRemoved(_user);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnerTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    // ═══════════════════════════════════════════
    //  Campaign Verification (Multi-sig)
    // ═══════════════════════════════════════════

    function signCampaignVerification(address _campaign) external onlyValidator {
        bytes32 key = keccak256(abi.encodePacked(_campaign, "verify"));
        require(!signatures[key][msg.sender], "Already signed");

        signatures[key][msg.sender] = true;

        if (isAdmin[msg.sender]) {
            adminSigCount[key]++;
            emit CampaignSigned(_campaign, msg.sender, "admin");
        } else {
            userSigCount[key]++;
            emit CampaignSigned(_campaign, msg.sender, "user");
        }

        // Check if threshold is met
        if (adminSigCount[key] >= ADMIN_THRESHOLD && userSigCount[key] >= USER_THRESHOLD) {
            emit CampaignVerified(_campaign);
        }
    }

    function revokeCampaignSignature(address _campaign) external onlyValidator {
        bytes32 key = keccak256(abi.encodePacked(_campaign, "verify"));
        require(signatures[key][msg.sender], "Not signed");

        signatures[key][msg.sender] = false;

        if (isAdmin[msg.sender]) {
            adminSigCount[key]--;
        } else {
            userSigCount[key]--;
        }
    }

    function isCampaignVerified(address _campaign) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(_campaign, "verify"));
        return adminSigCount[key] >= ADMIN_THRESHOLD && userSigCount[key] >= USER_THRESHOLD;
    }

    // ═══════════════════════════════════════════
    //  Milestone Approval (Multi-sig)
    // ═══════════════════════════════════════════

    function signMilestoneApproval(address _campaign, uint256 _index) external onlyValidator {
        bytes32 key = keccak256(abi.encodePacked(_campaign, _index));
        require(!milestoneSigs[key][msg.sender], "Already signed");

        milestoneSigs[key][msg.sender] = true;

        if (isAdmin[msg.sender]) {
            milestoneAdminCount[key]++;
        } else {
            milestoneUserCount[key]++;
        }

        emit MilestoneSigned(_campaign, _index, msg.sender);

        if (milestoneAdminCount[key] >= ADMIN_THRESHOLD && milestoneUserCount[key] >= USER_THRESHOLD) {
            emit MilestoneApproved(_campaign, _index);
        }
    }

    function isMilestoneApproved(address _campaign, uint256 _index) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(_campaign, _index));
        return milestoneAdminCount[key] >= ADMIN_THRESHOLD && milestoneUserCount[key] >= USER_THRESHOLD;
    }

    // ═══════════════════════════════════════════
    //  View Helpers
    // ═══════════════════════════════════════════

    function getAdmins() external view returns (address[] memory) {
        return adminList;
    }

    function getUsers() external view returns (address[] memory) {
        return userList;
    }

    function getCampaignSignatureCount(address _campaign)
        external view returns (uint256 admins, uint256 users)
    {
        bytes32 key = keccak256(abi.encodePacked(_campaign, "verify"));
        return (adminSigCount[key], userSigCount[key]);
    }
}
