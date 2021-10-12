// contracts/SpaceRouter.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import './SpacePool.sol';
import './SpaceCoin.sol';

contract SpaceRouter {

    uint8 private constant TRADE_FEE = 1;
    uint private constant SLIPPAGE_LIMIT = 5 ether;

    SpacePool private _spacePool;
    SpaceCoin private _spaceCoin;

    constructor(SpacePool spacePool, SpaceCoin spaceCoin) {
        _spacePool = spacePool;
        _spaceCoin = spaceCoin;
    }

    function addLiquidity(uint spaceCoins) external payable returns (uint amountA, uint amountB, uint liquidity) {

        require(spaceCoins > 0 && msg.value > 0, "INSUFFICIENT_ETH_SPC_SUPPLIED");
        require(_spaceCoin.balanceOf(msg.sender) > 0, "INSUFFICIENT_BALANCE_FOR_SPC_COINS");

        // Transfer ETH from senders account to Liquidity Pool
        (bool success, ) = address(_spacePool).call{ value: msg.value }("");
        require(success, 'ETH_TRANSFER_TO_POOL_FAILED');

        // Transfer SPC from senders account to Liquidity Pool
        _spaceCoin.increaseContractAllowance(msg.sender, address(_spacePool), spaceCoins);
        bool success1 = _spaceCoin.transferFrom(msg.sender, address(_spacePool), spaceCoins);
        require(success1, 'SPC_TRANSFER_TO_POOL_FAILED');

        // mint LP tokens to sender address
        liquidity = _spacePool.mint(msg.sender);
    }

    function removeLiquidity() external payable returns (uint amountA, uint amountB) {

        // Calculate ETH and SPC for the senders LP Tokens
        (amountA, amountB) = _spacePool.burn(msg.sender);

        // Transfer SPC from liquidity Pool to senders account
        _spaceCoin.increaseContractAllowance(address(_spacePool), msg.sender, amountB);
        (bool success) = _spaceCoin.transferFrom(address(_spacePool), msg.sender, amountB);
        require(success, 'SpaceRouter::removeLiquidity SPC_TRANSFER_FAILED');
    }

    function swapTokens(uint spaceCoins) external payable returns (uint amountOut) {
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
        uint tradeFee = (amountIn * TRADE_FEE) / 100; // TODO: Trade Fee should increase K. Mint on Pool's address

        // Deducted trade fee
        amountIn = amountIn - tradeFee;

        if (spaceCoins > 0) {
            require(spaceCoins <= _spaceCoin.balanceOf(msg.sender), "INSUFFICIENT_BALANCE_FOR_SPC_COINS");

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
