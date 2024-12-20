const { PublicKey, Keypair, VersionedTransaction } = require("@solana/web3.js");
const { SLIPPAGE } = require("./constants");

const getBuyTransaction = async (wallet, token, amount) => {
  try {
    console.log("Fetching quote...");
    var url = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${token.toBase58()}&amount=${amount}&slippageBps=${SLIPPAGE}`;
    console.log(url);
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${token.toBase58()}&amount=${amount}&slippageBps=${SLIPPAGE}`
      )
    ).json();
    console.log(quoteResponse, "<<< response");
    if (!quoteResponse) {
      console.error("No quote data available");
      return null;
    }

    // Extract the best route
    //const bestRoute = quoteResponse.data[0];
    const outputAmount = quoteResponse.outAmount; // The total amount of tokens being purchased

    console.log(
      `Quote fetched. Output amount: ${outputAmount} (in smallest units)`
    );

    // Fetch the swap transaction
    const swapResponse = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quoteResponse, // Pass the best route as the quote
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 100000,
        }),
      })
    ).json();

    if (!swapResponse || !swapResponse.swapTransaction) {
      console.error("Failed to fetch swap transaction");
      return null;
    }

    const swapTransactionBuf = Buffer.from(
      swapResponse.swapTransaction,
      "base64"
    );
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    transaction.sign([wallet]);
    //console.log(transaction, "<<<<<<<<<< Transaction");

    // Return the total output amount (tokens being purchased)
    return {
      transaction: transaction,
      purchasedAmount: outputAmount, // Include the output amount in smallest units
    };
  } catch (error) {
    console.error(`Failed to get buy transaction`, error);
    return null;
  }
};

const getSellTransaction = async (wallet, token, amount) => {
  try {
    const quote = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${token.toBase58()}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}&slippageBps=${SLIPPAGE}`
      )
    ).json();

    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 52000,
        }),
      })
    ).json();

    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    transaction.sign([wallet]);

    return transaction;
  } catch (error) {
    console.log("Failed to get sell transaction", error);
    return null;
  }
};

module.exports = {
  getBuyTransaction,
  getSellTransaction,
};
