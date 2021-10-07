// contracts/SpaceRouter.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SpaceRouter is Ownable {

    constructor() {
    }

    function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, address to) external {
        // Get Address of Pool
        // Transfer tokenA from senders account to Pool
        // Transfer tokenB from senders account to Pool
        // Pool.mint(to) -- mint LP tokens to sender address
    }
}