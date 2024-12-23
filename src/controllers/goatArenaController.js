const puppeteer = require("puppeteer-extra");

const { Connection, Keypair, PublicKey,Transaction,getTransactionFee } = require("@solana/web3.js");
const { Metaplex } = require("@metaplex-foundation/js");

const {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  createBurnInstruction,
  burn,
  TOKEN_PROGRAM_ID,
  Token,
  getAccount,
  createMint,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} = require("@solana/spl-token");
const bs58 = require("bs58");

// Function to convert a Base58 encoded secret key to a Uint8Array
function base58ToSecretKeyArray(base58Key) {
  return bs58.decode(base58Key); // Decode Base58 to Uint8Array
} /* */

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const {
  executeBuyToken,
  getGameInfo,
  createGame,
  getBuyTransaction,
  updateGame,
  getSellTransaction,
  executeSellToken,
  getClaimTransaction,
  getBuyers,
} = require("../services/database");
const {
  gameModel,
  buyModel,
  sellTransactionModel,
  claimTransactionModel,
} = require("../models/goatarenaModel");

const connection = new Connection(
  "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
  "confirmed"
);
const masterWallet =
  "274nXYMJmL7bijpxB9U96Bv258bdifHufPgRxaN92Bse7bFfG6xpfe2NFjPSEfcdZp8QFoUBq5DZDr5ZsyPuLaoJ";

// Enable stealth mode
puppeteer.use(StealthPlugin());
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateKey() {
  var x = Keypair.generate();
  x = x.secretKey;

  // Encode the secret key to base58
  x = bs58.encode(x);
  return x;
}


async function startNewGame() {
  //trigger stop game, show preparing for next round
  try {
    //get memecoin
    var token = await scrapeGMGNAI();
    if (!token) return;
    token = JSON.parse(token);
    if (token === undefined) return false;
    retryScrape = false;
    const now = new Date().toISOString();
    var values = gameModel;
    values.contract_address_3 = token.TokenAddress;
    var nm = await getTokenMetadata(values.contract_address_3);
    values.memecoin_name_2 = nm.name;
    values.time_started_1 = now;
    values.token_decimal_23 = nm.decimals;
    values.memecoin_symbol_20 = nm.symbol;
    values.over_price_15 = 0.001 * 1e9;
    values.under_price_16 = 0.001 * 1e9;
    values.memecoin_usd_start_21 = await getTokenPrice(
      token.TokenAddress,
      nm.decimals
    );
    values.over_pot_address = generateKey();
    values.under_pot_address = generateKey();

    values.over_token_address_18 = await createToken();
    values.under_token_address_19 = await createToken();
    values = Object.values(values);

    //generate 2 new address for over and under pot
    //create 2 spl token over and under
    //calculate
    //trigger start game
    await createGame(values);
    await fetchCurrentGameStatus();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initialize session." });
  }
}

function base58ToSecretKeyArray(base58Key) {
  return bs58.decode(base58Key); // Decode Base58 to Uint8Array
}

async function createToken() {
  try {
    // Replace with your Solana private key
    var sk = base58ToSecretKeyArray(masterWallet);

    const payer = Keypair.fromSecretKey(Uint8Array.from(sk));

    // Create a connection to the devnet
    // const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    //console.log('Connected to Solana devnet');
    console.log("creating token...");
    // Create a new token mint
    const tokenMint = await createMint(
      connection, // Connection to Solana network
      payer, // Payer for transaction fees
      payer.publicKey, // Public key of the mint authority
      payer.publicKey, // Public key of the freeze authority
      9 // Number of decimals for the token
    );

    console.log("Token Mint Address:", tokenMint.toBase58());

    // Create an associated token account for the payer
    /* const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      payer.publicKey
    );

    console.log(
      "Associated Token Account Address:",
      tokenAccount.address.toBase58()
    );

    // Mint tokens to the associated token account
    await mintTo(
          connection,
          payer,
          tokenMint,
          tokenAccount.address,
          payer.publicKey,
          amount
      ); */

    //console.log(`Minted ${amount / Math.pow(10, decimals)} tokens to ${tokenAccount.address.toBase58()}`);
    return tokenMint.toBase58();
  } catch (error) {
    console.error("Error creating token:", error);
  }
}

async function mintToken(to, token, amount) {
  console.log(amount, "<<< am");
  try {
    var sk = base58ToSecretKeyArray(masterWallet);
    const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(sk));
    var mintAddress = new PublicKey(token);
    var recipientAddress = new PublicKey(to);

    // Ensure the recipient has an associated token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      mintAddress,
      recipientAddress
    );

    console.log(
      "Recipient's Token Account:",
      recipientTokenAccount.address.toBase58()
    );

    // Mint tokens to the recipient's token account
    await mintTo(
      connection,
      mintAuthority,
      mintAddress,
      recipientTokenAccount.address,
      mintAuthority, // Mint authority
      amount
    );

    console.log(
      `Successfully minted ${
        amount / Math.pow(10, 9)
      } tokens to ${recipientTokenAccount.address.toBase58()}`
    );
    return true;
  } catch (error) {
    console.error("Error minting tokens:", error);
    return false;
  }
}

async function getTokenPrice(outputMintAddress, decimals) {
  try {
    //Es9vMFrzaCERjkt1b3XBbKK47uEUyP9sXQ19W92nKjKw
    console.log("Fetching quote...");
    var url = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${outputMintAddress}&amount=1000000000&slippageBps=5`;
    console.log(url);
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${outputMintAddress}&amount=1000000000&slippageBps=5`
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

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    ).then((r) => r.json());
    var usdprice = 0;
    if (response?.solana?.usd) {
      usdprice = response.solana.usd;
    }

    console.log(
      `Quote fetched. Output amount: ${outputAmount} (in smallest units)`
    );
    return (
      (quoteResponse.inAmount /
        1e9 /
        (quoteResponse.outAmount / Math.pow(10, decimals))) *
      usdprice
    );
  } catch (error) {
    console.error("Error fetching token price:", error);
    throw error;
  }
}

async function validateTransaction(
  senderWallet,
  targetWallet,
  amount,
  transactionSignature
) {
  try {
    // Convert the amount from SOL to lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = amount;

    // Fetch transaction details using the signature
    const transaction = await connection.getParsedTransaction(
      transactionSignature,
      "confirmed"
    );

    if (!transaction) {
      console.error("Transaction not found.");
      return false;
    }

    // Extract transaction instructions
    const instructions = transaction.transaction.message.instructions;

    // Validate each instruction
    for (const instruction of instructions) {
      // Check if the instruction is a system transfer
      if (instruction.program === "system") {
        const sender = instruction.parsed.info.source;
        const target = instruction.parsed.info.destination;
        const amountTransferred = instruction.parsed.info.lamports;

        // Compare sender, target, and amount
        if (
          sender === senderWallet &&
          target === targetWallet &&
          amountTransferred >= lamports
        ) {
          return true; // Transaction matches the criteria
        }
      }
    }

    return false; // No matching instruction found
  } catch (error) {
    console.error("Error validating transaction:", error);
    return false;
  }
}

async function validateBurnTransaction(
  senderWallet,
  amount,
  transactionSignature,
  tokenMintAddress
) {
  try {
    // Convert the amount to the smallest unit of the token (e.g., lamports for SPL tokens)
    const tokenAmount = amount; // Assume amount is already in the token's smallest unit

    // Fetch transaction details using the signature
    const transaction = await connection.getParsedTransaction(
      transactionSignature,
      "confirmed"
    );

    if (!transaction) {
      console.error("Transaction not found.");
      return false;
    }

    // Extract transaction instructions
    const instructions = transaction.transaction.message.instructions;

    // Validate each instruction
    for (const instruction of instructions) {
      // Check if the instruction is from the SPL Token Program
      if (
        instruction.programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" // SPL Token Program ID
      ) {
        const parsedInfo = instruction.parsed?.info;

        if (!parsedInfo) continue;

        const sourceTokenAccount = parsedInfo.source;
        const destinationTokenAccount = parsedInfo.destination;
        const mintAddress = parsedInfo.mint;
        const amountTransferred = parsedInfo.amount;

        // Fetch the mint address of the source token account
        const senderTokenAccount = await connection.getParsedAccountInfo(
          new PublicKey(sourceTokenAccount),
          "confirmed"
        );
        const senderMintAddress =
          senderTokenAccount.value?.data?.parsed?.info?.mint;

        if (
          sourceTokenAccount &&
          destinationTokenAccount &&
          mintAddress &&
          senderMintAddress &&
          senderWallet === sourceTokenAccount &&
          getPublicKey58(masterWallet) === destinationTokenAccount &&
          mintAddress === tokenMintAddress &&
          Number(amountTransferred) === Number(tokenAmount)
        ) {
          return true; // Transaction matches the criteria
        }
      }
    }

    return false; // No matching instruction found
  } catch (error) {
    console.error("Error validating token transaction:", error);
    return false;
  }
}

function calculateTokenAmount(solana, tokenPrice) {
  console.log(solana, "<< sol");
  console.log(tokenPrice, "<< price");
  const solAfterFee = solana * 0.99;
  const tokenAmount = (solAfterFee / 1e9 / (tokenPrice / 1e9)) * 1e9;
  return tokenAmount;
}

async function buyToken(wallet, side, txSignature, solAmount) {
  var checkSignature = await getBuyTransaction(
    "solana_tx_signature",
    txSignature,
    false
  );

  if (checkSignature != null) {
    return { error: "transaction signature already exist" };
  }
  var values = buyModel;

  var latestGame = await getGameInfo(0, true);

  var targetWallet = getPublicKey58(latestGame.over_pot_address);

  values.token_price = latestGame.overPrice;
  values.solana_wallet_address = wallet;

  if (side == "under") {
    targetWallet = getPublicKey58(latestGame.under_pot_address);
    values.token_price = latestGame.underPrice;
  }
  var isValid = true;

  /*isValid = await validateTransaction(
    wallet,
    targetWallet,
    solAmount,
    txSignature
  ); */
  //console.log(isValid, "<<<isv");
  //return;
  if (isValid) {
    //mint
    const now = new Date().toISOString();
    //add gross pot
    latestGame.totalPot = Number(solAmount) + Number(latestGame.totalPot);
    //mint token and update pot
    if (side == "under") {
      latestGame.underPot = Number(latestGame.underPot) + Number(solAmount);
      latestGame.underTokenMinted =
        Number(latestGame.underTokenMinted) +
        calculateTokenAmount(solAmount, latestGame.underPrice);

      var a = await mintToken(
        values.solana_wallet_address,
        latestGame.under_token_address,
        calculateTokenAmount(solAmount, latestGame.underPrice)
      );
      if (!a) return { error: "minting failed" };
    } else {
      latestGame.overPot = Number(solAmount) + Number(latestGame.overPot);
      latestGame.overTokenMinted =
        Number(latestGame.overTokenMinted) +
        calculateTokenAmount(solAmount, latestGame.overPrice);
      var a = await mintToken(
        values.solana_wallet_address,
        latestGame.over_token_address,
        calculateTokenAmount(solAmount, latestGame.overPrice)
      );
      if (!a) return { error: "minting failed" };
    }

    latestGame.buy_fee =
      Number(latestGame.buy_fee) + parseInt(0.01 * Number(solAmount));
    latestGame.claimableWinningPotInSol =
      Number(latestGame.totalPot) -
      (Number(latestGame.buy_fee) + Number(latestGame.sell_fee));

    values.session_id = latestGame.id;
    values.total_in_solana = solAmount;
    values.solana_tx_signature = txSignature;
    values.fees = parseInt(0.01 * solAmount);
    values.side = side;
    values.time = now;
    values = Object.values(values);
    var insert = await executeBuyToken(values);
    latestGame = Object.values(latestGame);
    await updateGame(latestGame);
    return insert;
  }
  //check signature, from wallet, and target pot wallet, make sure is valid
  //try 2 times
  //get latest price, make sure still active game (time ended > 0), refund is inactive
  //get token price, mint as much as SOL sent to pot to buyer
  //write to db
}

async function sellToken(wallet, tokenAmount, side, txSignature) {
  //check if game still active
  var latestGame = await getGameInfo(0, true);
  if (latestGame.timeEnded != null) {
    return;
  }

  var checkSignature = await getSellTransaction(
    "burn_tx_signature",
    txSignature,
    false
  );

  if (checkSignature != null) {
    return { error: "burn transaction signature already exist" };
  }

  var sellValue = sellTransactionModel;

  sellValue.session_id = Number(latestGame.id);
  sellValue.solana_wallet_address = wallet;

  var tokenMintAddress = latestGame.over_token_address;
  if (side == "under") tokenMintAddress = latestGame.under_token_address;

  const isValid = await validateBurnTransaction(
    wallet,
    tokenAmount,
    txSignature,
    tokenMintAddress
  );

  if (!isValid) return { error: "invalid burn transaction" };
  sellValue.burn_tx_signature = txSignature;

  var solValue = Number(latestGame.overPrice) * (tokenAmount / 1e9);
  sellValue.token_price = Number(latestGame.overPrice);
  if (side == "under") {
    sellValue.token_price = Number(latestGame.underPrice);
    solValue = Number(latestGame.underPrice) * (tokenAmount / 1e9);
    latestGame.underTokenBurnt =
      Number(latestGame.underTokenBurnt) + tokenAmount;
  } else {
    latestGame.overTokenBurnt = Number(latestGame.overTokenBurnt) + tokenAmount;
  }

  const fee = 0.01 * solValue;
  const nett = 0.99 * solValue;

  const fetchedTimestamp = new Date(latestGame.startTime); // Replace with your fetched timestamp

  // Add 60 minutes
  const next60Minutes = new Date(fetchedTimestamp.getTime() + 60 * 60 * 1000);
  console.log("Next 60 Minutes:", next60Minutes.toISOString());

  // Calculate minutes passed since fetched timestamp
  const now = new Date();
  const minutesPassed = Math.floor((now - fetchedTimestamp) / (60 * 1000));
  console.log("Minutes Passed:", minutesPassed);

  const progressiveTax = (minutesPassed / 60) * (99 / 100);
  const solNettMinusTax = (1 - progressiveTax) * nett;
  const solRedistribution = (2 * progressiveTax * nett) / 3;
  sellValue.sell_token_amount = tokenAmount;
  sellValue.sol_received = solNettMinusTax;

  sellValue.fees = Number(fee);
  sellValue.progressive_fees = Number(progressiveTax * nett);

  latestGame.sell_fee = Number(latestGame.sell_fee) + Number(fee);

  var sourcePotKey = latestGame.over_pot_address;
  var targetPotKey = getPublicKey58(latestGame.under_pot_address);

  if (side == "under") {
    sourcePotKey = latestGame.under_pot_address;
    targetPotKey = getPublicKey58(latestGame.over_pot_address);
    latestGame.overPot = Number(latestGame.overPot) + Number(solRedistribution);
    latestGame.underPot =
      Number(latestGame.underPot) - (Number(solRedistribution) + 5000);
  } else {
    latestGame.overPot =
      Number(latestGame.overPot) - (Number(solRedistribution) + 5000);
    latestGame.underPot =
      Number(latestGame.underPot) + Number(solRedistribution);
  }

  latestGame.totalPot =
    Number(latestGame.overPot) + Number(latestGame.underPot);

  latestGame.underPrice =
    Number(latestGame.underPot) /
    (Number(latestGame.underTokenMinted) - Number(latestGame.underTokenBurnt));

  latestGame.overPrice =
    Number(latestGame.overPot) /
    (Number(latestGame.overTokenMinted) - Number(latestGame.overTokenBurnt));

  var transferResult = await executeTransfer(
    latestGame.id,
    sourcePotKey,
    targetPotKey,
    solRedistribution
  );

  var transferClaimResult = await executeTransfer(
    latestGame.id,
    sourcePotKey,
    wallet,
    solNettMinusTax - 5000
  );

  sellValue.burn_tx_signature = txSignature;
  sellValue.solana_tx_signature = transferClaimResult;
  sellValue.time = new Date().toISOString();
  sellValue.side = side;

  sellValue = Object.values(sellValue);
  var insert = await executeSellToken(sellValue);
  latestGame.claimableWinningPotInSol =
    Number(latestGame.totalPot) -
    (Number(latestGame.buy_fee) + Number(latestGame.sell_fee));
  latestGame = Object.values(latestGame);
  await updateGame(latestGame);

  await fetchCurrentGameStatus();

  //send : 1. SOL - fee + tax to player, redistribute progressive tax
  //update to sell and game table
}

async function redeemToken(gameid, wallet, tokenAmount, txSignature) {
  //check if game still active
  var latestGame = await getGameInfo(gameid, false);
  if (latestGame.timeEnded == null) {
    return;
  }

  if (Number(latestGame.claimableWinningPotInSol) <= 0) {
    return;
  }

  var checkSignature = await getClaimTransaction(
    "burn_tx_signature",
    txSignature,
    false
  );

  if (checkSignature != null) {
    return { error: "burn transaction signature already exist" };
  }

  var sellValue = claimTransactionModel;

  sellValue.session_id = gameid;
  sellValue.solana_wallet_address = wallet;

  var tokenSupply =
    Number(latestGame.overTokenMinted) - Number(latestGame.overTokenBurnt);
  var side = "over";
  if (
    Number(latestGame.memecoin_usd_end) < Number(latestGame.memecoin_usd_start)
  ) {
    side = "under";
    tokenSupply =
      Number(latestGame.underTokenMinted) - Number(latestGame.underTokenBurnt);
  }

  if (tokenSupply <= 0) return;

  var tokenMintAddress = latestGame.over_token_address;
  if (
    Number(latestGame.memecoin_usd_end) < Number(latestGame.memecoin_usd_start)
  )
    tokenMintAddress = latestGame.under_token_address;

  const isValid = await validateBurnTransaction(
    wallet,
    tokenAmount,
    txSignature,
    tokenMintAddress
  );

  if (!isValid) return { error: "invalid burn transaction" };
  sellValue.burn_tx_signature = txSignature;
  //if game is settled and transaction si valid, and total supply is good, start calculating redeem
  //calculate sol value
  var solValue =
    (tokenAmount / tokenSupply) * Number(latestGame.claimableWinningPotInSol);

  //burn token or decrease its amount
  if (side == "under") {
    latestGame.underTokenBurnt =
      Number(latestGame.underTokenBurnt) + tokenAmount;
  } else {
    latestGame.overTokenBurnt = Number(latestGame.overTokenBurnt) + tokenAmount;
  }

  sellValue.sell_token_amount = tokenAmount;
  sellValue.sol_received = solValue;

  //initiate wallets to send
  var sourcePotKey = latestGame.over_pot_address;
  var targetPotKey = getPublicKey58(latestGame.under_pot_address);
  if (side == "under") {
    sourcePotKey = latestGame.under_pot_address;
    targetPotKey = getPublicKey58(latestGame.over_pot_address);
  } else {
  }

  latestGame.claimableWinningPotInSol =
    Number(latestGame.claimableWinningPotInSol) - solValue;

  //transfer
  try {
    var transferClaimResult = await executeTransfer(
      latestGame.id,
      sourcePotKey,
      wallet,
      solValue - 5000
    );

    sellValue.burn_tx_signature = txSignature;
    sellValue.solana_tx_signature = transferClaimResult;
    sellValue.time = new Date().toISOString();
    sellValue.target_solana_wallet_address = wallet;

    sellValue = Object.values(sellValue);
    var insert = await executeRedeem(sellValue);

    latestGame = Object.values(latestGame);
    await updateGame(latestGame);

    await fetchCurrentGameStatus();
  } catch (e) {
    return false;
  }

  //send : 1. SOL - fee + tax to player, redistribute progressive tax
  //update to sell and game table
}

async function executeTransfer(gameId, sourcePotKey, targetPotKey, amount_) {
  //5MJcZNtXqJNWDpdT8NhRBGtgGpT4cnfipn1ZQxq8QzpU2kBWwyAWrn93jm5AtMMwEvvyxroh9zbT7DzDJA196cQ1
  //console.log("about to transfer REWARD " + amount_ + " to " + solanaWallet);
  try {
    //var sk = convertHexToSolanaSecretKey(privateKeyArray);
    var sk = base58ToSecretKeyArray(sourcePotKey);

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(targetPotKey);
    //var amountInSOL = await getSolanaWalletBalance(senderKeypair.publicKey);

    // Connect to Solana cluster (mainnet, testnet, or devnet)

    var amountInSOL = parseInt(Number(amount_));
    //console.log(senderKeypair.publicKey, "<<<<<source account");
    if (amountInSOL < 5000) {
      console.log("insufficient SOL");

      return "insufficient SOL";
    } else {
      const transactionFee = await getTransactionFee(
        connection,
        senderKeypair.publicKey
      );

      if (amountInSOL < transactionFee) return;

      amountInSOL = amountInSOL - transactionFee;
      // Fetch latest blockhash to include in the transaction

      const { blockhash } = await connection.getLatestBlockhash("finalized");

      // Create a transaction to transfer SOL
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: senderKeypair.publicKey,
      });

      const blockHeightBuffer = 150;

      // Add the instruction to send SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amountInSOL, // Convert SOL to lamports
        })
      );
      var msg = "goatPotMoving_" + gameId;
      // Add the memo instruction (memo is a string)
      // Create a memo instruction and add it to the transaction
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"), // Memo Program ID
        data: Buffer.from(msg), // Convert memo string to Buffer
      });

      // Add the memo instruction to the transaction
      transaction.add(memoInstruction);

      // Sign the transaction with the sender's keypair
      var signature = false;
      try {
        const signature__ = await sendAndConfirmTransaction(
          connection,
          transaction,
          [senderKeypair],
          {
            skipPreflight: false, // Optional: Set to true to skip preflight checks
            commitment: "confirmed", // Set desired confirmation level
            lastValidBlockHeight:
              blockhash.lastValidBlockHeight + blockHeightBuffer, // Add buffer
          }
        );
        signature = signature__;
        console.log("Transaction successful with signature:", signature);
      } catch (e) {
        return false;
      }

      return signature;
    }
  } catch (e) {
    return false;
  }
}

async function getTokenBalance(tokenMintAddress, walletAddress) {
  try {
    const tokenMint = new PublicKey(tokenMintAddress);
    const walletPublicKey = new PublicKey(walletAddress);

    var sk = base58ToSecretKeyArray(masterWallet);

    const payer = Keypair.fromSecretKey(Uint8Array.from(sk));

    const associatedTokenAddress = await getAssociatedTokenAddress(
      tokenMint,
      walletPublicKey
    );

    let accountInfo;
    try {
      // Try to fetch the token account
      accountInfo = await getAccount(connection, associatedTokenAddress);
    } catch (error) {
      if (error.name === "TokenAccountNotFoundError") {
        console.log("Token account not found. Creating it...");
        // Create the associated token account
        await createAssociatedTokenAccount(
          connection,
          payer,
          tokenMint,
          walletPublicKey
        );
        accountInfo = await getAccount(connection, associatedTokenAddress);
      } else {
        throw error; // Re-throw other errors
      }
    }

    // Return the balance
    //console.log(accountInfo, "<< acc");
    return Number(accountInfo.amount); // Convert from BigInt to number
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  }
}

function getPublicKey58(secretKey) {
 // console.log("errr5");
  return Keypair.fromSecretKey(
    Uint8Array.from(base58ToSecretKeyArray(secretKey))
  ).publicKey.toBase58();
}

var fetchingLatestGame = false;

const perSecondProcess = setInterval(async () => {
  if (process.env.DEV == "dev") {
    return;
  }

  if (retryScrape) {
    fetchingLatestGame = true;
    await startNewGame();
    fetchingLatestGame = false;
    retryScrape = false;
    return;
  }

  if (global.lastGame.status == "running") {
    const now = new Date().toISOString();
    const fetchedTimestamp = new Date(global.lastGame.data.startTime); // Replace with your fetched timestamp

    // Add 60 minutes
    const next60Minutes = new Date(fetchedTimestamp.getTime() + 60 * 60 * 1000);
    if (now > next60Minutes) {
      try {
        fetchingLatestGame = true;
        global.lastGame = {
          status: "preparing",
          message: "preparing for next round",
        };
        await settle();
      } catch (e) {}
      fetchingLatestGame = false;
    }
  }
  //return false;
  if (!fetchingLatestGame) {
    try {
      fetchingLatestGame = true;
      await fetchCurrentGameStatus();
    } catch (e) {
      fetchingLatestGame = false;
    }
    fetchingLatestGame = false;
  }
}, 1000);

async function fetchCurrentGameStatus() {
  var latest = await getGameInfo(0, true);
  var latestGame = {};
  if (latest.timeEnded != null) {
    global.lastGame = {
      status: "preparing",
      message: "preparing for next round",
    };
    return { status: "preparing", message: "preparing for next round" };
  }
  latestGame = latest;
  latestGame.under_pot_address = getPublicKey58(latest.under_pot_address);
  latestGame.over_pot_address = getPublicKey58(latest.over_pot_address);
  latestGame.goatArenaBurnerWallet = getPublicKey58(masterWallet);
  latestGame.buyers = await getBuyers(latestGame.id,false);
  delete latestGame.buy_fee;
  delete latestGame.sell_fee;
  delete latestGame.memecoinPriceStart;
  delete latestGame.memecoinPriceEnd;
  delete latestGame.overUnderPriceLine;
  /*latestGame.overPotAddress = Keypair.fromSecretKey(
    Uint8Array.from(base58ToSecretKeyArray(latest.over_pot_address))
  ).publicKey.toBase58();
  latestGame.underPotAddress = Keypair.fromSecretKey(
    Uint8Array.from(base58ToSecretKeyArray(latest.under_pot_address))
  ).publicKey.toBase58(); */
  //latestGame.startTime = latest.timeStarted;

  global.lastGame = { status: "running", data: latestGame };
  // console.log(latest, "<<< latest game");
  return latestGame;
}

async function settle() {
  const now = new Date().toISOString();
  var latestGame = await getGameInfo(gameid, false);
  if (latestGame.timeEnded != null) {
    return;
  }

  latestGame.timeEnded = now;
  latestGame.memecoin_usd_end = await getTokenPrice(
    latestGame.contractAddress,
    Number(latestGame.decimals)
  );

  var winner = "over";
  if (
    Number(latestGame.memecoin_usd_end) > Number(latestGame.memecoin_usd_start)
  ) {
    winner = "under";
  }
  var burnerSource = "";
  if (winner == "over") {
    await executeTransfer(
      0,
      latestGame.under_pot_address,
      getPublicKey58(latestGame.over_pot_address),
      Number(latestGame.underPot) - 5000
    );
    latestGame.overPot =
      Number(latestGame.overPot) + Number(latestGame.underPot);
    latestGame.underPot = 0;
    burnerSource = latestGame.over_pot_address;
  } else {
    await executeTransfer(
      0,
      latestGame.over_pot_address,
      getPublicKey58(latestGame.under_pot_address),
      Number(latestGame.overPot) - 5000
    );
    latestGame.underPot =
      Number(latestGame.overPot) + Number(latestGame.underPot);
    latestGame.overPot = 0;
    burnerSource = latestGame.under_pot_address;
  }
  latestGame = Object.values(latestGame);

  await updateGame(latestGame);

  await startNewGame();
  await fetchCurrentGameStatus();

  //burn GOATAGI total buy_fee sell_fee
}
var retryScrape = false;
async function scrapeGMGNAI() {
  const browser = await puppeteer.launch({
    headless: true, // Enable headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    console.log("Navigating to GMGN.AI...");
    await page.goto("https://gmgn.ai/?chain=sol", {
      waitUntil: "networkidle2",
    });

    console.log("Waiting for table to load...");
    await page.waitForSelector(".g-table-row"); // Wait for table rows to load

    console.log("Scraping data...");

    const gmgnData = await page.evaluate(() => {
      const rows = document.querySelectorAll(".g-table-row");
      return Array.from(rows).map((row) => {
        const getTextContent = (selector) =>
          row.querySelector(selector)?.textContent.trim() || "N/A";

        // Extract href and derive the token address
        const href =
          row.querySelector("a.css-b9ade")?.getAttribute("href") || "N/A";
        const tokenAddress = href !== "N/A" ? href.split("/").pop() : "N/A";

        return {
          Token: getTextContent(".css-j7qwjs"), // Adjust selector for token name
          TokenAddress: tokenAddress, // Extracted from href
          Age: getTextContent(".g-table-cell:nth-child(2)"),
          Liquidity_MC: getTextContent(".g-table-cell:nth-child(3)").replace(
            /'/g,
            ""
          ), // Replace invalid characters
          Bluechip_percent: getTextContent(".g-table-cell:nth-child(4)"),
          Holders: getTextContent(".g-table-cell:nth-child(5)"),
          Smart_KOL: getTextContent(".g-table-cell:nth-child(6)"),
          OneHr_Txs: getTextContent(".g-table-cell:nth-child(7)"),
          OneHr_Vol: getTextContent(".g-table-cell:nth-child(8)"),
          Price: getTextContent(".g-table-cell:nth-child(9)"),
          OneM_Percent: getTextContent(".g-table-cell:nth-child(10)"),
          FiveM_Percent: getTextContent(".g-table-cell:nth-child(11)"),
          OneHr_Percent: getTextContent(".g-table-cell:nth-child(12)"),
          DegenAudit: getTextContent(".g-table-cell:nth-child(13)"),
          Dev: getTextContent(".g-table-cell:nth-child(14)"),
        };
      });
    });

    // Ensure all keys and values are in proper JSON format

    await browser.close();
    const randomIndex = Math.floor(Math.random() * gmgnData.length);
    const randomMemecoin = gmgnData[randomIndex];

    // Ensure all keys and values are in proper JSON format
    const validJson = JSON.stringify(randomMemecoin, null, 2);

    console.log("Random Memecoin (Valid JSON):", validJson);
    await browser.close();
    return validJson; // Return the randomized memecoin as valid JSON
  } catch (error) {
    console.error("Error during scraping:", error.message);
    await browser.close();
    retryScrape = true;
    return false;
  }
}

async function getTokenMetadata(mintAddress) {
  //const connection = await rpc.get();
  var m = "F15Vp1vqJdQ58Usk4T4GDcL7YGegcp1pznHrpt9opump";
  const tpublicKey = new PublicKey(mintAddress);
  const metaplex = Metaplex.make(connection);

  let name;
  let symbol;
  let logo;

  const metadataAccount = metaplex.nfts().pdas().metadata({ mint: tpublicKey });

  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);
  const tokenAccountInfo = await connection.getParsedAccountInfo(tpublicKey);
  var decimals = 0;
  if (!tokenAccountInfo || !tokenAccountInfo.value) {
    throw new Error("Failed to fetch token account info.");
  }

  // Extract decimals from the token mint account data
  decimals = tokenAccountInfo.value.data.parsed.info.decimals;

  if (metadataAccountInfo) {
    const token = await metaplex.nfts().findByMint({ mintAddress: tpublicKey });
    name = token.name;
    symbol = token.symbol;
    logo = token.json?.image;
  } else {
    const provider = await new TokenListProvider().resolve();
    const tokenList = provider.filterByChainId(ENV.MainnetBeta).getList();
    console.log(tokenList);
    const tokenMap = tokenList.reduce((map, item) => {
      map.set(item.address, item);
      return map;
    }, new Map());

    const token = tokenMap.get(tpublicKey.toBase58());

    name = token.name;
    symbol = token.symbol;
    logo = token.logoURI;
  }

  return {
    name,
    symbol,
    logo,
    decimals,
  };
}

module.exports = {
  buyToken,
  scrapeGMGNAI,
  startNewGame,
  fetchCurrentGameStatus,
  sellToken,
  validateBurnTransaction,
  validateTransaction,
  redeemToken,
};
