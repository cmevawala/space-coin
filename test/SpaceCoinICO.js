const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe.only('SpaceCoinICO', function () {
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let owner, w1;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1] = await ethers.getSigners();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address);

    spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);

  });

  it('should have match the owner', async function () {
    expect(await spaceCoinICO.owner()).to.equal(owner.address)
  });

  it('try adding whitelist same address multiple times', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    await expect(spaceCoinICO.addWhitelisted(w1.address)).to.be.revertedWith('Already Whitelisted');
  });

  it('should be in a seed phase', async function () {
    expect(formatUnits(await spaceCoinICO.currentPhase())).to.equal("0.0");
    expect(formatUnits(await spaceCoinICO.getPhaseLimit())).to.equal("15000.0")
    expect(formatUnits(await spaceCoinICO.getContributionLimit())).to.equal("1500.0")
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


describe.only('SpaceCoinICO - Contribution - Seed Phase', function () {
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let owner;
  let w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12] = await ethers.getSigners();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address);

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
  
});


describe.only('SpaceCoinICO - Change Phase', function () {
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let owner;
  let w1, w2, w3, w4;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4] = await ethers.getSigners();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address);

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


describe.only('SpaceCoinICO - Contribution - General Phase', function () {
  let SpaceCoinICOContract;
  let spaceCoinICO;
  let owner;
  let w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16] = await ethers.getSigners();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address);

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


describe.only('SpaceCoinICO - Contribution - Open Phase', function () {

  let SpaceCoinICOContract;
  let spaceCoinICO;
  let owner;
  let w1, w2, w3;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, w1, w2, w3] = await ethers.getSigners();

    SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
    spaceCoinICO = await SpaceCoinICOContract.deploy();

    SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
    spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address);

    spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
  });

  it('should allow redeem tokens', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('1500') };
    await spaceCoinICO.connect(w1).contribute(overrides)
    
    await spaceCoinICO.setGeneralPhase();
    overrides = { value: parseEther('999.99') };
    await spaceCoinICO.connect(w2).contribute(overrides)

    expect(formatEther(await spaceCoinICO.getBalance())).to.equal('2499.99');
    await spaceCoinICO.setOpenPhase();

    await spaceCoinICO.connect(w1).redeem();
    await spaceCoinICO.connect(w2).redeem();
    
    expect(formatEther(await spaceCoin.balanceOf(w1.address))).to.equal('7500.0');
    expect(formatEther(await spaceCoin.balanceOf(w2.address))).to.equal('4999.95');
  });

  it('should not allow redeem tokens in other than open phase', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('1500') };
    await spaceCoinICO.connect(w1).contribute(overrides)

    await expect(spaceCoinICO.connect(w1).redeem()).to.be.revertedWith('Error: Cannot redeem in current Phase');
  });

  it('should not allow to redeem token by a valid address who have not contributed any amount', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('0') };
    await spaceCoinICO.connect(w1).contribute(overrides)

    await spaceCoinICO.setGeneralPhase();
    await spaceCoinICO.setOpenPhase();
   
    await expect(spaceCoinICO.connect(w1).redeem()).to.be.revertedWith('Error: Invalid address or have not contributed any amount');
  });

  it('should not allow to redeem token by a an invalid address', async function () {
    await spaceCoinICO.addWhitelisted(w1.address);

    let overrides = { value: parseEther('50') };
    await spaceCoinICO.connect(w1).contribute(overrides)

    await spaceCoinICO.setGeneralPhase();
    await spaceCoinICO.setOpenPhase();
   
    await expect(spaceCoinICO.connect(w2).redeem()).to.be.revertedWith('Error: Invalid address or have not contributed any amount');
  });

});
