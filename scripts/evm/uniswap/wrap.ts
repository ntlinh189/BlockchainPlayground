import { parseUnits, createWalletClient, http, getContract, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import dotenv from 'dotenv';
dotenv.config();

const config = {
  weth: {
    address: '0x4200000000000000000000000000000000000006',
    abi: [{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
  }
}

async function main() {

  // init client
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://base-mainnet.public.blastapi.io'),
  });

  const walletClient = createWalletClient({
    account: privateKeyToAccount(process.env.PRIVATE_KEY! as `0x${string}`),
    chain: base,
    transport: http('https://base-mainnet.public.blastapi.io')
  });

  // init contract
  const weth = getContract({
    abi: config.weth.abi,
    address: config.weth.address as `0x${string}`,
    client: walletClient
  });

  console.log('weth:', await weth.read.balanceOf([walletClient.account.address]));

  // wrap
  const wrap = await weth.write.deposit([], {value: parseUnits('0.000002', 18)});
  await publicClient.waitForTransactionReceipt({hash: wrap});
  console.log('weth:', await weth.read.balanceOf([walletClient.account.address]));

  // unwrap
  const unwrap = await weth.write.withdraw([await weth.read.balanceOf([walletClient.account.address])]);
  await publicClient.waitForTransactionReceipt({hash: unwrap});
  console.log('weth: ', await weth.read.balanceOf([walletClient.account.address]));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });