import * as bitcoin from "bitcoinjs-lib";
import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import { saveToJson } from "../../utils/index.js";
bitcoin.initEccLib(ecc);

const config = {
  secretPath: 'scripts/bitcoin/code/secret.json'
}

async function main() {
  const mnemonic = bip39.generateMnemonic();
  console.log("\nmnemoic phrase:", mnemonic, '\n');

  const NETWORK = bitcoin.networks.testnet;

  const bip32 = BIP32Factory(ecc);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed, NETWORK);

  const path = "m/84'/1'/0'/0/0";
  const child = root.derivePath(path);
  const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: NETWORK });

  console.log("testnet address:", address);
  console.log("private key WIF:", child.toWIF(), '\n');

  saveToJson(config.secretPath, 'mnemonic', mnemonic);
  saveToJson(config.secretPath, 'address', address!);
  saveToJson(config.secretPath, 'private', child.toWIF());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });