// contracts/SpaceCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Treasury.sol";

contract SpaceCoin is ERC20, Ownable {
    
    uint constant ONE_COIN = 10 ** 18;
    uint constant MAX_COIN = 50000 * ONE_COIN;

    bool public shouldTax = false;
    address private _treasury;

    constructor(address _ico, address treasury) ERC20("SpaceCoin", "SPC") {
        _mint(_ico, ONE_COIN * 30000 * 5); // Amount is in WEI.
        _treasury = treasury;
    }
    
    function tokenTrasfer(address from, address to, uint tokens) external {
        require(tokens > 0, 'Amount is Zero');

        if (shouldTax) {
            uint taxAmount = tokens * 2 / 100;
            tokens = tokens - taxAmount;

            _transfer(from, to, tokens);

        }

        _transfer(from, to, tokens);
    }
}
