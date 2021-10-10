// contracts/SpacePool.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceCoin.sol";
import "./SpacePoolCoin.sol";
import "./Math.sol";

contract SpacePool is Ownable {

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);

    uint public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    SpaceCoin public _spaceCoin;
    SpacePoolCoin public _spacePoolCoin;
    uint _totalSupply;

    uint112 private reserve0;
    uint112 private reserve1;

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'SpacePool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    // called once by the factory at time of deployment
    constructor (SpaceCoin spaceCoin, SpacePoolCoin spacePoolCoin) {
        _spaceCoin = spaceCoin;
        _spacePoolCoin = spacePoolCoin;

        _totalSupply = _spacePoolCoin.totalSupply();
        if (_totalSupply == 0) {
            _spacePoolCoin.mint(address(this), MINIMUM_LIQUIDITY * 10 ** 18); // permanently lock the first MINIMUM_LIQUIDITY
        }
    }

    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }
    
    function mint(address to) external lock returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1) = getReserves(); // gas savings
        _totalSupply = _spacePoolCoin.totalSupply();

        uint balance0 = address(this).balance; // 10 ETH
        uint balance1 = _spaceCoin.balanceOf(address(this)); // 50 SPC
        uint amount0 = balance0 - reserve0;
        uint amount1 = balance1 - reserve1;

        // Calculate LP tokens for the current Liqudity
        liquidity = Math.min((amount0 * _totalSupply) / _reserve0, (amount1 * (_totalSupply)) / _reserve1); // Min(10 * 1000 / 3000 = 1000, 50 * 1000 / 15000 = 1000)
        
        require(liquidity > 0, 'SpacePool: INSUFFICIENT_LIQUIDITY_MINTED');
        _spacePoolCoin.mint(to, liquidity); // Mint liquidity to the Depositor

        emit Mint(to, balance0, amount1);
    }

    function burn(address to) external lock returns (uint amount0, uint amount1) {
        (uint112 _reserve0, uint112 _reserve1) = getReserves(); // gas savings
        
        uint balance0 = address(this).balance; // 3010 ETH
        uint balance1 = _spaceCoin.balanceOf(address(this)); // 15050 SPC
        uint liquidity = _spacePoolCoin.balanceOf(to); // 3.33 LP Token

        _totalSupply = _spacePoolCoin.totalSupply(); // 1003.33
        amount0 = liquidity * balance0 / _totalSupply; // 3.33 * 3010 / 1003.33
        amount1 = liquidity * balance1 / _totalSupply; // 3.33 * 15050 / 1003.3

        require(amount0 > 0 && amount1 > 0, 'SpacePool: INSUFFICIENT_LIQUIDITY_BURNED');

        _spacePoolCoin.burn(to, liquidity);

        // Transfer ETH from liquidity Pool to senders account
        (bool success, ) = to.call{ value: amount0 }("");
        require(success, 'ETH_TRANSFER_FAILED');

        emit Burn(msg.sender, amount0, amount1, to);
    }

    function swap(uint spaceCoins, address to) external payable lock returns (uint amountOut, uint slippage) {
        uint balance0 = address(this).balance; // 3010 ETH
        uint balance1 = _spaceCoin.balanceOf(address(this)); // 15050 SPC

        uint amountIn = msg.value;
        if (msg.value > 0 && spaceCoins == 0) {
            amountOut = (balance0 * balance1) / ( balance0 + amountIn );
            slippage = balance1 - amountOut;
        } else {
            amountOut = (balance0 * balance1) / ( balance1 + spaceCoins );
            slippage = balance0 - amountOut;

            (bool success, ) = to.call{ value: slippage }("");
            require(success, 'SpacePool::swapTokens ETH_TRANSFER_FROM_SPCPOOL_FAILED');
        }
    }

    // force reserves to match balances
    function sync() external lock {
        _update(address(this).balance, _spaceCoin.balanceOf(address(this)));
    }

    function _update(uint balance0, uint balance1) private {
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
    }
}