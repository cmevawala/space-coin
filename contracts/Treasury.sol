// contracts/SpaceCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceCoinICO.sol";

contract Treasury {

    SpaceCoinICO _ico;
    
    function setSpaceCoinICOAddress(address ico) public {
        _ico = SpaceCoinICO(ico);
    }

    function withdrawFromICO() public payable {
        _ico.withdraw();
    }

    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

}
