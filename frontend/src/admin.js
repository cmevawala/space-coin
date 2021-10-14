import 'regenerator-runtime/runtime';
import { ethers } from 'ethers';
import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json';
import SpaceCoinICOJSON from '../../artifacts/contracts/SpaceCoinICO.sol/SpaceCoinICO.json';
import SpacePoolICOJSON from '../../artifacts/contracts/SpacePool.sol/SpacePool.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// const spaceCoinICOAddr = '0x13eCEaAec0E4f44C601b0042d40c426dd7A9863d';
const spaceCoinICOAddr = '0x9AaCC9e1A5b949970E763DDea64d5fdCE022f00C';
const spaceCoinICO = new ethers.Contract(
  spaceCoinICOAddr,
  SpaceCoinICOJSON.abi,
  provider
);

const spaceCoinAddr = '0xbc77f93cfB1f60eD44fbd75f67D7B3fB345a2535';
const spaceCoin = new ethers.Contract(
  spaceCoinAddr,
  SpaceCoinJSON.abi,
  provider
);

const spacePoolAddr = '0xA83Ea155111cf1a0fd3c3B3588149C14f2976f53';
const spacePool = new ethers.Contract(
  spacePoolAddr,
  SpacePoolICOJSON.abi,
  provider
);

const whitelistAccount = '0xB74C1750e7fC5d54eBBaeeAEE2408fA773B026fA';

// Kick things off
go();

async function go() {
  await connectToMetamask();
}

async function connectToMetamask() {
  try {
    console.log('Signed in');

    const address = await signer.getAddress();

    if (address !== '0xfEEC97FAD402bFaCBD36098ea2cB829CC7Cf2944') {
      $('#admin-message').show();
      $('#container').hide();
    } else {
      $('#admin-message').hide();
    }

    $('#account').text(address);
    $('#balance').text(ethers.utils.formatEther(await signer.getBalance()));
    $('#currentPhase').text(await spaceCoinICO.connect(signer).currentPhase());

    $('#tokens').text(ethers.utils.formatEther(await spaceCoin.balanceOf(spaceCoinICOAddr)));

    $('#eth').text(ethers.utils.formatEther(await spacePool.getBalance()));
    $('#spc').text(ethers.utils.formatEther(await spaceCoin.balanceOf(spacePoolAddr)));

    $('#whitelist').click(async () => {
      try {
        await spaceCoinICO.connect(signer).addWhitelisted(whitelistAccount);
        console.log('Added to whitelist');
      } catch (err) {
        console.log(err);
      }
    });

    $('#generalPhase').click(async () => {
      try {
        await spaceCoinICO.connect(signer).setGeneralPhase();
        console.log('Phase Changed - 1');
      } catch (err) {
        console.log(err);
      }
    });

    $('#openPhase').click(async () => {
      try {
        await spaceCoinICO.connect(signer).setOpenPhase();
        console.log('Phase Changed - 2');
      } catch (err) {
        console.log(err);
      }
    });

    $('#withdraw').click(async () => {
      try {
          $('#msg').text('Transferring Tokens to Pool....');

          await spaceCoinICO.connect(signer).setSpaceCoinAddress(spaceCoinAddr);
          await spaceCoinICO.connect(signer).setSpacePoolAddress(spacePoolAddr);

          const overrides = { gasLimit: 500000 };
          const transactionResponse = await spaceCoinICO.connect(signer).withdraw(overrides);
          const transactionReceipt = await transactionResponse.wait();
          console.log(transactionReceipt);
          console.log(transactionReceipt.status);

          const balance = await spaceCoin.balanceOf(spacePoolAddr);
          $('#poolTokens').text(ethers.utils.formatEther(balance));
      } catch (err) {
          console.log(err);
          $('#msg').text(err);
      }
    });
  } catch (err) {
    console.log(err.data);
    console.log('Not signed in');
    // await provider.send('eth_requestAccounts', []);
  }
}
