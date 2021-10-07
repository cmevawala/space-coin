// contracts/SpaceRouter.sol
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
pragma solidity ^0.8.7;


// helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
library TransferHelper {

    function safeTransfer(address token, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'SpacePool::TransferHelper::safeTransfer: transfer failed');
    }

    function safeTransferFrom(address token, address from, address to, uint256 value) internal {

        // console.log('--------------SPC TOKEN ADDR------------');
        // console.log(token);
        // console.log('-----------------FROM ADDR--------------');
        // console.log(from);
        // console.log('-----------------TO ADDR--------------');
        // console.log(to);
        // console.log('-----------------SPC TOKENS--------------');
        // console.log(value * 10 ** 18);
        
        // bytes4(keccak256(bytes('approve(address,address,uint256)')));
        // (bool success, bytes memory data) = token.call(abi.encodeWithSignature("approve(address,address,uint256)", from, to, value));
        
        // require(success && (data.length == 0 || abi.decode(data, (bool))), 'SpacePool::TransferHelper: approve failed');

        
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success1, bytes memory data1) = token.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, value));

        // (bool balanceRe, bytes memory data2) = token.call(abi.encodeWithSignature("balanceOf(address)", to));
        // console.log('\n\nDecoded-----------------SPC TOKENS--------------');
        // console.log(abi.decode(data2, (uint)));

        require(success1 && (data1.length == 0 || abi.decode(data1, (bool))), 'SpacePool::TransferHelper: transferFrom failed');
    }
}
