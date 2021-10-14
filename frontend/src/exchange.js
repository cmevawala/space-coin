import 'regenerator-runtime/runtime';
import { ethers, utils, BigNumber } from 'ethers';
import SpaceRouterJSON from '../../artifacts/contracts/SpaceRouter.sol/SpaceRouter.json';
import SpacePoolICOJSON from '../../artifacts/contracts/SpacePool.sol/SpacePool.json';
import SpaceCoinJSON from '../../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json';
import SpacePoolCoinJSON from '../../artifacts/contracts/SpacePoolCoin.sol/SpacePoolCoin.json'
import { formatUnits, parseUnits, parseEther, formatEther } from 'ethers/lib/utils';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const spaceRouterAddr = '0x84d8078b73Bb85E1Eb9a167479A5E0C156623fc8';
const spaceRouterContract = new ethers.Contract(spaceRouterAddr, SpaceRouterJSON.abi, provider);

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

const spacePoolCoinAddr = '0x0890432823aED05Ce3844474b3631576b2a7De6A';
const spacePoolCoin = new ethers.Contract(
  spacePoolCoinAddr,
  SpacePoolCoinJSON.abi,
  provider
);

window.onload = function () {
}

// Kick things off
go();

async function go() {
  await connectToMetamask();
}

async function connectToMetamask() {
  try {
    console.log('Signed in', await signer.getAddress());

    const address = await signer.getAddress();
    $('#account').text(address);
    $('#balance').text(formatEther(await signer.getBalance()));

    $('#spcbalance').text(formatEther(await spaceCoin.balanceOf(address)));
    $('#lpbalance').text(formatEther(await spacePoolCoin.balanceOf(address)));

    $("#base-token").change(handleChange);
    $("#target-token").change(handleChange);

    $("#connect-wallet").click(handleSwap)
    $("#burn").click(handleBurn);

  } catch (err) {
    console.log(err.data);
    console.log('Not signed in');
  }
}

async function handleChange(event) {
    let amountInA;
    let amountInB;

    let baseTokenValue = $("#base-token").val(); // parse eth -> wei
    let targetTokenValue = $("#target-token").val(); // parse eth -> wei

    if (event.target.id === "base-token") {
      targetTokenValue = NaN;
    } else {
      baseTokenValue = NaN;
    }

    let eth = formatUnits(await spacePool.getBalance());
    let spc = formatUnits(await spaceCoin.balanceOf(spacePoolAddr));
    let ratio = spc / eth;

    if (isNaN(baseTokenValue) && isNaN(targetTokenValue)) return;
    
    if (isNaN(baseTokenValue)) {
      amountInA = targetTokenValue / (ratio);
      amountInB = targetTokenValue;
    } else if (isNaN(targetTokenValue)) {
      amountInA = baseTokenValue;
      amountInB = baseTokenValue * (ratio);
    }

    // console.log(parseUnits(amountInA.toString()));
    // console.log(parseUnits(amountInB.toString()));

    amountInA = parseUnits(amountInA.toString());
    amountInB = parseUnits(amountInB.toString());

    console.log(formatUnits(amountInA, "wei"));
    console.log(formatUnits(amountInB, "wei"));

    const values = await spaceRouterContract.quote(amountInA, amountInB);
    $("#base-token").val(formatUnits(amountInA));
    $("#target-token").val(formatUnits(amountInB));
}

async function handleSwap(event) {

  let amountInA = parseEther($("#base-token").val());
  let amountInB = parseEther($("#target-token").val());
  
  console.log(formatUnits(amountInA, "wei"));
  console.log(formatUnits(amountInB, "wei"));

  const overrides = { gasLimit: 500000, value: amountInA };
  const transactionResponse = await spaceRouterContract.connect(signer).swapTokens(0, overrides);
  const transactionReceipt = await transactionResponse.wait();
  console.log(transactionReceipt);
  console.log(transactionReceipt.status);

  $('#lpbalance').text(formatEther(await spacePoolCoin.balanceOf(await signer.getAddress())));
}

async function handleBurn() {

  const overrides = { gasLimit: 500000 };
  const transactionResponse = await spaceRouterContract.connect(signer).removeLiquidity(overrides);
  const transactionReceipt = await transactionResponse.wait();
  console.log(transactionReceipt);
  console.log(transactionReceipt.status);

  $('#lpbalance').text(formatEther(await spacePoolCoin.balanceOf(await signer.getAddress())));
}
