// contracts/SpaceRouter.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import './SpacePool.sol';
import './SpaceCoin.sol';

contract SpaceRouter {

    // TODO: Overall the entire solution needs to be controlled using RBAC e.g. OpenZepplin AccessControl

    uint8 private constant TRADE_FEE = 1;
    uint private constant SLIPPAGE_LIMIT = 5 ether;

    SpacePool private _spacePool;
    SpaceCoin private _spaceCoin;

    receive() external payable {}

    constructor(SpacePool spacePool, SpaceCoin spaceCoin) {
        _spacePool = spacePool;
        _spaceCoin = spaceCoin;
    }

    function _quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
        require(amountA > 0, 'SpaceRouter: INSUFFICIENT_AMOUNT');
        require(reserveA > 0 && reserveB > 0, 'SpaceRouter: INSUFFICIENT_LIQUIDITY');
        amountB = (amountA * reserveB) / reserveA;
    }

    function _addLiquidity(uint amountADesired, uint amountBDesired) private view returns (uint amountA, uint amountB) {
        (uint reserveA, uint reserveB) = _spacePool.getReserves();

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = _quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = _quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function quote(uint amountInA, uint amountInB) external view returns (uint amountA, uint amountB) {
        (amountA, amountB) = _addLiquidity(amountInA, amountInB);
    }

    function addLiquidity(uint spaceCoins) external payable returns (uint amountA, uint amountB, uint liquidity) {

        (amountA, amountB) = _addLiquidity(msg.value, spaceCoins);

        require(spaceCoins > 0 && msg.value > 0, "INSUFFICIENT_ETH_SPC_SUPPLIED");
        require(_spaceCoin.balanceOf(msg.sender) > 0, "INSUFFICIENT_BALANCE_FOR_SPC_COINS");

        // Transfer ETH from senders account to Liquidity Pool
        (bool success, ) = address(_spacePool).call{ value: amountA }("");
        require(success, 'ETH_TRANSFER_TO_POOL_FAILED');

        // Transfer SPC from senders account to Liquidity Pool
        _spaceCoin.increaseContractAllowance(msg.sender, address(_spacePool), amountB);
        bool success1 = _spaceCoin.transferFrom(msg.sender, address(_spacePool), amountB);
        require(success1, 'SPC_TRANSFER_TO_POOL_FAILED');

        // mint LP tokens to sender address
        liquidity = _spacePool.mint(msg.sender);
    }

    function removeLiquidity() external payable returns (uint amountA, uint amountB) {

        // Calculate ETH and SPC for the senders LP Tokens
        (amountA, amountB) = _spacePool.burn(msg.sender);

        // Transfer ETH from Router Contract to senders account
        (bool success1, ) = msg.sender.call{ value: amountA }("");
        require(success1, 'ETH_TRANSFER_FROM_POOL_TO_SENDER_FAILED');

        // Transfer SPC from liquidity Pool to senders account
        _spaceCoin.increaseContractAllowance(address(_spacePool), msg.sender, amountB);
        (bool success2) = _spaceCoin.transferFrom(address(_spacePool), msg.sender, amountB);
        require(success2, 'SpaceRouter::removeLiquidity SPC_TRANSFER_FAILED');
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
        uint tradeFee = (amountIn * TRADE_FEE) / 100;
        _spacePool.depositTradeFee(tradeFee);

        // Deducted trade fee
        amountIn = amountIn - tradeFee;

        if (spaceCoins > 0) {
            require(spaceCoins <= _spaceCoin.balanceOf(msg.sender), "INSUFFICIENT_BALANCE_FOR_SPC_COINS");

            // Transfer SPC from senders account to Liquidity Pool
            (amountOut, slippage) = _spacePool.swap(amountIn, msg.sender);

            require(slippage > 0 && slippage <= SLIPPAGE_LIMIT, 'EXCEDDED_SLIPPAGE_LIMIT'); // SLIPPAGE <= 5

            _spaceCoin.increaseContractAllowance(msg.sender, address(_spacePool), spaceCoins);
            (bool success) = _spaceCoin.transferFrom(msg.sender, address(_spacePool), spaceCoins);
            require(success, 'SpaceRouter::swapTokens SPC_TRANSFER_TO_SPCPOOL_FAILED'); // TODO: Should you revert trade fee incase of SLIPPAGE failure

        } else {
            // Transfer ETH from senders account to Liquidity Pool
            (amountOut, slippage) = _spacePool.swap{ value: amountIn }(0,  msg.sender);

            require(slippage > 0 && slippage <= SLIPPAGE_LIMIT, 'EXCEDDED_SLIPPAGE_LIMIT'); // SLIPPAGE <= 5

            _spaceCoin.increaseContractAllowance(address(_spacePool), msg.sender, slippage);
            (bool success) = _spaceCoin.transferFrom(address(_spacePool), msg.sender, slippage);
            require(success, 'SpaceRouter::swapTokens SPC_TRANSFER_TO_SENDER_FAILED');
        }

    }
        
}
