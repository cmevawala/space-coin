// contracts/SpaceCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceCoinICO.sol";
import "./SpacePool.sol";


contract Treasury is Ownable {

    SpaceCoinICO _ico;
    SpacePool _spacePool;
    
    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function setSpaceCoinICOAddress(address ico) public {
        _ico = SpaceCoinICO(ico);
    }

    // function setSpacePoolAddress(address spacePool) public {
    //     _spacePool = SpacePool(spacePool);
    // }

    // function withdrawFromICO() public payable {
    //     _ico.withdraw();
    // }
}
