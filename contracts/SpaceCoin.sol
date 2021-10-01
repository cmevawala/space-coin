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

    bool private _pause = false;
    
    uint private PHASE_LIMIT = 1500 ether;
    uint private CONTRIBUTION_LIMIT = 300 ether;

    Phase private _phase = Phase.Seed;

    mapping(address => bool) private _whiteListedAddress;
    mapping(address => uint) private _contributorToAmount;

    event AddedToWhiteList(string message, address sender);
    event ContributionSuccess(string message, uint amount);
    event TokenTransfered(string message);

    modifier isWhitelisted() {
        if (_phase == Phase.Seed) {
            require(_whiteListedAddress[msg.sender], 'Error: Address not in whitelist');
        }
        _;
    }

    modifier underLimit() {
        if (_phase != Phase.Open) {
            require(_contributorToAmount[msg.sender] + msg.value <= CONTRIBUTION_LIMIT, 'Error: More than contribution limit');
        }
        
        require(getBalance() <= PHASE_LIMIT, 'Error: Phase limit over');
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
        return PHASE_LIMIT;
    }

    function getContributionLimit() external view returns (uint) {
        return CONTRIBUTION_LIMIT;
    }

    function setPhase(Phase phase) external onlyOwner {
        require(phase > _phase, 'Error: Only Forward Phase is allowed');

        _phase = phase;
        PHASE_LIMIT = 3000 ether;
        CONTRIBUTION_LIMIT = 600 ether;
    }

    function addWhitelisted(address _address) external onlyOwner {
        if (_whiteListedAddress[_address] == false) {
            _whiteListedAddress[_address] = true;
            _contributorToAmount[_address] = 0;
            emit AddedToWhiteList("Address Whitelisted", msg.sender);
        }
    }

    function contribute() public payable isWhitelisted underLimit {
        _contributorToAmount[msg.sender] += msg.value;
        emit ContributionSuccess("Contribution Received", msg.value);
    }

    function tokenTransfer() public {
        require(_phase == Phase.Open, 'Error: Cannot redeem in current Phase');
        require(_contributorToAmount[msg.sender] > 0, 'Error: Invalid address or have not contributed any amount');

        uint contributedAmount = _contributorToAmount[msg.sender];
        _contributorToAmount[msg.sender] = 0;
        
        _approve(this.owner(), msg.sender, contributedAmount * 5);
        transferFrom(this.owner(), msg.sender, contributedAmount * 5);

        emit TokenTransfered("Token has been transferred");
    }

}
