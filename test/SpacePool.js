const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe.only('SpaceCoinICO - Withdraw - Space Pool', function () {

    let SpaceRouterContract;
    let spaceRouter;
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
    let depositors

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        [owner, ...depositors] = await ethers.getSigners();

        TreasuryContract = await ethers.getContractFactory('Treasury');
        treasury = await TreasuryContract.deploy();

        SpaceCoinICOContract = await ethers.getContractFactory('SpaceCoinICO');
        spaceCoinICO = await SpaceCoinICOContract.deploy(treasury.address);

        SpaceCoinContract = await ethers.getContractFactory('SpaceCoin');
        spaceCoin = await SpaceCoinContract.deploy(spaceCoinICO.address, treasury.address);

        

        WETHContract = await ethers.getContractFactory('WETH');
        weth = await WETHContract.deploy();

        SpacePoolContract = await ethers.getContractFactory('SpacePool');
        spacePool = await SpacePoolContract.deploy();

        SpaceRouterContract = await ethers.getContractFactory('SpaceRouter');
        spaceRouter = await SpaceRouterContract.deploy(spacePool.address, spaceCoin.address);


        spaceCoinICO.setWETHAddress(weth.address);
        spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
        spaceCoinICO.setSpacePoolAddress(spacePool.address);
    });

    it("should add the liquidity to the SPC-ETH pool", async function() {
        await spaceCoinICO.addWhitelisted(depositors[21].address);
        let overrides = { value: parseEther('1500') }
        await spaceCoinICO.connect(depositors[21]).contribute(overrides);

        await spaceCoinICO.setGeneralPhase();
        overrides = { value: parseEther('1000') };
        await spaceCoinICO.connect(depositors[22]).contribute(overrides)

        await spaceCoinICO.setOpenPhase();
        overrides = { value: parseEther('500') };
        await spaceCoinICO.connect(depositors[22]).contribute(overrides)

        await spaceCoinICO.connect(depositors[21]).redeem();
        expect(formatEther(await spaceCoin.balanceOf(depositors[21].address))).to.equal('7500.0'); // 7500 D21 => SPC
        expect(formatEther(await spaceCoin.balanceOf(depositors[22].address))).to.equal('7500.0'); // 7500 D22 => SPC

        // ON WITHDRAW DO WE HAVE TO MOVE 25000 worth of SPC as Initial Pool Reserves
        await spaceCoinICO.withdraw();
        
        expect(formatEther(await spacePool.getBalance())).to.equal('3000.0'); // 5000 Pool => ETH
        expect(formatEther(await weth.balanceOf(spacePool.address))).to.equal('3000.0'); // 25000 Pool => WETH
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15000.0'); // 25000 Pool => SPC
        expect(formatEther(await spaceCoin.balanceOf(spaceCoinICO.address))).to.equal('120000.0'); // 150,000 - 15000 - 15000 = 120,000


        overrides = { value: parseEther('5') };
        await spaceRouter.connect(depositors[21]).addLiquidity(weth.address, spaceCoin.address, parseUnits("5"), parseUnits("25"), depositors[21].address, overrides);
        expect(formatEther(await spaceCoin.balanceOf(depositors[21].address))).to.equal('7475.0');
        // expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15025.0');
        
    });
});
