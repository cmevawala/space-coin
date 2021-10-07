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

    constructor(address _ico, address _treasury) ERC20("SpaceCoin", "SPC") {
        // Spec: SpaceCoin ICP Project 
        _mint(_ico, ONE_COIN * 30000 * 5); // Amount is in WEI. 150,000, 20000 * 5 = 100000

        // Spec: Project Liquidity Pool
        // _mint(_treasury, ONE_COIN * 30000 * 5); // Mint an initial 150,000 SPC supply (30k ETH times the ICO exchange rate) for your liquidity contract.
        // [address, tokens]
    }

    function mint(address to, uint amount) external {
        _mint(to, ONE_COIN * amount);
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
