// contracts/SpacePool.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceCoin.sol";
import "./SpacePoolToken.sol";
import "./Math.sol";

contract SpacePool is Ownable, SPT {

    uint public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    SpaceCoin public _spaceCoin;

    uint112 private reserve0;
    uint112 private reserve1;

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'SpacePool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() {
    }

    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    // called once by the factory at time of deployment
    function initialize(SpaceCoin spaceCoin) external {
        _spaceCoin = spaceCoin;
    }

    function mint(address to) external lock returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1) = getReserves(); // gas savings

        uint balance0 = address(this).balance;
        uint balance1 = _spaceCoin.balanceOf(address(this));
        uint amount0 = balance0 - _reserve0;
        uint amount1 = balance1 - _reserve1;

        uint _totalSupply = totalSupply(); // gas savings, must be defined here since totalSupply can update in _mintFee
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0 * amount1) - (MINIMUM_LIQUIDITY);
           _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = Math.min(amount0 * (_totalSupply) / _reserve0, amount1 * (_totalSupply) / _reserve1);
        }
    }

    function burn() external lock {
    }

    function swap() external lock {
    }

}
