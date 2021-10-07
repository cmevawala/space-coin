const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe('SpaceCoinICO - Contribution/Withdraw - Open Phase', function () {

    let WETHContract;
    let weth;
    let TreasuryContract;
    let treasury;
    let SpaceCoinICOContract;
    let spaceCoinICO;
    let SpaceCoinContract;
    let spaceCoin;
    let owner;
    let w1, w2, w3;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        [owner, w1, w2, w3] = await ethers.getSigners();

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
        treasury.setSpaceCoinICOAddress(spaceCoinICO.address);
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

    it('should allow to transfer tokens', async function () {
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

        await spaceCoin.tokenTrasfer(w1.address, treasury.address, parseUnits('100'));
        expect(formatEther(await spaceCoin.balanceOf(w1.address))).to.equal('7400.0');

        await spaceCoin.tokenTrasfer(w2.address, treasury.address, parseUnits('100'));
        expect(formatEther(await spaceCoin.balanceOf(w2.address))).to.equal('4899.95');

        // expect(formatEther(await spaceCoin.balanceOf(treasury.address))).to.equal('150200.0');
    });

    // it('should allow the treasury to withdraw the tokens', async function () {
    //     await spaceCoinICO.addWhitelisted(w1.address);

    //     let overrides = { value: parseEther('1500') };
    //     await spaceCoinICO.connect(w1).contribute(overrides)

    //     await spaceCoinICO.setGeneralPhase();
    //     overrides = { value: parseEther('999.99') };
    //     await spaceCoinICO.connect(w2).contribute(overrides)

    //     expect(formatEther(await spaceCoinICO.getBalance())).to.equal('2499.99');
    //     await spaceCoinICO.setOpenPhase();

    //     await treasury.withdrawFromICO();
    //     expect(formatEther(await treasury.getBalance())).to.equal('2499.99');
    // });

    // it('should not allow redeem tokens in other than open phase', async function () {
    //   await spaceCoinICO.addWhitelisted(w1.address);

    //   let overrides = { value: parseEther('1500') };
    //   await spaceCoinICO.connect(w1).contribute(overrides)

    //   await expect(spaceCoinICO.connect(w1).redeem()).to.be.revertedWith('Error: Cannot redeem in current Phase');
    // });

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


describe('SpaceCoinICO - Withdraw - Space Pool', function () {

    let SpacePoolContract;
    let spacePool;
    let WETHContract;
    let weth;
    let TreasuryContract;
    let treasury;
    let SpaceCoinICOContract;
    let spaceCoinICO;
    let SpaceCoinContract;
    let spaceCoin;
    let owner;
    let w

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        [owner, ...w] = await ethers.getSigners();

        SpacePoolContract = await ethers.getContractFactory('SpacePool');
        spacePool = await SpacePoolContract.deploy();
        
        WETHContract = await ethers.getContractFactory('WETH');
        weth = await WETHContract.deploy();

        TreasuryContract = await ethers.getContractFactory('Treasury');
        treasury = await TreasuryContract.deploy();

        SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
        spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);

        SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
        spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);

        spaceCoinICO.setWETHAddress(weth.address);
        spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
        spaceCoinICO.setSpacePoolAddress(spacePool.address);
        
        treasury.setSpaceCoinICOAddress(spaceCoinICO.address);
    });

    // it('should mint WETH when the treasury withdraw from ICO', async function () {
        
    //     expect(formatEther(await spaceCoin.balanceOf(spaceCoinICO.address))).to.equal('150000.0'); // SPC: (ICO => 150,000)
        
    //     await spaceCoinICO.addWhitelisted(w[11].address);

    //     let overrides = { value: ethers.utils.parseEther('1500') }
    //     await spaceCoinICO.connect(w[11]).contribute(overrides);

    //     await spaceCoinICO.setGeneralPhase();
    //     overrides = { value: parseEther('1000') };
    //     await spaceCoinICO.connect(w[12]).contribute(overrides)

    //     await spaceCoinICO.setOpenPhase();
    //     overrides = { value: parseEther('2500') };
    //     await spaceCoinICO.connect(w[12]).contribute(overrides) // ETH: (ICO => 5000), SPC: 5000 * 5 = 125,000 will be redeemed

    //     await spaceCoinICO.connect(w[11]).redeem();
    //     expect(formatEther(await spaceCoin.balanceOf(spaceCoinICO.address))).to.equal('112500.0'); // 150,000 - 7500

    //     await spaceCoinICO.connect(w[12]).redeem();
    //     expect(formatEther(await spaceCoin.balanceOf(spaceCoinICO.address))).to.equal('137500.0'); // 150,000 - 7500 - 5000, SPC: (ICO => 137,500)

    //     // expect(formatEther(await spaceCoinICO.getBalance())).to.equal('2500.0'); // ETH Raised in ICO

    //     // await treasury.withdrawFromICO();
    //     // expect(formatEther(await weth.balanceOf(treasury.address))).to.equal('2500.0'); // ETH withdrawn to Treasury and minted WETH for SPC Pool

    //     // await treasury.transferWETH(spacePool.address, parseEther('2500'));
    //     // expect(formatEther(await weth.balanceOf(spacePool.address))).to.equal('2500.0'); // SPC Pool has now WETH 2500

    //     // expect(formatEther(await spaceCoin.balanceOf(treasury.address))).to.equal('149500.0');
    // });

    it('should withdraw funds from ICO to Space Pool', async function () {
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('0.0');

        await spaceCoinICO.addWhitelisted(w[11].address);

        let overrides = { value: ethers.utils.parseEther('1500') }
        await spaceCoinICO.connect(w[11]).contribute(overrides);

        await spaceCoinICO.setGeneralPhase();
        overrides = { value: parseEther('1000') };
        await spaceCoinICO.connect(w[12]).contribute(overrides)

        await spaceCoinICO.setOpenPhase();
        overrides = { value: parseEther('2500') };
        await spaceCoinICO.connect(w[12]).contribute(overrides)

        await spaceCoinICO.connect(w[11]).redeem();
        expect(formatEther(await spaceCoin.balanceOf(spaceCoinICO.address))).to.equal('125000.0'); // 150,000 - 25000

        expect(formatEther(await spaceCoin.balanceOf(w[11].address))).to.equal('7500.0'); // 7500 W11 => SPC

        expect(formatEther(await spaceCoin.balanceOf(w[12].address))).to.equal('17500.0'); // 17500 W12 => ETH

        await spaceCoinICO.withdraw();
        
        expect(formatEther(await spacePool.getBalance())).to.equal('5000.0'); // 5000 Pool => ETH
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('25000.0'); // 25000 Pool => SPC

        expect(formatEther(await weth.balanceOf(spacePool.address))).to.equal('5000.0'); // 25000 Pool => ETH
    });

});
