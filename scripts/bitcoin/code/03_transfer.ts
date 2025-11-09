import axios from 'axios';
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { readFromJson } from '../../utils/index.js';
bitcoin.initEccLib(ecc);

const config = {
  secretPath: 'scripts/bitcoin/code/secret.json'
}

async function main() {
  const ECPair = ECPairFactory(ecc);
  const address = readFromJson(config.secretPath, 'address');
  const private_key = readFromJson(config.secretPath, 'private');
  const AMOUNT = 5000n; // sats
  const FEE = 100n; // sats
  const receiver = 'tb1qlj64u6fqutr0xue85kl55fx0gt4m4urun25p7q';

  const utxos = (await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`)).data;
  const utxo = utxos.find((u: any) => u.value >= AMOUNT + FEE);
  if (!utxo) {
    console.log("cannot find utxo");
    return;
  }

  const txRaw = (await axios.get(`https://blockstream.info/testnet/api/tx/${utxo.txid}/hex`)).data;
  const tx = bitcoin.Transaction.fromHex(txRaw);
  const output = tx.outs[utxo.vout];
  const value = BigInt(utxo.value);

  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });

  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      script: Buffer.from(output.script),
      value: value,
    }
  });

  const sendValue = AMOUNT;
  const changeValue = value - AMOUNT - FEE;

  psbt.addOutput({
    address: receiver,
    value: sendValue
  });

  if (changeValue > 0) {
    psbt.addOutput({
      address: address,
      value: changeValue
    });
  }

  const keyPair = ECPair.fromWIF(private_key, bitcoin.networks.testnet);
  psbt.signAllInputs(keyPair);
  psbt.finalizeAllInputs();
  const txHex = psbt.extractTransaction().toHex();
  console.log("\nRaw TX hex:", txHex);

  try {
    const res = await axios.post(`https://blockstream.info/testnet/api/tx`, txHex, {
      headers: { "Content-Type": "text/plain" }
    });
    console.log("Broadcast result (TXID):", res.data);
    console.log("Check TX at: https://mempool.space/testnet/tx/" + res.data);
    console.log("Or: https://blockstream.info/testnet/tx/" + res.data);
  } catch (e: any) {
    console.error("Broadcast failed:", e.response?.data || e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });