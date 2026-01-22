import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem";
import { EVM, evmConfig } from "./chain.ts";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from 'dotenv';
dotenv.config();

export function getPublicClient(evm: EVM): PublicClient {
  return createPublicClient({
    chain: evmConfig[evm].viem,
    transport: http(evmConfig[evm].rpc)
  })
}

export function getWalletClient(evm: EVM, privateKey?: `0x${string}`): WalletClient {
  if (!privateKey && !process.env.PRIVATE_KEY) throw new Error("No private key found");

  return createWalletClient({
    chain: evmConfig[evm].viem,
    transport: http(evmConfig[evm].rpc),
    account: privateKeyToAccount(privateKey ? privateKey : process.env.PRIVATE_KEY! as `0x${string}`)
  })
}