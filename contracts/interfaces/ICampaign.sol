// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICampaign {
    enum Status { Active, Successful, Failed, Refunding }

    function getStatus() external view returns (Status);
    function totalRaised() external view returns (uint256);
    function fundingGoal() external view returns (uint256);
}
