// contracts/SpaceCoin.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

enum Phase {
    Seed,
    General,
    Open
}

contract SpaceCoin is ERC20, Ownable {

    bool private _transferTax = false;
    bool private _pause = false;
    
    uint private _phaseLimit = 1500 ether;
    uint private _contributionLimit = 300 ether;

    Phase private _phase = Phase.Seed;

    mapping(address => bool) private _whiteListedAddress;
    mapping(address => uint) private _contributorToAmount;

    // Emit events at last

    modifier isWhitelisted() {
        if (_phase == Phase.Seed) {
            require(_whiteListedAddress[msg.sender], 'Error: Address not in whitelist');
        }
        _;
    }

    modifier underLimit() {
        if (_phase != Phase.Open) {
            require(_contributorToAmount[msg.sender] + msg.value <= _contributionLimit, 'Error: More than contribution limit');
        }
        
        require(getBalance() <= _phaseLimit, 'Error: Phase limit over');
        _;
    }


    constructor(uint initialSupply) ERC20("SpaceCoin", "WSPC") {
        _mint(msg.sender, initialSupply);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getPhase() external view returns (Phase) {
        return _phase;
    }

    function getPhaseLimit() external view returns (uint) {
        return _phaseLimit;
    }

    function getContributionLimit() external view returns (uint) {
        return _contributionLimit;
    }

    function setPhase(Phase phase) external onlyOwner {
        require(phase > _phase, 'Error: Only Forward Phase is allowed');

        _phase = phase;
        _phaseLimit = 3000 ether;
        _contributionLimit = 600 ether;
    }

    function chargeTax() external onlyOwner {
        _transferTax = !_transferTax;
    }

    function addWhitelisted(address _address) external onlyOwner {
        if (_whiteListedAddress[_address] == false) {
            _whiteListedAddress[_address] = true;
            _contributorToAmount[_address] = 0;
        }
    }

    function contribute() public payable isWhitelisted underLimit {
        _contributorToAmount[msg.sender] += msg.value;
    }

    function tokenTransfer() public {
        require(_contributorToAmount[msg.sender] > 0, 'Error: Invalid address or have not contributed any amount');
        
        _approve(this.owner(), msg.sender, _contributorToAmount[msg.sender] * 5);
        transferFrom(this.owner(), msg.sender, _contributorToAmount[msg.sender] * 5);
    }

    function getByAddress(address _address) external view returns (uint) {
        return _contributorToAmount[_address];
    }

}
