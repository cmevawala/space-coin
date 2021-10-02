// contracts/SpaceCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SpaceCoin is ERC20, Ownable {
    
    uint constant ONE_COIN = 10 ** 18;
    uint constant MAX_COIN = 50000 * ONE_COIN;

    bool shouldTax = false;

    constructor(address _ico) ERC20("SpaceCoin", "SPC") {
        _mint(_ico, ONE_COIN * 30000 * 5); // Amount is in WEI.
    }

    // TODO Treasury - Transfer
    // TODO Toggle Tax
}
