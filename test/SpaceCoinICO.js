const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe('SpaceCoinICO', function () {
  
  let WETHContract;
  let weth;
  let TreasuryContract;
  let treasury;
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let SpaceCoinContract;
  let spaceCoin;
  let owner, w1;
  
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1] = await ethers.getSigners();

    WETHContract = await ethers.getContractFactory('WETH');
    weth = await WETHContract.deploy();

    TreasuryContract = await ethers.getContractFactory('Treasury');
    treasury = await TreasuryContract.deploy();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);

    // spaceCoinICO.setWETHAddress(weth.address);
    spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
  });

  it('should have match the owner', async function () {
    expect(await spaceCoinICO.owner()).to.equal(owner.address)
  });

  it('should be in a seed phase', async function () {
    expect(formatUnits(await spaceCoinICO.currentPhase())).to.equal("0.0");
    expect(formatUnits(await spaceCoinICO.getPhaseLimit())).to.equal("15000.0")
    expect(formatUnits(await spaceCoinICO.getContributionLimit())).to.equal("1500.0")
  });

  it('try adding same whitelisted address multiple times', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    await expect(spaceCoinICO.addWhitelisted(w1.address)).to.be.revertedWith('Already Whitelisted');
  });

  it('should pause/unpause the offerings when pause is called by owner', async function () {
    await spaceCoinICO.pause();
    expect(await spaceCoinICO.paused()).to.be.true;

    await spaceCoinICO.unpause();
    expect(await spaceCoinICO.paused()).to.be.false;
  });

  it('should throw error when performing any operations in pause mode', async function () {
    await spaceCoinICO.pause();
    await expect(spaceCoinICO.setGeneralPhase()).to.be.revertedWith('Pausable: paused');
  });
});

describe('SpaceCoinICO - Change Phase', function () {
  
  let WETHContract;
  let weth;
  let TreasuryContract;
  let treasury;
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let w1, w2, w3, w4;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4] = await ethers.getSigners();

    WETHContract = await ethers.getContractFactory('WETH');
    weth = await WETHContract.deploy();

    TreasuryContract = await ethers.getContractFactory('Treasury');
    treasury = await TreasuryContract.deploy();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);

    // spaceCoinICO.setWETHAddress(weth.address);
    spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
  });

  it('should forward from Seed to General Phase', async function () {
    await spaceCoinICO.setGeneralPhase();
  
    expect(await spaceCoinICO.currentPhase()).to.equal(1);
    expect(formatUnits(await spaceCoinICO.getPhaseLimit())).to.equal("30000.0")
    expect(formatUnits(await spaceCoinICO.getContributionLimit())).to.equal("1000.0")
  });
  
  it('should forward from General to Open Phase', async function () {
    await spaceCoinICO.setGeneralPhase();
    await spaceCoinICO.setOpenPhase();
    
    expect(await spaceCoinICO.currentPhase()).to.equal(2);

    let overrides = { value: parseEther('2000') };
    await spaceCoinICO.connect(w3).contribute(overrides)
  
    expect(formatEther(await spaceCoinICO.getBalance())).to.equal('2000.0');
  });
  
  it('should not allow others to forward to General Phase', async function () {
    await expect(spaceCoinICO.connect(w3).setGeneralPhase()).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
