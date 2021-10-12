const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe('SpaceCoinICO - Contribution - Seed Phase', function () {

  let WETHContract;
  let weth;
  let TreasuryContract;
  let treasury;
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12] = await ethers.getSigners();

    TreasuryContract = await ethers.getContractFactory('Treasury');
    treasury = await TreasuryContract.deploy();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);
    
    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);
    
    spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
  });

  it('should allow individual contribution upto 1500 ETH in Seed Phase', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('1500') };
    await spaceCoinICO.connect(w1).contribute(overrides);

    expect(formatEther(await spaceCoinICO.getBalance())).to.equal('1500.0');
  });

  it('should not allow to contribute other than the whitelisted address in Seed Phase', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('1500') };
    await expect(spaceCoinICO.connect(w2).contribute(overrides)).to.be.revertedWith('Error: Address not in whitelist');
  });

  it('should not allow individual contribution more than 1500 ETH in Seed Phase', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('1501') };
    await expect(spaceCoinICO.connect(w1).contribute(overrides)).to.be.revertedWith('Error: More than contribution limit');
  });

  it('should not allow total contribution more than 15000 ETH in Seed Phase', async function () {

    await spaceCoinICO.addWhitelisted(w1.address);
    await spaceCoinICO.addWhitelisted(w2.address);
    await spaceCoinICO.addWhitelisted(w3.address);
    await spaceCoinICO.addWhitelisted(w4.address);
    await spaceCoinICO.addWhitelisted(w5.address);
    await spaceCoinICO.addWhitelisted(w6.address);
    await spaceCoinICO.addWhitelisted(w7.address);
    await spaceCoinICO.addWhitelisted(w8.address);
    await spaceCoinICO.addWhitelisted(w9.address);
    await spaceCoinICO.addWhitelisted(w10.address);
    await spaceCoinICO.addWhitelisted(w11.address);
    await spaceCoinICO.addWhitelisted(w12.address);

    let overrides = { value: parseEther('1500') };

    await spaceCoinICO.connect(w1).contribute(overrides)
    await spaceCoinICO.connect(w2).contribute(overrides)
    await spaceCoinICO.connect(w3).contribute(overrides)
    await spaceCoinICO.connect(w4).contribute(overrides)
    await spaceCoinICO.connect(w5).contribute(overrides)
    await spaceCoinICO.connect(w6).contribute(overrides)
    await spaceCoinICO.connect(w7).contribute(overrides)
    await spaceCoinICO.connect(w8).contribute(overrides)

    overrides = { value: parseEther('1499') };
    await spaceCoinICO.connect(w9).contribute(overrides)
    await spaceCoinICO.connect(w10).contribute(overrides)

    await expect(spaceCoinICO.connect(w12).contribute(overrides)).to.be.revertedWith('Error: Phase limit over');
    expect(formatEther(await spaceCoinICO.getBalance())).to.equal('14998.0');
  });

  it('should verify remaining capacity after contritbution', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('300') };
    await spaceCoinICO.connect(w1).contribute(overrides);

    expect(formatEther(await spaceCoinICO.phaseRemaingCapacity())).to.equal('14700.0');

    await spaceCoinICO.setGeneralPhase();
    await spaceCoinICO.connect(w1).contribute(overrides);

    expect(formatEther(await spaceCoinICO.phaseRemaingCapacity())).to.equal('29400.0');

    await spaceCoinICO.setOpenPhase();
    await spaceCoinICO.connect(w1).contribute(overrides);

    expect(formatEther(await spaceCoinICO.phaseRemaingCapacity())).to.equal('29100.0');
  });

});


describe('SpaceCoinICO - Contribution - General Phase', function () {

  let WETHContract;
  let weth;
  let TreasuryContract;
  let treasury;
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16] = await ethers.getSigners();

    TreasuryContract = await ethers.getContractFactory('Treasury');
    treasury = await TreasuryContract.deploy();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);

    spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
  });

  it('should allow individual contribution upto 1000 ETH in Public Phase', async function () {
    await spaceCoinICO.setGeneralPhase()

    let overrides = { value: parseEther('1000') };
    await spaceCoinICO.connect(g1).contribute(overrides)

    expect(formatEther(await spaceCoinICO.getBalance())).to.equal('1000.0');
  });

  it('should not allow individual contribution more than 1000 ETH in Public Phase', async function () {
    await spaceCoinICO.setGeneralPhase()

    let overrides = { value: parseEther('1010') };
    await expect(spaceCoinICO.connect(g1).contribute(overrides)).to.be.revertedWith('Error: More than contribution limit');
  });

  it('should not allow total contribution more than 3000 ETH in Public Phase (Inclusive of Private Contribution)', async function () {

    await spaceCoinICO.addWhitelisted(w1.address);
    await spaceCoinICO.addWhitelisted(w2.address);
    await spaceCoinICO.addWhitelisted(w3.address);
    await spaceCoinICO.addWhitelisted(w4.address);
    await spaceCoinICO.addWhitelisted(w5.address);
    await spaceCoinICO.addWhitelisted(w6.address);
    await spaceCoinICO.addWhitelisted(w7.address);
    await spaceCoinICO.addWhitelisted(w8.address);
    await spaceCoinICO.addWhitelisted(w9.address);
    await spaceCoinICO.addWhitelisted(w10.address);

    await spaceCoinICO.addWhitelisted(g1.address);
    await spaceCoinICO.addWhitelisted(g2.address);
    await spaceCoinICO.addWhitelisted(g3.address);
    await spaceCoinICO.addWhitelisted(g4.address);
    await spaceCoinICO.addWhitelisted(g5.address);
    await spaceCoinICO.addWhitelisted(g6.address);
    await spaceCoinICO.addWhitelisted(g7.address);
    await spaceCoinICO.addWhitelisted(g8.address);
    await spaceCoinICO.addWhitelisted(g9.address);
    await spaceCoinICO.addWhitelisted(g10.address);
    await spaceCoinICO.addWhitelisted(g11.address);
    await spaceCoinICO.addWhitelisted(g12.address);
    await spaceCoinICO.addWhitelisted(g13.address); // 10 * 13 = 130
    await spaceCoinICO.addWhitelisted(g14.address);
    await spaceCoinICO.addWhitelisted(g15.address);
    await spaceCoinICO.addWhitelisted(g16.address);

    let overrides = { value: parseEther('1500') };

    await spaceCoinICO.connect(w1).contribute(overrides)
    await spaceCoinICO.connect(w2).contribute(overrides)
    await spaceCoinICO.connect(w3).contribute(overrides)
    await spaceCoinICO.connect(w4).contribute(overrides)
    await spaceCoinICO.connect(w5).contribute(overrides)
    await spaceCoinICO.connect(w6).contribute(overrides)
    await spaceCoinICO.connect(w7).contribute(overrides)
    await spaceCoinICO.connect(w8).contribute(overrides)
    await spaceCoinICO.connect(w9).contribute(overrides)
    await spaceCoinICO.connect(w10).contribute(overrides)


    await spaceCoinICO.setGeneralPhase()

    overrides = { value: parseEther('1000') };

    await spaceCoinICO.connect(g1).contribute(overrides)
    await spaceCoinICO.connect(g2).contribute(overrides)
    await spaceCoinICO.connect(g3).contribute(overrides)
    await spaceCoinICO.connect(g4).contribute(overrides)
    await spaceCoinICO.connect(g5).contribute(overrides)
    await spaceCoinICO.connect(g6).contribute(overrides)
    await spaceCoinICO.connect(g7).contribute(overrides)
    await spaceCoinICO.connect(g8).contribute(overrides)
    await spaceCoinICO.connect(g9).contribute(overrides)
    await spaceCoinICO.connect(g10).contribute(overrides)
    await spaceCoinICO.connect(g11).contribute(overrides)
    await spaceCoinICO.connect(g12).contribute(overrides)
    await spaceCoinICO.connect(g13).contribute(overrides)
    await spaceCoinICO.connect(g14).contribute(overrides)
    await spaceCoinICO.connect(g15).contribute(overrides)

    await expect(spaceCoinICO.connect(g16).contribute(overrides)).to.be.revertedWith('Error: Phase limit over');

    expect(formatEther(await spaceCoinICO.getBalance())).to.equal('30000.0');
  });
});
