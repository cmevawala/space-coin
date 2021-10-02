import 'regenerator-runtime/runtime';
import { ethers } from 'ethers';
import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const spaceCoinAddr = '0x13eCEaAec0E4f44C601b0042d40c426dd7A9863d';
const contract = new ethers.Contract(spaceCoinAddr, SpaceCoinJSON.abi, provider);

const whitelistAccount = "0xB74C1750e7fC5d54eBBaeeAEE2408fA773B026fA";

window.onload = function () {
    $('#admin-section').hide();
    $('#purchase-section').hide();
}

// Kick things off
go();

async function go() {
  await connectToMetamask();
}

async function connectToMetamask() {
  try {
    console.log('Signed in');
    const owner = await contract.owner();

    console.log("Contract Balance: " + ethers.utils.formatEther(await contract.getBalance()));
    
    const address = await signer.getAddress();
    $('#account').text(address);
    $('#balance').text(ethers.utils.formatEther(await signer.getBalance()));
    $('#tokens').text(ethers.utils.formatEther(await contract.balanceOf(address)));

    if (address === owner) { // Owner
        $('#admin-section').show();
        
        $('#whitelist').click(async () => {
            try {
                
                await contract.connect(signer).addWhitelisted(whitelistAccount);
                console.log('Added to whitelist')
            
            } catch (err) {
                console.log(err);
            }
        });

        $('#phase').click(async () => {
            try {
                
                await contract.connect(signer).setPhase(2);
                console.log('Phase Changed - 2');
            
            } catch (err) {
                console.log(err);
            }
        });
        
    } else {
        $('#purchase-section').show();

        $('#release').click(async () => {

            try {
                $('#tokens').text('Transferring Tokens....');
                
                // const overrides = { gasLimit: 200000 };
                // console.log(await contract.connect(signer).getByAddress(address));
                
                const overrides = { gasLimit: 200000 };
                const transactionResponse = await contract.connect(signer).tokenTransfer(overrides);
                const transactionReceipt = await transactionResponse.wait();
                console.log(transactionReceipt);
                console.log(transactionReceipt.status);

                const balance = await contract.balanceOf(address);
                $('#tokens').text(ethers.utils.formatEther(balance));
            } catch (err) {
                console.log(err);
                $('#tokens').text(err);
            }
        });
    }

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
    
        const overrides = { gasLimit: 200000, value: ethers.utils.parseEther($(this).val()) };
        // console.log(overrides);
        const transactionResponse = await contract.connect(signer).contribute(overrides);
        const transactionReceipt = await transactionResponse.wait();
        console.log(transactionReceipt);
        console.log(transactionReceipt.status);

        $('#balance').text(ethers.utils.formatEther(await signer.getBalance()));
        $('#tokens').text('Transaction Completed');
    } catch (err) {
        console.log(err.message);
    }
}
