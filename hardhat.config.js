require('dotenv').config();
require('@nomiclabs/hardhat-waffle');

const { task } = require('hardhat/config');
// require("hardhat-gas-reporter");

task('accounts', 'Print the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.7',
  networks: {
    hardhat: {
      accounts: {
        count: 40,
      },
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.RINKEBY_PK_1]
    },
  },
};
