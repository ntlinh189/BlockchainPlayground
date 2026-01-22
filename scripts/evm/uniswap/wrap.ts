import { getContract, parseUnits } from "viem";
import { getPublicClient, getWalletClient } from "../utils/index.ts";
import wethArtifact from "./artifacts/weth.json";

const config = {
  wethAddress: '0x4200000000000000000000000000000000000006',
}

async function main() {

  // init client
  const publicClient = getPublicClient("base");
  const walletClient = getWalletClient("base");

  // init contract
  const weth = getContract({
    abi: wethArtifact.abi,
    address: config.wethAddress as `0x${string}`,
    client: walletClient
  });

  console.log('weth:', await weth.read.balanceOf([walletClient.account!.address]));

  // wrap
  const wrap = await weth.write.deposit([], {value: parseUnits('0.000002', 18)});
  await publicClient.waitForTransactionReceipt({hash: wrap});
  console.log('weth:', await weth.read.balanceOf([walletClient.account!.address]));

  // unwrap
  const unwrap = await weth.write.withdraw([await weth.read.balanceOf([walletClient.account!.address])]);
  await publicClient.waitForTransactionReceipt({hash: unwrap});
  console.log('weth: ', await weth.read.balanceOf([walletClient.account!.address]));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });