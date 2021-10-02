// contracts/SpaceCoinICO.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./SpaceCoin.sol";

enum Phase {
    Seed,
    General,
    Open
}

contract SpaceCoinICO is Ownable, Pausable {

    // TODO: When Buy, calculate the amount of Tokens at the fixed exchange rate and kept it in lock

    /* Que: 
        What is address(0) 
    */

    uint private EXCHANGE_RATE = 5;
    uint private PHASE_LIMIT = 15000 ether;
    uint private CONTRIBUTION_LIMIT = 1500 ether;

    SpaceCoin spaceCoin;
    Phase private _phase;

    uint private totalContributed;
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

    // --------------------------------------------------------

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // function balanceOf(address _address) public view returns (uint) {
    //     return spaceCoin.balanceOf(_address);
    // }

    function currentPhase() external view returns (Phase) {
        return _phase;
    }

    function getPhaseLimit() external view returns (uint) {
        return PHASE_LIMIT;
    }

    // --------------------------------------------------------

    function getContributionLimit() external view returns (uint) {
        return CONTRIBUTION_LIMIT;
    }

    function setSpaceCoinAddress(SpaceCoin _spaceCoin) external {
        // Set Address only once
        spaceCoin = _spaceCoin;
    }

    function setGeneralPhase() external onlyOwner whenNotPaused {
        require(_phase == Phase.Seed, 'Error: Only Forward Phase is allowed');
        
        _phase = Phase.General;

        PHASE_LIMIT = 30000 ether;
        CONTRIBUTION_LIMIT = 1000 ether;
    }

    function setOpenPhase() external onlyOwner whenNotPaused {
        require(_phase == Phase.General, 'Error: Only Forward Phase is allowed');
        _phase = Phase.Open;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --------------------------------------------------------

    function addWhitelisted(address _address) external onlyOwner whenNotPaused {
        require(_whiteListedAddress[_address] == false, 'Already Whitelisted');

        _whiteListedAddress[_address] = true;
        _contributorToAmount[_address] = 0;

        emit AddedToWhiteList("Address Whitelisted", msg.sender);
    }

    function phaseRemaingCapacity() public view returns (uint) {
        if (_phase != Phase.Open) {
            return PHASE_LIMIT - totalContributed; // 1500 WEI - 300 WEI
        } else {
            return (spaceCoin.balanceOf(address(this)) / EXCHANGE_RATE);
        }
    }

    function contribute() public payable isWhitelisted underLimit {
        _contributorToAmount[msg.sender] += msg.value;
        totalContributed += msg.value;

        if (_phase == Phase.Open) {
            redeem();
        }

        emit ContributionSuccess("Contribution Received", msg.value);
    }

    function redeem() public {
        require(_phase == Phase.Open, 'Error: Cannot redeem in current Phase');
        require(_contributorToAmount[msg.sender] > 0, 'Error: Invalid address or have not contributed any amount');

        uint totalCoins = _contributorToAmount[msg.sender] * EXCHANGE_RATE;
        _contributorToAmount[msg.sender] = 0;

        // _approve(this.owner(), msg.sender, contributedAmount);
        // transferFrom(this.owner(), msg.sender, contributedAmount);
        spaceCoin.transfer(msg.sender, totalCoins);

        emit TokenTransfered("Token has been transferred");
    }

}
