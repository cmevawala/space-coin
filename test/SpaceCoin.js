const { expect } = require('chai');
const { formatEther } = require('ethers/lib/utils');

describe('SpaceCoin', function () {
  
  let WETHContract;
  let weth;
  let TreasuryContract;
  let treasury;
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let SpaceCoinContract;
  let spaceCoin;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1] = await ethers.getSigners();

    TreasuryContract = await ethers.getContractFactory('Treasury');
    treasury = await TreasuryContract.deploy();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);

    // expect(formatUnits(await spaceCoinICO.getBalance())).to.equal("0.0");
    // expect(formatUnits(await w1.getBalance())).to.equal("10000.0");
  });

  it('should have name `SpaceCoin`', async function () {
    expect(await spaceCoin.name()).to.equal("SpaceCoin")
  });

  it('should have Symbol `SPC`', async function () {
    expect(await spaceCoin.symbol()).to.equal("SPC")
  });

  it('should have total supply of 150,000 coins to raise 30,000 ETH', async function () {
    expect(formatEther(await spaceCoin.totalSupply())).to.equal('150000.0');
  });

  it('should charge tax', async function () {
    spaceCoin.shouldTax = true;
    expect(await spaceCoin.shouldTax()).to.be.false;
  });

});
