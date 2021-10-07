// contracts/SpaceCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceCoinICO.sol";
import "./SpacePool.sol";
import "./WrappedETH.sol";


contract Treasury is Ownable {

    SpaceCoinICO _ico;
    WETH _weth;
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

    // function setWETHAddress(address weth) public {
    //     _weth = WETH(weth);
    // }

    // function withdrawFromICO() public payable {
    //     _ico.withdraw();
    // }

    // function transferWETH(address _to, uint amount) external onlyOwner {
    //     _weth.transfer(_to, amount);
    // }
}
