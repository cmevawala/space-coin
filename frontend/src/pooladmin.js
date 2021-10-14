import 'regenerator-runtime/runtime';
import { ethers, utils, BigNumber } from 'ethers';
import SpaceRouterJSON from '../../artifacts/contracts/SpaceRouter.sol/SpaceRouter.json';
import SpacePoolICOJSON from '../../artifacts/contracts/SpacePool.sol/SpacePool.json';
import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json';
import SpacePoolCoinJSON from '../../artifacts/contracts/SpacePoolCoin.sol/SpacePoolCoin.json'
import { formatUnits, parseUnits, parseEther, formatEther } from 'ethers/lib/utils';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const spaceCoinAddr = '0xbc77f93cfB1f60eD44fbd75f67D7B3fB345a2535';
const spaceCoin = new ethers.Contract(spaceCoinAddr, SpaceCoinJSON.abi, provider);

const spaceRouterAddr = '0x84d8078b73Bb85E1Eb9a167479A5E0C156623fc8';
const spaceRouterContract = new ethers.Contract(spaceRouterAddr, SpaceRouterJSON.abi, provider);

const spacePoolAddr = '0xA83Ea155111cf1a0fd3c3B3588149C14f2976f53';
const spacePool = new ethers.Contract(spacePoolAddr, SpacePoolICOJSON.abi, provider);

const spacePoolCoinAddr = '0x0890432823aED05Ce3844474b3631576b2a7De6A';
const spacePoolCoin = new ethers.Contract(spacePoolCoinAddr, SpacePoolCoinJSON.abi, provider);


// Kick things off
go();

async function go() {
    await connectToMetamask();
}

async function connectToMetamask() {
    try {
        console.log('Signed in', await signer.getAddress());

        const address = await signer.getAddress();
        if (address !== '0xfEEC97FAD402bFaCBD36098ea2cB829CC7Cf2944') {
            $('#admin-message').show();
            $('#container').hide();
        } else {
            $('#admin-message').hide();
        }

        $('#eth').text(formatEther(await spacePool.getBalance()));

        $('#spc').text(formatEther(await spaceCoin.balanceOf(spacePool.address)));

        $('#lptokens').text(formatEther(await spacePoolCoin.balanceOf(spacePool.address)));

    } catch (err) {
        console.log(err.data);
        console.log('Not signed in');
    }
}
