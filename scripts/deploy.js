const { formatUnits, parseUnits } = require('ethers/lib/utils');
const hre = require('hardhat');

async function main() {
  // // Project ICO: We get the contract to deploy
  // const SpaceCoin = await hre.ethers.getContractFactory('SpaceCoin');
  // const spacecoin = await SpaceCoin.deploy(parseUnits("500000"));
  // await spacecoin.deployed();
  // console.log('SpaceCoin deployed to:', spacecoin.address);
  

  // Project SpacePool
  const Treasury = await hre.ethers.getContractFactory('Treasury');
  const treasury = await Treasury.deploy();

  await treasury.deployed();
  console.log('Treasury deployed to:', treasury.address);


  const SpaceCoinICO = await hre.ethers.getContractFactory('SpaceCoinICO');
  const spaceCoinICO = await SpaceCoinICO.deploy(treasury.address);

  await spaceCoinICO.deployed();
  console.log('SpaceCoinICO deployed to:', spaceCoinICO.address);


  const SpaceCoin = await hre.ethers.getContractFactory('SpaceCoin');
  const spaceCoin = await SpaceCoin.deploy(spaceCoinICO.address, treasury.address);

  await spaceCoin.deployed();
  console.log('SpaceCoin deployed to:', spaceCoin.address);


  const SpacePoolCoin = await hre.ethers.getContractFactory('SpacePoolCoin');
  const spacePoolCoin = await SpacePoolCoin.deploy();

  await spacePoolCoin.deployed();
  console.log('SpacePoolCoin deployed to:', spacePoolCoin.address);


  let overrides = { gasLimit: 5000000 }
  const SpacePool = await hre.ethers.getContractFactory('SpacePool');
  const spacePool = await SpacePool.deploy(spaceCoin.address, spacePoolCoin.address, overrides);

  await spacePool.deployed();
  console.log('SpacePool deployed to:', spacePool.address);


  const SpaceRouter = await hre.ethers.getContractFactory('SpaceRouter');
  const spaceRouter = await SpaceRouter.deploy(spacePool.address, spaceCoin.address, overrides);

  await spaceRouter.deployed();
  console.log('SpaceRouter deployed to:', spaceRouter.address);
  

  spaceCoinICO.setSpaceCoinAddress(spaceCoin.address);
  spaceCoinICO.setSpacePoolAddress(spacePool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });