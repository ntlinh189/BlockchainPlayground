import * as viemEVMs from "viem/chains";

export type EVM = "sepolia" | "unichainSepolia" | "baseSepolia" | "base" | "unichain" | "mainnet" | "arbitrum" | "bsc" | "bscTestnet"

export interface EVMConfig {
  viem: viemEVMs.Chain;
  id: number;
  rpc: string;
}

export const evmConfig: Record<EVM, EVMConfig> = {
  sepolia: {
    viem: viemEVMs.sepolia,
    id: 11155111,
    rpc: "https://ethereum-sepolia-rpc.publicnode.com",
  },
  unichainSepolia: {
    viem: viemEVMs.unichainSepolia,
    id: 1301,
    rpc: "https://unichain-sepolia-rpc.publicnode.com",
  },
  baseSepolia: {
    viem: viemEVMs.baseSepolia,
    id: 84532,
    rpc: "https://base-sepolia-rpc.publicnode.com",
  },
  base: {
    viem: viemEVMs.base,
    id: 8453,
    rpc: "https://base-rpc.publicnode.com",
  },
  unichain: {
    viem: viemEVMs.unichain,
    id: 130,
    rpc: "https://unichain-rpc.publicnode.com",
  },
  mainnet: {
    viem: viemEVMs.mainnet,
    id: 1,
    rpc: "https://ethereum-rpc.publicnode.com",
  },
  arbitrum: {
    viem: viemEVMs.arbitrum,
    id: 42161,
    rpc: "https://arbitrum-one-rpc.publicnode.com",
  },
  bsc: {
    viem: viemEVMs.bsc,
    id: 56,
    rpc: "https://bsc-rpc.publicnode.com"
  },
  bscTestnet: {
    viem: viemEVMs.bscTestnet,
    id: 97,
    rpc: "https://bsc-testnet-rpc.publicnode.com"
  }
}

export function idToEVM(id: number): EVM | undefined {
  return Object.keys(evmConfig).find((e) => (evmConfig[e as keyof typeof evmConfig].id == id)) as EVM | undefined
}