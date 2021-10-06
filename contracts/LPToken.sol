
// contracts/ADLP.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ADLP is ERC20, Ownable {

    constructor() ERC20("ADLPCoin", "ADLP") {}
}