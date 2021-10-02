const { expect } = require('chai');
const {
  formatEther,
  parseEther,
  parseUnits,
  formatUnits,
} = require('ethers/lib/utils');

describe.only('SpaceCoin', function () {
  let SpaceCoinContract;
  let SpaceCoinICOContract;
  let spaceCoin;
  let spaceCoinICO;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1] = await ethers.getSigners();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address);

    // expect(formatUnits(await spaceCoinICO.getBalance())).to.equal("0.0");
    // expect(formatUnits(await w1.getBalance())).to.equal("10000.0");
  });

  it('should have name `SpaceCoinICO`', async function () {
    expect(await spaceCoin.name()).to.equal("SpaceCoin")
  });

  it('should have Symbol `SPC`', async function () {
    expect(await spaceCoin.symbol()).to.equal("SPC")
  });

  it('should have total supply of 150,000 coins to raise 30,000 ETH', async function () {
    expect(formatEther(await spaceCoin.totalSupply())).to.equal('150000.0');
  });
  
});
