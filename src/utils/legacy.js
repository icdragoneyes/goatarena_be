const { Connection, VersionedTransaction } = require("@solana/web3.js");
const { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT } = require("./constants");

const execute = async (transaction, latestBlockhash, isBuy = true) => {
  const solanaConnection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
  });

  const signature = await solanaConnection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: true }
  );
  const confirmation = await solanaConnection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });

  if (confirmation.value.err) {
    console.log("Confirmtaion error");
    console.log({ isBuy, signature, confirmation });
    console.log(confirmation.value.err);
    return "";
  } else {
    if (isBuy === 1) {
      // console.log(`Success in buy transaction: https://solscan.io/tx/${signature}`)
      return signature;
    } else if (isBuy)
      console.log(
        `Success in buy transaction: https://solscan.io/tx/${signature}`
      );
    else
      console.log(
        `Success in Sell transaction: https://solscan.io/tx/${signature}`
      );
  }
  return signature;
};

module.exports = {
  execute,
};
