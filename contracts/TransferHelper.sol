// contracts/SpaceRouter.sol
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
pragma solidity ^0.8.7;


// helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
library TransferHelper {

    function safeTransfer(address token, address to, uint256 value) internal {
    }

    function safeTransferFrom(address token, address from, address to, uint256 value) internal {
    }
}
