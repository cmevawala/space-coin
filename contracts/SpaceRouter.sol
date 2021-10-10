// contracts/SpaceRouter.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import './SpacePool.sol';
import './SpaceCoin.sol';
import './SpacePoolLib.sol';
import './TransferHelper.sol';

contract SpaceRouter {

    uint8 private constant TRADE_FEE = 1;
    uint private constant SLIPPAGE_LIMIT = 5 ether;
    

    SpacePool private _spacePool;
    SpaceCoin private _spaceCoin;

    constructor(SpacePool spacePool, SpaceCoin spaceCoin) {
        _spacePool = spacePool;
        _spaceCoin = spaceCoin;
    }

    function _addLiquidity(uint amountADesired, uint amountBDesired) internal view returns (uint amountA, uint amountB) {
         // (uint reserveA, uint reserveB) = SpacePoolLibrary.getReserves(_spacePool, tokenA, tokenB);
         (uint reserveA, uint reserveB) = _spacePool.getReserves();

         if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            // uint amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
            // if (amountBOptimal <= amountBDesired) {
            //     (amountA, amountB) = (amountADesired, amountBOptimal);
            // } else {
            //     uint amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);
            //     assert(amountAOptimal <= amountADesired);
            //     (amountA, amountB) = (amountAOptimal, amountBDesired);
            // }
        }
    }

    function addLiquidity(uint spaceCoins) external payable returns (uint amountA, uint amountB, uint liquidity) {

        require(_spaceCoin.balanceOf(msg.sender) > 0, "NO_AVAILABLE_TOKENS");

        // Validate the liquidity when depositing for 1st time
        // Validate the liquidity when depositing for 2st time after the trading has happened
        (amountA, amountB) = _addLiquidity(msg.value, spaceCoins);

        // Transfer ETH from senders account to Liquidity Pool
        (bool success, ) = address(_spacePool).call{ value: msg.value }("");
        require(success, 'ETH_TRANSFER_FAILED');

        // Transfer SPC from senders account to Liquidity Pool
        _spaceCoin.increaseContractAllowance(msg.sender, address(_spacePool), spaceCoins);
        _spaceCoin.transferFrom(msg.sender, address(_spacePool), spaceCoins);

        // mint LP tokens to sender address
        liquidity = _spacePool.mint(msg.sender);
    }

    function removeLiquidity() external payable returns (uint amountA, uint amountB, uint liquidity) {

        // Calculate ETH and SPC
        (uint amountA, uint amountB) = _spacePool.burn(msg.sender);

        // Transfer SPC from liquidity Pool to senders account
        _spaceCoin.increaseContractAllowance(address(_spacePool), msg.sender, amountB);
        (bool success) = _spaceCoin.transferFrom(address(_spacePool), msg.sender, amountB);
        require(success, 'SpaceRouter::removeLiquidity SPC_TRANSFER_FAILED');
    }

    function swapTokens(uint spaceCoins) external payable returns (uint amountOut) {
        // Our Logic
        // Validate either SPC or ETH should be greater than zero
        // transfer 1 ETH from sender's account to Pool
        // Calculate 1% of ETH and subtract 1 - 0.01 = 0.99 ETH
        // Should 1% of trade fee added to the Constant ?
        // Calculate SPC Out i.e. SPC = Constant / total ETH after deposits
        // Transfer calculated SPC from the Pool the Sender Account

        if (spaceCoins == 0 && msg.value == 0) {
            require(false, "INVALID_TRADE");
        }

        // Assign amountIn
        uint amountIn = msg.value;
        uint slippage;

        if (spaceCoins > 0) {
            amountIn = spaceCoins;
        }

        // Calculate trade fee
        uint tradeFee = (amountIn * TRADE_FEE) / 100;

        // Deducted trade fee
        amountIn = amountIn - tradeFee;

        if (spaceCoins > 0) {
            // Transfer SPC from senders account to Liquidity Pool
            (amountOut, slippage) = _spacePool.swap(amountIn, msg.sender);

            require(slippage > 0 && slippage <= SLIPPAGE_LIMIT, 'EXCEDDED_SLIPPAGE_LIMIT'); // Slipage should not be greater than 5

            _spaceCoin.increaseContractAllowance(msg.sender, address(_spacePool), spaceCoins);
            (bool success) = _spaceCoin.transferFrom(msg.sender, address(_spacePool), spaceCoins);
            require(success, 'SpaceRouter::swapTokens SPC_TRANSFER_TO_SPCPOOL_FAILED');

        } else {
            // Transfer ETH from senders account to Liquidity Pool
            (amountOut, slippage) = _spacePool.swap{ value: amountIn }(0,  msg.sender);

            require(slippage > 0 && slippage <= SLIPPAGE_LIMIT, 'EXCEDDED_SLIPPAGE_LIMIT'); // Slipage should not be greater than 5

            _spaceCoin.increaseContractAllowance(address(_spacePool), msg.sender, slippage);
            (bool success) = _spaceCoin.transferFrom(address(_spacePool), msg.sender, slippage);
            require(success, 'SpaceRouter::swapTokens SPC_TRANSFER_TO_SENDER_FAILED');
        }

    }
        
}
