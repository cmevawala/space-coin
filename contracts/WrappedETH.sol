// contracts/WETH.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WETH is ERC20, Ownable {

    address _minter;

    constructor() ERC20("Wrapped ETH", "WETH") {
    }

    function mint(address minter, uint amount) external payable {
        _minter = minter;
        _mint(_minter, amount * (10 ** 18));
    }

    function burn(uint amount) external payable {
        _burn(msg.sender, amount);
        (bool success, ) = msg.sender.call{ value: address(this).balance }("");
        require(success, 'WITHDRAW_FAILED');
    }

}