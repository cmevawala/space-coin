// contracts/SpacePool.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceCoin.sol";

contract SpacePool is Ownable {

    uint public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    address public token0;
    address public token1;

    uint112 private reserve0;
    uint112 private reserve1;
    uint32  private blockTimestampLast;

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'SpacePool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() {
        // factory = msg.sender;
    }

    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1) external {
        // require(msg.sender == factory, 'UniswapV2: FORBIDDEN'); // sufficient check
        token0 = _token0;
        token1 = _token1;
    }

    // function mint(address to) external lock returns (uint liquidity) {
    //     (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
    // }

    function burn() external lock {
    }

    function swap() external lock {
    }

}
