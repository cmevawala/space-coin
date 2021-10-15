const { expect } = require('chai');
const { formatEther, parseEther, parseUnits, formatUnits } = require('ethers/lib/utils');

describe.only('Space Pool', function () {

    let SpacePoolCoinContract;
    let spacePoolCoin;
    let SpaceRouterContract;
    let spaceRouter;
    let SpacePoolContract;
    let spacePool;
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

        
        SpacePoolContract = await ethers.getContractFactory('SpacePool');
        spacePool = await SpacePoolContract.deploy(spaceCoin.address);

        SpacePoolCoinContract = await ethers.getContractFactory('SpacePoolCoin');
        spacePoolCoin = await SpacePoolCoinContract.deploy(spacePool.address);

        SpaceRouterContract = await ethers.getContractFactory('SpaceRouter');
        spaceRouter = await SpaceRouterContract.deploy(spacePool.address, spaceCoin.address);

        spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
        spaceCoinICO.setSpacePoolAddress(spacePool.address);

        spacePool.setSpacePoolCoinAddress(spacePoolCoin.address);


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
        
        expect(formatEther(await spacePool.getBalance())).to.equal('3000.0'); // 3000 Pool => ETH
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15000.0'); // 15000 Pool => SPC
        expect(formatEther(await spaceCoin.balanceOf(spaceCoinICO.address))).to.equal('120000.0'); // ICO => 150,000 - 15000 - 15000 = 120,000 SPC
    });

    it("should add the liquidity to the SPC-ETH pool", async function() {
        // Deposit: 10ETH, 50SPC
        overrides = { value: parseEther('10') };
        await spaceRouter.connect(depositors[21]).addLiquidity(parseUnits("50"), overrides);
        expect(formatEther(await spaceCoin.balanceOf(depositors[21].address))).to.equal('7450.0'); // Depositor: 7500 - 50 SPC
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15050.0'); // Pool: 15000 + 50 SPC

        expect(formatEther(await spacePool.getBalance())).to.equal('3010.0'); // Pool: 3000 + 10 ETH
        expect(formatEther(await spacePoolCoin.balanceOf(depositors[21].address))).to.equal('3.333333333333333333'); // Depositor: Liquidity Token
    });

    it("should burn the liquidity to the SPC-ETH pool", async function() {
        // Withdraw: 10ETH, 50SPC
        overrides = { value: parseEther('10') };
        await spaceRouter.connect(depositors[21]).addLiquidity(parseUnits("50"), overrides);

        await spaceRouter.connect(depositors[21]).removeLiquidity(overrides);
        expect(formatEther(await spaceCoin.balanceOf(depositors[21].address))).to.equal('7499.999999999999999995'); // Depositor: 7500 + 50 SPC
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15000.000000000000000005'); // Pool: 15000 - 50 SPC

        expect(formatEther(await spacePool.getBalance())).to.equal('3000.000000000000000001'); // Pool: 3000 - 10 ETH
        expect(formatEther(await spacePoolCoin.balanceOf(depositors[21].address))).to.equal('0.0'); // Depositor: Liquidity Token
    });

    it("should return the SPC when trading 1 ETH in SPC-ETH pool", async function() {

        overrides = { value: parseEther('10') };
        await spaceRouter.connect(depositors[21]).addLiquidity(parseUnits("50"), overrides); // ETH = 3010, SPC = 15050

        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15050.0'); // Pool: SPC

        overrides = { value: parseEther('1') };
        await spaceRouter.connect(depositors[22]).swapTokens(parseUnits("0"), overrides); // Trade 1 ETH


        expect(formatEther(await spaceCoin.balanceOf(depositors[22].address))).to.equal('7504.948372462213424821'); // Pool: SPC

        expect(formatEther(await spacePool.getBalance())).to.equal('3010.99'); // Pool: ETH
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15045.051627537786575179'); // Pool: SPC
    });

    it("should return the ETH when trading 50 SPC in SPC-ETH pool", async function() {
        overrides = { value: parseEther('10') };
        await spaceRouter.connect(depositors[21]).addLiquidity(parseUnits("50"), overrides); // ETH = 3010, SPC = 15050

        // expect(formatEther(await depositors[22].getBalance())).to.equal('8499.999846159824947863'); // Depositor: ETH
        await spaceRouter.connect(depositors[22]).swapTokens(parseUnits("20")); // Trade 20 SPC

        expect(formatEther(await spaceCoin.balanceOf(depositors[22].address))).to.equal('7480.0'); // Depositor: 7500 - 20 SPC
        
        expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15070.0'); // Pool: SPC: 15050 + 19.8
        expect(formatEther(await spacePool.getBalance())).to.equal('3006.045202988758974903'); // Pool: ETH
    });

    it("should fail with invalid trade when nether ETH nor SPC is supplied", async function() {
        await expect(spaceRouter.connect(depositors[22]).swapTokens(0)).to.be.revertedWith('INVALID_TRADE');
    });

    it("should fail with slippage limit exceeded", async function() {
        overrides = { value: parseEther('10') };
        await spaceRouter.connect(depositors[21]).addLiquidity(parseUnits("50"), overrides); // ETH = 3010, SPC = 15050

        await expect(spaceRouter.connect(depositors[22]).swapTokens(parseUnits("30"))).to.be.revertedWith('EXCEDDED_SLIPPAGE_LIMIT');
    });

    // it("should maintain the ratio of ETH-SPC", async function() {
    //     overrides = { value: parseEther('5') };

    //     await spaceRouter.connect(depositors[22]).addLiquidity(parseUnits("26"), overrides); // ETH = 3010, SPC = 15050

    //     expect(formatEther(await spaceCoin.balanceOf(spacePool.address))).to.equal('15025.0'); // Pool: SPC
    // });

    // it("should quote the between of ETH-SPC", async function() {
    //     let values = await spaceRouter.quote(parseUnits("1"), parseUnits("6")); // actualB < desriredB
    //     expect(formatEther(values.amountA)).to.equal('1.0');
    //     expect(formatEther(values.amountB)).to.equal('5.0');

    //     values = await spaceRouter.quote(parseUnits("1"), parseUnits("3")); // actualB > desriredB
    //     expect(formatEther(values.amountA)).to.equal('0.6');
    //     expect(formatEther(values.amountB)).to.equal('3.0');
    // });
});
