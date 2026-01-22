import erc20Artifact from "./artifacts/erc20.json";
import routerArtifact from "./artifacts/router.json";
import { getContract, parseUnits } from "viem";
import { getPublicClient, getWalletClient } from "../utils/index.ts";

const config = {
  routerAddress: "0x2626664c2603336E57B271c5C0b26F421741e481",
  usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  wethAddress: '0x4200000000000000000000000000000000000006',
  amount: parseUnits('0.05', 6),
  fee: 500 // 0.05%
}

async function main() {

  // init client
  const publicClient = getPublicClient("base");
  const walletClient = getWalletClient("base");

  // init contract
  const router = getContract({
    abi: routerArtifact.abi,
    address: config.routerAddress as `0x${string}`,
    client: walletClient
  });

  const usdc = getContract({
    abi: erc20Artifact.abi,
    address: config.usdcAddress as `0x${string}`,
    client: walletClient
  });

  const weth = getContract({
    abi: erc20Artifact.abi,
    address: config.wethAddress as `0x${string}`,
    client: publicClient
  });

  console.log('usdc before:', await usdc.read.balanceOf([walletClient.account!.address]));
  console.log('weth before:', await weth.read.balanceOf([walletClient.account!.address]));

  // approve
  if (Number(await usdc.read.allowance([walletClient.account!.address, router.address])) < Number(config.amount)) {
    const approveHash = await usdc.write.approve([router.address, config.amount]);
    await publicClient.waitForTransactionReceipt({hash: approveHash});
  }
  
  // swap
  const txHash = await router.write.exactInputSingle([{
    tokenIn: config.usdcAddress,
    tokenOut: config.wethAddress,
    fee: config.fee,
    recipient: walletClient.account!.address,
    amountIn: config.amount,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  }]);
  await publicClient.waitForTransactionReceipt({hash: txHash});

  console.log('usdc after: ', await usdc.read.balanceOf([walletClient.account!.address]));
  console.log('weth after: ', await weth.read.balanceOf([walletClient.account!.address]));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });