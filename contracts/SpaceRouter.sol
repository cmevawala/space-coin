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

    SpacePool private _spacePool;
    SpaceCoin private _spaceCoin;

    constructor(SpacePool spacePool, SpaceCoin spaceCoin) {
        _spacePool = spacePool;
        _spaceCoin = spaceCoin;
    }

    function _addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired) internal returns (uint amountA, uint amountB) {
         // (uint reserveA, uint reserveB) = SpacePoolLibrary.getReserves(_spacePool, tokenA, tokenB);
         (uint reserveA, uint reserveB,) = _spacePool.getReserves();

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

    function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, address to) external payable
        returns (uint amountA, uint amountB, uint liquidity) {

        require(_spaceCoin.balanceOf(msg.sender) > 0, "NO_AVAILABLE_TOKENS");

        (amountA, amountB) = _addLiquidity(tokenA, tokenB, msg.value, amountBDesired);

        // Transfer tokenB from senders account to Liquidity Pool
        (bool success, ) = address(_spacePool).call{ value: msg.value }("");
        require(success, 'ETH_TRANSFER_FAILED');

        // Transfer tokenB from senders account to Liquidity Pool
        _spaceCoin.increaseContractAllowance(msg.sender, address(_spacePool), amountB);
        _spaceCoin.transferFrom(msg.sender, address(_spacePool), amountB);

        // Pool.mint(to) -- mint LP tokens to sender address
        uint liquiditytokens = _spacePool.mint(to);
    }
}
