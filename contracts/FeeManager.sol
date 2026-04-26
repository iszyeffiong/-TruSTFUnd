// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FeeManager
 * @notice Handles the 13% platform fee on every fund release.
 *         Fee is auto-deducted inside campaign contracts.
 *         Collected fees are sent directly to the feeCollector address.
 */
contract FeeManager {
    address public owner;
    address public feeCollector;

    // 1300 basis points = 13%
    uint256 public constant FEE_RATE = 1300;
    uint256 public constant BASIS_POINTS = 10000;

    // Extension fee: $2 cUSD (18 decimals)
    uint256 public constant EXTENSION_FEE = 2 * 1e18;

    // Campaign creation fees
    uint256 public constant CROWDFUND_CREATION_FEE = 1 * 1e18;  // $1 cUSD
    uint256 public constant STARTUP_CREATION_FEE = 5 * 1e18;    // $5 cUSD

    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _feeCollector) {
        require(_feeCollector != address(0), "Zero address");
        owner = msg.sender;
        feeCollector = _feeCollector;
    }

    /**
     * @notice Calculate fee and net amount for a given release.
     * @param _amount Total amount being released
     * @return fee The 13% platform fee
     * @return net The 87% going to the campaign creator/startup
     */
    function calculateFee(uint256 _amount) external pure returns (uint256 fee, uint256 net) {
        fee = (_amount * FEE_RATE) / BASIS_POINTS;
        net = _amount - fee;
    }

    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Zero address");
        emit FeeCollectorUpdated(feeCollector, _newCollector);
        feeCollector = _newCollector;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnerTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
