// contracts/SpaceCoinICO.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./SpaceCoin.sol";
import "./WrappedETH.sol";
import "./SpacePool.sol";

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

    event AddedToWhiteList(string message, address sender);
    event ContributionSuccess(string message, uint amount);
    event TokenTransfered(string message);

    uint private EXCHANGE_RATE = 5;
    uint private PHASE_LIMIT = 15000 ether;
    uint private CONTRIBUTION_LIMIT = 1500 ether;

    uint private totalContributed;
    mapping(address => bool) private _whiteListedAddress;
    mapping(address => uint) private _contributorToAmount;
    address private _treasury;

    SpaceCoin private _spaceCoin;
    SpacePool private _spacePool;
    WETH private _weth;
    Phase private _phase;

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

    constructor(address treasury) {
        _treasury = treasury;
    }

    // --------------------------------------------------------

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // function balanceOf(address _address) public view returns (uint) {
    //     return _spaceCoin.balanceOf(_address);
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

    function setSpaceCoinAddress(SpaceCoin spaceCoin) external {
        // Set Address only once
        _spaceCoin = spaceCoin;
    }

    function setSpacePoolAddress(SpacePool spacePool) external {
        // Set Address only once
        _spacePool = spacePool;
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
            return (_spaceCoin.balanceOf(address(this)) / EXCHANGE_RATE);
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

        _spaceCoin.transfer(msg.sender, totalCoins);

        emit TokenTransfered("Token has been transferred");
    }

    // function withdraw() external payable {
    //     require(msg.sender == _treasury, "UNAUTHORIZED");
    //     // _weth.mint(msg.sender, address(this).balance / 10 ** 18);
    //     _spaceCoin.transfer(address(_spacePool), address(this).balance * 5);
    //     // (bool successT,) = _treasury.call{ value: address(this).balance }("");
    //     (bool success,) = address(_spacePool).call{ value: address(this).balance }("");
    //     require(success, 'WITHDRAW_FAILED');
    // }

    function setWETHAddress(address weth) public {
        _weth = WETH(weth);
    }

    function withdraw() external payable onlyOwner {

        _spaceCoin.mint(address(_spacePool), (address(this).balance / 10 ** 18) * 5);
        
        _weth.mint(address(_spacePool), address(this).balance / 10 ** 18);
        (bool success, ) = address(_spacePool).call{ value: address(this).balance }("");
        
        require(success, 'WITHDRAW_FAILED');
    }

}
