import 'regenerator-runtime/runtime';
import { ethers } from 'ethers';
import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json'
import SpaceCoinICOJSON from '../../artifacts/contracts/SpaceCoinICO.sol/SpaceCoinICO.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// const spaceCoinICOAddr = '0x13eCEaAec0E4f44C601b0042d40c426dd7A9863d';
const spaceCoinICOAddr = '0x9AaCC9e1A5b949970E763DDea64d5fdCE022f00C';
const spaceCoinICO = new ethers.Contract(spaceCoinICOAddr, SpaceCoinICOJSON.abi, provider);

const spaceCoinAddr = '0xbc77f93cfB1f60eD44fbd75f67D7B3fB345a2535';
const spaceCoin = new ethers.Contract(spaceCoinAddr, SpaceCoinJSON.abi, provider);

// Kick things off
go();

async function go() {
  await connectToMetamask();
}

async function connectToMetamask() {
  try {
    console.log('Signed in');
    const address = await signer.getAddress();
    $('#account').text(address);
    $('#balance').text(ethers.utils.formatEther(await signer.getBalance()));
    $('#tokens').text(ethers.utils.formatEther(await spaceCoin.balanceOf(address)));

    $('#redeem').click(async () => {
        try {
            $('#tokens').text('Transferring Tokens....');
            
            // const overrides = { gasLimit: 200000 };
            // console.log(await spaceCoinICO.connect(signer).getByAddress(address));
            
            // await spaceCoinICO.connect(signer).setSpaceCoinAddress(spaceCoinAddr);

            const overrides = { gasLimit: 500000 };
            const transactionResponse = await spaceCoinICO.connect(signer).redeem(overrides);
            const transactionReceipt = await transactionResponse.wait();
            console.log(transactionReceipt);
            console.log(transactionReceipt.status);

            const balance = await spaceCoinICO.balanceOf(address);
            $('#tokens').text(ethers.utils.formatEther(balance));
        } catch (err) {
            console.log(err);
            $('#tokens').text(err);
        }
    });


    $('#puchase').click(contribute);
  } catch (err) {
    console.log(err.data);
    console.log('Not signed in');
    // await provider.send('eth_requestAccounts', []);
  }
}

async function contribute() {
    try {
        $('#tokens').text('Transaction in Progress....');

        await spaceCoinICO.connect(signer).setSpaceCoinAddress(spaceCoin.address);
    
        const overrides = { gasLimit: 500000, value: ethers.utils.parseEther($(this).val()) };
        const transactionResponse = await spaceCoinICO.connect(signer).contribute(overrides);
        const transactionReceipt = await transactionResponse.wait();
        console.log(transactionReceipt);
        console.log(transactionReceipt.status);

        $('#balance').text(ethers.utils.formatEther(await signer.getBalance()));
        $('#tokens').text('Transaction Completed');
    } catch (err) {
        console.log(err.message);
    }
}
