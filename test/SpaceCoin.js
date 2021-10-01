const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe.only('SpaceCoin Token', function () {
  let SpaceCoinContract;
  let spaceCoin;
  let owner, w1;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1] = await ethers.getSigners();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(parseUnits("500000"));

    // expect(formatUnits(await spaceCoin.getBalance())).to.equal("0.0");
    // expect(formatUnits(await w1.getBalance())).to.equal("10000.0");
  });

  it('should have match the owner', async function () {
    expect(await spaceCoin.owner()).to.equal(owner.address)
  });
  
  it('should have name `SpaceCoin`', async function () {
    expect(await spaceCoin.name()).to.equal("SpaceCoin")
  });

  it('should have Symbol `WSPC`', async function () {
    expect(await spaceCoin.symbol()).to.equal("WSPC")
  });

  it('should have total supply of 500,000 coins', async function () {
    expect(formatUnits(await spaceCoin.totalSupply())).to.equal("500000.0")
  });

  it('try adding whitelist same address multiple times', async function () {
    await spaceCoin.addWhitelisted(w1.address);

    let overrides = { value: parseEther('300') };
    await spaceCoin.connect(w1).contribute(overrides);
  
    expect(formatEther(await spaceCoin.getByAddress(w1.address))).to.equal('300.0');

    await spaceCoin.addWhitelisted(w1.address);
    expect(formatEther(await spaceCoin.getByAddress(w1.address))).to.equal('300.0');
  });

  it('should be in a seed phase', async function () {
    expect(formatUnits(await spaceCoin.getPhase())).to.equal("0.0");
    expect(formatUnits(await spaceCoin.getPhaseLimit())).to.equal("1500.0")
    expect(formatUnits(await spaceCoin.getContributionLimit())).to.equal("300.0")
  });
});


describe.only('SpaceCoin Token - Contribution - Seed Phase', function () {
  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let w1, w2, w3, w4, w5, w6, w7, w8;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4, w5, w6, w7, w8] = await ethers.getSigners();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(parseUnits("500000"));
  });

  it('should allow individual contribution upto 300 ETH in Seed Phase', async function () {
    await spaceCoin.addWhitelisted(w1.address);
  
    let overrides = { value: parseEther('300') };
    await spaceCoin.connect(w1).contribute(overrides);
  
    expect(formatEther(await spaceCoin.getBalance())).to.equal('300.0');
  });
  
  it('should not allow to contribute other than the whitelisted address in Seed Phase', async function () {
    await spaceCoin.addWhitelisted(w1.address);
  
    let overrides = { value: parseEther('300') };
    await expect(spaceCoin.connect(w2).contribute(overrides)).to.be.revertedWith('Error: Address not in whitelist');
  });
  
  it('should not allow individual contribution more than 300 ETH in Seed Phase', async function () {
    await spaceCoin.addWhitelisted(w1.address);
    
    let overrides = { value: parseEther('310') };
    await expect(spaceCoin.connect(w1).contribute(overrides)).to.be.revertedWith('Error: More than contribution limit');
  });
  
  it('should not allow total contribution more than 1500 ETH in Seed Phase', async function () {
    
    await spaceCoin.addWhitelisted(w1.address);
    await spaceCoin.addWhitelisted(w2.address);
    await spaceCoin.addWhitelisted(w3.address);
    await spaceCoin.addWhitelisted(w4.address);
    await spaceCoin.addWhitelisted(w5.address);
    await spaceCoin.addWhitelisted(w6.address);

    let overrides = { value: parseEther('300') };

    await spaceCoin.connect(w1).contribute(overrides)
    await spaceCoin.connect(w2).contribute(overrides)
    await spaceCoin.connect(w3).contribute(overrides)
    await spaceCoin.connect(w4).contribute(overrides)
    
    overrides = { value: parseEther('160') };
    await spaceCoin.connect(w5).contribute(overrides)

    await expect(spaceCoin.connect(w6).contribute(overrides)).to.be.revertedWith('Error: Phase limit over');
    expect(formatEther(await spaceCoin.getBalance())).to.equal('1360.0');
  });
  
});


describe.only('SpaceCoin Token - Change Phase', function () {
  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let w1, w2, w3, w4;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4] = await ethers.getSigners();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(parseUnits("500000"));

  });

  it('should forward from Seed to General Phase', async function () {
    await spaceCoin.setPhase(1);
  
    expect(await spaceCoin.getPhase()).to.equal(1);
    expect(formatUnits(await spaceCoin.getPhaseLimit())).to.equal("3000.0")
    expect(formatUnits(await spaceCoin.getContributionLimit())).to.equal("600.0")
  });
  
  it('should forward from General to Open Phase', async function () {
    await spaceCoin.setPhase(2);
    
    expect(await spaceCoin.getPhase()).to.equal(2);

    let overrides = { value: parseEther('2000') };
    await spaceCoin.connect(w3).contribute(overrides)
  
    expect(formatEther(await spaceCoin.getBalance())).to.equal('2000.0');
  });
  
  it('should not allow to backward Phase', async function () {
    await spaceCoin.setPhase(1);
    await expect(spaceCoin.setPhase(0)).to.be.revertedWith('Error: Only Forward Phase is allowed');
  });
  
  it('should not allow others to forward to General Phase', async function () {
    await expect(spaceCoin.connect(w3).setPhase(1)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});


describe.only('SpaceCoin Token - Contribution - General Phase', function () {
  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let g1, g2, g3, g4, g5, g6, g7, g8;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, g1, g2, g3, g4, g5, g6, g7, g8] = await ethers.getSigners();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(parseUnits("500000"));
  });

  it('should allow individual contribution upto 600 ETH in Public Phase', async function () {
    await spaceCoin.setPhase(1);
  
    let overrides = { value: parseEther('600') };
    await spaceCoin.connect(g1).contribute(overrides)
  
    expect(formatEther(await spaceCoin.getBalance())).to.equal('600.0');
  });
  
  it('should not allow individual contribution more than 600 ETH in Public Phase', async function () {
    await spaceCoin.setPhase(1);
   
    let overrides = { value: parseEther('610') };
    await expect(spaceCoin.connect(g1).contribute(overrides)).to.be.revertedWith('Error: More than contribution limit');
  });

  it('should not allow total contribution more than 3000 ETH in Public Phase (Inclusive of Private Contribution)', async function () {
    await spaceCoin.addWhitelisted(g1.address);
    await spaceCoin.addWhitelisted(g2.address);
    await spaceCoin.addWhitelisted(g3.address);
    await spaceCoin.addWhitelisted(g4.address);
    await spaceCoin.addWhitelisted(g5.address);
    await spaceCoin.addWhitelisted(g6.address);

    let overrides = { value: parseEther('300') };
   
    await spaceCoin.connect(g1).contribute(overrides)
    await spaceCoin.connect(g2).contribute(overrides)

    await spaceCoin.setPhase(1);
    
    overrides = { value: parseEther('600') };
   
    await spaceCoin.connect(g3).contribute(overrides)
    await spaceCoin.connect(g4).contribute(overrides)
    await spaceCoin.connect(g5).contribute(overrides)

    overrides = { value: parseEther('350') };
    await spaceCoin.connect(g6).contribute(overrides)

    await expect(spaceCoin.connect(g7).contribute(overrides)).to.be.revertedWith('Error: Phase limit over');

    expect(formatEther(await spaceCoin.getBalance())).to.equal('2750.0');
  });
});


describe.only('SpaceCoin Token - Contribution - Open Phase', function () {

  let SpaceCoinContract;
  let spaceCoin;
  let owner;
  let w1, w2, w3;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3] = await ethers.getSigners();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(parseUnits("500000"));
  });

  it('release tokens', async function () {
    await spaceCoin.addWhitelisted(w1.address);

    let overrides = { value: parseEther('0.000000000000000001') };
    await spaceCoin.connect(w1).contribute(overrides)
    await spaceCoin.connect(w1).contribute(overrides)

    // await spaceCoin.setPhase(2);

    // overrides = { value: parseEther('999.99') };
    // await spaceCoin.connect(w2).contribute(overrides)

    expect(formatEther(await spaceCoin.getBalance())).to.equal('0.000000000000000002');

    await spaceCoin.connect(w1).tokenTransfer();
    // await spaceCoin.connect(w2).tokenTransfer();
    
    expect(formatEther(await spaceCoin.balanceOf(w1.address))).to.equal('0.00000000000000001');
    // expect(formatEther(await spaceCoin.balanceOf(w2.address))).to.equal('4999.95');
  });

  it('release tokens to valid address but have not contributed any amount', async function () {
    await spaceCoin.addWhitelisted(w1.address);

    let overrides = { value: parseEther('0') };
    await spaceCoin.connect(w1).contribute(overrides)
   
    await expect(spaceCoin.connect(w1).tokenTransfer()).to.be.revertedWith('Error: Invalid address or have not contributed any amount');
  });

  it('release tokens to invalid address', async function () {
    await spaceCoin.addWhitelisted(w1.address);

    let overrides = { value: parseEther('50') };
    await spaceCoin.connect(w1).contribute(overrides)
   
    await expect(spaceCoin.connect(w2).tokenTransfer()).to.be.revertedWith('Error: Invalid address or have not contributed any amount');
  });

});
