import axios from 'axios';

const address = "tb1qvn3lfgvlj2ah34z904eq3pcjc2md7l00jdvekf"

async function main() {
  const utxos = (await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`)).data;
  let confirmedBalance = utxos.reduce((s: any, u: any) => s + u.value, 0);

  const mempoolTxs = (await axios.get(`https://blockstream.info/testnet/api/address/${address}/txs/mempool`)).data;
  let mempoolDelta = 0;
  for (const tx of mempoolTxs) {
    for (const v of tx.vout) {
      if (v.scriptpubkey_address === address) mempoolDelta += v.value;
    }
    for (const vin of tx.vin) {
      if (vin.prevout && vin.prevout.scriptpubkey_address === address) mempoolDelta -= vin.prevout.value;
    }
  }

  console.log('confirmed:', confirmedBalance);
  console.log('mempool:', mempoolDelta);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });