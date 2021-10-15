
// contracts/SPCLT.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SpacePoolCoin is ERC20, Ownable {

    address _spacePool;

    modifier onlySpacePool() {
        require(msg.sender == _spacePool, "SPCLT: Restricted Access");
        _;
    }

    constructor(address spacePool) ERC20("SpacePool Coin", "SPCLT")  {
        _spacePool = spacePool;
    }

    function mint(address account, uint256 amount) onlySpacePool() external returns (bool) {
        _mint(account, amount);
        return true;
    }

    function burn(address account, uint256 amount) onlySpacePool() external returns (bool) {
        _burn(account, amount);
        return true;
    }
}