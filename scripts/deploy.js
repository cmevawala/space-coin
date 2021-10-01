const { formatUnits, parseUnits } = require('ethers/lib/utils');
const hre = require('hardhat');

async function main() {
  // We get the contract to deploy
  const SpaceCoin = await hre.ethers.getContractFactory('SpaceCoin');
  const spacecoin = await SpaceCoin.deploy(parseUnits("500000"));

  await spacecoin.deployed();

  console.log('SpaceCoin deployed to:', spacecoin.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });