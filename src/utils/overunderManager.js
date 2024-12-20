const crypto = require("crypto");
const fetch = require("node-fetch");

const fs = require("fs");
const {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  createBurnInstruction,
  burn,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
// Write to a file asynchronously

if (!global.fetch) {
  global.fetch = fetch;
}
const solIDL = require("../ic/dragonsolminter");
const coreIDL = require("../ic/core");
const overunderIDL = require("../ic/overunder");
const {
  RPC_ENDPOINT,
  RPC_WEBSOCKET_ENDPOINT,
  TOKEN_MINT,
} = require("./constants");
const { execute } = require("./legacy");
const { getBuyTransaction, getSellTransaction } = require("./swap");
//const Moralis = require("moralis").default;
const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const Identity = require("@dfinity/identity-secp256k1").Secp256k1KeyIdentity;
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;
const Principal = require("@dfinity/principal").Principal;
const { MemoProgram } = require("@solana/spl-memo");
const fromHexString =
  require("@dfinity/candid/lib/cjs/utils/buffer").fromHexString;
const bs58 = require("bs58");

// Function to convert a Base58 encoded secret key to a Uint8Array
function base58ToSecretKeyArray(base58Key) {
  return bs58.decode(base58Key); // Decode Base58 to Uint8Array
} /* */
var currentGame = {};
/* parameters */
const tokenMintAddress = "33a14qXWo1MB7uXtTh5ifyvox7FdGRPQbsws41gfpump";
const TOKEN_MINT_ADDRESS = "33a14qXWo1MB7uXtTh5ifyvox7FdGRPQbsws41gfpump"; // Token mint address
const masterICP =
  "0be033f837a725b80409a64329f09721785aba8adf97535a93e5fbeacf933e31";
var queue_ = {};
var block = "0";
var index = 0;
/*async function initMoralis() {
  await Moralis.start({
    apiKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQwM2I5MGNhLWYyOTQtNDIyZi1hZjliLTdkZWY0ODkxZjc1ZiIsIm9yZ0lkIjoiMzgzMDc5IiwidXNlcklkIjoiMzkzNjE2IiwidHlwZUlkIjoiNmI2YzllMDYtMzY1YS00YjczLTgwOTctNjhhMzYyMjUzYWMwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA1Nzg5NjIsImV4cCI6NDg2NjMzODk2Mn0.3CZeHLt8KeOlcfT5pdLhzUExnVCBzS01Uos34tyszGs", // Store API key in environment variables for security
  });
} */

var currentProcessCount = 0;
var maxProcessPerSecond = 15;

function createCanisterAgent(options = {}, canisterId_, idl_) {
  var args = {};

  args["host"] = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/";
  args["identity"] = options.identity;
  const agent = new HttpAgent(args);
  //af353-wyaaa-aaaak-qcmtq-cai
  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }
  var canisterId = canisterId_;
  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idl_, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
}

var userIdentity = getUserIdentity(masterICP);
var dragonSOLMinter_ = createCanisterAgent(
  {
    identity: userIdentity,
  },
  "65ga4-5yaaa-aaaam-ade6a-cai",
  solIDL
);

var overUnderAgent = createCanisterAgent(
  {
    identity: userIdentity,
  },
  "u6oqn-kyaaa-aaaam-adwmq-cai",
  overunderIDL
);

var dragonCore_ = createCanisterAgent(
  {
    identity: userIdentity,
  },
  "p7g6o-ayaaa-aaaam-acwea-cai",
  coreIDL
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUserIdentity(privKey) {
  try {
    const userIdentity = Identity.fromSecretKey(fromHexString(privKey));
    //console.log(userIdentity, "<<<<<< user Id");
    return userIdentity;
  } catch (error) {
    console.log(error, "<<<<<< err user Id");
    return null;
  }
}

async function placeBet(solanaWallet, betAmount, betType, gameId, signature) {
  var a = await validateTransaction(solanaWallet, betAmount, signature);
  //var a = true;
  if (a == false) {
    for (var v = 0; v < 2; v++) {
      a = await validateTransaction(solanaWallet, betAmount, signature);
      if (a) break;
      await sleep(1000);
    }
  }
  if (a == true) {
    console.log("placing bet");
    var betLamport = parseInt(betAmount);
    var betResult = await overUnderAgent.place_bet(
      solanaWallet,
      Number(betType),
      Number(betLamport),
      Number(gameId),
      signature
    );
    if (betResult.success) {
      var ad = betResult.success.ok;
      currentGame = JSON.parse(serializeBigInt(ad));
      if (wrd) currentGame.words = wrd;
      return { result: true, gameData: currentGame };
    } else {
      if (betResult.closed) {
        var a = executeTransfer(gameId, solanaWallet, betLamport, 1, false);
        return { result: false, error: "Game session is closed" };
      } else if (betResult.invalidTx) {
        return { result: false, error: "Invalid transaction" };
      }
    }
  } else {
    return { result: false, error: "Invalid transaction" };
  }
  //validate transaction
  //if true, place bet
  //return value
}

async function getBasicTokenInfo() {
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );
  try {
    const mintPublicKey = new PublicKey(tokenMintAddress);
    const mintAccountInfo = await connection.getParsedAccountInfo(
      mintPublicKey
    );

    if (!mintAccountInfo || !mintAccountInfo.value) {
      console.log("Token mint account not found:", tokenMintAddress);
      return null;
    }

    const parsedInfo = mintAccountInfo.value.data.parsed.info;
    return {
      symbol: "CustomToken", // Placeholder if no metadata is available
      decimals: parsedInfo.decimals,
      supply: parsedInfo.supply,
    };
  } catch (error) {
    console.error("Error fetching basic token info:", error.message);
    return null;
  }
}
const overunderPool =
  "3hLuCRahctFkE4n38kWbqGwD153y5ve2usbnKgTaSGH6LHR2D7YEVqoeJf43Qf5xP5MqLxgsA2b5Dz7KNYsKZG51";

const PHANTOM_SECRET_KEY =
  "3cn35B2Nq3YKAW7o8xg1XfdCFpLrEMzrR65vnxLqgbWGV83bFdzr6KymN8fFt9wVTkwMu5Y1g8GTdfC3RM5Tz2c4"; // Replace with your Phantom secret key
const AMOUNT_TO_BURN = 1000000; // Amount of tokens to burn

async function burnTokens() {
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );

  try {
    // Decode the Base58 secret key
    const secretKey = bs58.decode(overunderPool);

    // Create wallet from the decoded secret key
    const wallet = Keypair.fromSecretKey(secretKey);

    console.log("Wallet Address:", wallet.publicKey.toBase58());

    // Token mint public key
    const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);

    // Get the associated token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      {
        mint: mintPublicKey,
      }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error("No token account found for the provided mint.");
    }

    const tokenAccount = tokenAccounts.value[0].pubkey;

    console.log("Token Account Address:", tokenAccount.toBase58());

    // Fetch the token account's balance
    const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info;
    const tokenBalance = BigInt(tokenAccountInfo.tokenAmount.amount); // Use BigInt for large balances

    if (tokenBalance === 0n) {
      throw new Error("Token account balance is zero. Nothing to burn.");
    }

    console.log("Token Balance to Burn:", tokenBalance.toString());

    // Create a Burn Instruction to burn all tokens
    const burnInstruction = createBurnInstruction(
      tokenAccount, // Token account
      mintPublicKey, // Token mint
      wallet.publicKey, // Owner of the token account
      tokenBalance, // Entire token balance
      [] // No multisigners
    );

    // Create a Transaction
    const transaction = new Transaction().add(burnInstruction);

    console.log("Preparing transaction...");

    // Send the transaction
    const signature = await connection.sendTransaction(transaction, [wallet]);
    console.log("Transaction Signature:", signature);

    await connection.confirmTransaction(signature, "confirmed");
    console.log(`Successfully burned ${tokenBalance.toString()} tokens.`);
    return true;
  } catch (error) {
    console.error("Error burning tokens:", error.message);
    return false;
  }
}

/**
 * Buy a token from a DEX
 * @param {number} solAmount - Amount of SOL to spend
 */
//const TOKEN_MINT_ADDRESS = "7FuThbsCZWm3qPT3a3eThKFdrDDX5BBCiPkxNxQmpump"; // Token mint address
const POOL_ADDRESS = "GA7F1qG2521jKwW4kTLpjurMFdH9HUWUSynyX7djtCtB"; // Pool address
//const POOL_ADDRESS = "2SHB5pAXEhUNs8REx9VFLWAogHxK3HoZg1bBbocFP4JD";
/**
 * Buy tokens from a liquidity pool
 * @param {number} solAmount - Amount of SOL to spend
 */

//const TOKEN_MINT_ADDRESS = "7FuThbsCZWm3qPT3a3eThKFdrDDX5BBCiPkxNxQmpump"; // Token mint address
//const POOL_ADDRESS = "GA7F1qG2521jKwW4kTLpjurMFdH9HUWUSynyX7djtCtB"; // Pool address
const PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"); // Replace with the program ID managing the pool

/**
 * Swap SOL for tokens via custom liquidity pool
 * @param {number} solAmount - Amount of SOL to spend
 */
async function swapSOLForToken(newWallet, baseMint, buyAmount) {
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );
  let solBalance = 0;
  try {
    solBalance = await connection.getBalance(newWallet.publicKey);
  } catch (error) {
    console.log("Error getting balance of wallet");
    return null;
  }
  if (solBalance == 0) {
    return null;
  }
  console.log("buying " + buyAmount + " sol");
  try {
    let fetch = await getBuyTransaction(newWallet, baseMint, buyAmount);
    console.log("getting " + fetch + " moustache");
    if (fetch == null) {
      console.log(`Error getting buy transaction`);
      return null;
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    console.log("executing buy");
    const txSig = await execute(fetch.transaction, latestBlockhash, 1);

    if (txSig) {
      const tokenBuyTx = txSig ? `https://solscan.io/tx/${txSig}` : "";
      console.log("Success in buy transaction: ", tokenBuyTx);
      return { tx: tokenBuyTx, amount: fetch.purchasedAmount };
    } else {
      return null;
    }
  } catch (error) {
    console.log(error, "<<<< error");
    return null;
  }
}

async function buyAndBurnTokens(amount, gameid) {
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );

  var sk = base58ToSecretKeyArray(overunderPool);

  const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
  try {
    var b = await swapSOLForToken(
      senderKeypair,
      new PublicKey(tokenMintAddress),
      amount
    );
    if (b == null) {
      return false;
    }
    var a = await burnTokens();
    if (a) {
      try {
        var bt = overUnderAgent.updateTokenBurnt(
          parseInt(Number(gameid)),
          parseInt(Number(b.amount))
        );
      } catch (e) {
        console.log(e, "<<< update token burnt error");
      }
      return "burn success";
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error during buy-and-burn process:", error);
    return false;
  }
}

function serializeBigInt(data) {
  return JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
}

async function getCurrentGame() {
  //console.log(currentGame, "<<<<cg");
  if (!currentGame.id) {
    currentGame = await overUnderAgent.getCurrentGame();
    currentGame = JSON.parse(serializeBigInt(currentGame));
    //console.log(currentGame);
    currentGame = currentGame.ok.game;
    if (wrd) currentGame.words = wrd;
  }
  if (wrd) currentGame.words = wrd;
  return currentGame;
}

async function transferCustomToken(recipientAddress, amount) {
  try {
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
    const senderKeypair = Keypair.fromSecretKey(bs58.decode(overunderPool));
    const recipientPublicKey = new PublicKey(recipientAddress);
    const tokenMint = new PublicKey(tokenMintAddress);

    // Get or create the associated token account for the recipient
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      tokenMint,
      recipientPublicKey
    );

    // Get the sender's associated token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      tokenMint,
      senderKeypair.publicKey
    );

    // Create a transaction to transfer the tokens
    const transaction = new Transaction().add(
      transfer(
        connection,
        senderKeypair,
        senderTokenAccount.address,
        recipientTokenAccount.address,
        senderKeypair.publicKey,
        amount
      )
    );

    // Send and confirm the transaction
    const signature = await connection.sendTransaction(transaction, [
      senderKeypair,
    ]);
    console.log(`Transaction successful with signature: ${signature}`);
  } catch (error) {
    console.error("Error transferring custom token:", error.message);
  }
}

async function updateGame() {
  //console.log(currentGame, "<<<<cg");
  // if (!currentGame.id) {
  currentGame = await overUnderAgent.getCurrentGame();
  currentGame = JSON.parse(serializeBigInt(currentGame));
  //console.log(currentGame);
  currentGame = currentGame.ok.game;
  if (wrd) currentGame.words = wrd;
  //}

  return currentGame;
}

async function validateTransaction(
  senderWallet,

  amount,
  transactionSignature
) {
  var targetWallet = "BaQg4qPAgVMwESKsybGe2oJXz532jMYVkCq1KmW3xt8B";
  try {
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
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

async function getAllBalances() {
  try {
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
    const tokenMint = new PublicKey(tokenMintAddress);

    // Fetch all token accounts associated with the mint
    const tokenAccounts = await connection.getParsedProgramAccounts(
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // Token Program ID
      {
        filters: [
          {
            dataSize: 165, // Size of a token account
          },
          {
            memcmp: {
              offset: 0, // Mint address starts at byte 0
              bytes: tokenMint.toBase58(), // Filter by mint address
            },
          },
        ],
      }
    );

    console.log(`Found ${tokenAccounts.length} token accounts.`);

    // Filter accounts with non-zero balance
    const uniqueHolders = new Set();
    for (const { account } of tokenAccounts) {
      const tokenAmount = BigInt(account.data.parsed.info.tokenAmount.amount);

      if (tokenAmount > 0n) {
        uniqueHolders.add(account.data.parsed.info.owner);
      }
    }

    console.log(`Total unique holders: ${uniqueHolders.size}`);
    return uniqueHolders.size;
  } catch (error) {
    console.error("Error fetching token holders:", error);
    throw error;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var currentSecond = 0;
var fetchingNewData = false;
var botCount = 0;
const perSecondProcess = setInterval(async () => {
  //return false;
  if (process.env.DEV == "dev") return;
  if (!fetchingNewData) {
    //var x = await generateWallets();
    var currentId = currentGame.id;
    if (
      Number(currentGame.totalBets) > 0 ||
      !currentGame.id ||
      currentGame.is_spinning
    ) {
      //console.log("fetching new data...");
      fetchingNewData = true;

      currentGame = await overUnderAgent.getCurrentGame();

      currentGame = JSON.parse(serializeBigInt(currentGame));
      currentGame = currentGame.ok.game;
      if (Number(currentId) != Number(currentGame.id) || !wrd) {
        console.log(
          currentId +
            " and " +
            currentGame.id +
            " wrd " +
            wrd +
            " ---- " +
            " so get quote"
        );
        getQuote();
      }
      //if (wrd) currentGame.words = wrd;
      fetchingNewData = false;
    }
    if (!wrd) {
      //if (currentId != currentGame.id) {
      //console.log("try to fetch quote");
      console.log(
        currentId +
          " and " +
          currentGame.id +
          " wrd " +
          wrd +
          " ---- " +
          " so get quote 22"
      );
      getQuote();
    }
  }

  //randomize bot
  //if currentsecond bot < 10
  //random amount of bot
  //pick random bot as per amount
  //place bet
  //add total bot
}, 1000);
function getRandomNumber(max) {
  if (max < 1) {
    throw new Error("Maximum value must be greater than or equal to 1");
  }
  return Math.floor(Math.random() * max) + 1;
}
var botInProgress = false;
var botActive = 0;
const quicknodeConn = new Connection(
  "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
  "confirmed"
);
async function getMasterWalletBalance() {
  var sk = base58ToSecretKeyArray(masterBotKey);

  const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));

  var bal = await getSolanaWalletBalanceQuicknode(
    quicknodeConn,
    senderKeypair.publicKey
  );
  return {
    balance: bal / 1e9,
    currentGameId: currentGame.id,
    currentBot: bot_x,
    targetBot: botAmount,
    botSession: bot_id,
  };
}
var bot_id = 0;
var botAmount = 0;
var bot_x = 0;
const bots = setInterval(async () => {
  return false;
  if (process.env.DEV == "dev") return false;
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );
  if (botInProgress) return;
  botInProgress = true;
  bot_id += 1;
  try {
    var c = await updateGame();
    if (currentGame.is_spinning) {
      botInProgress = false;
      return false;
    }
    var sk = base58ToSecretKeyArray(masterBotKey);

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));

    var bal = await getSolanaWalletBalanceQuicknode(
      connection,
      senderKeypair.publicKey
    );
    console.log("master wallet balance " + bal);
    //return false;
    botAmount = getRandomNumber(10);
    if (secretKeys.length === 0) {
      await generateWallets();
    }
    console.log("bot amount : " + botAmount);
    bot_x = 0;
    for (var b = 0; b < botAmount; b++) {
      bot_x += 1;
      var t = await updateGame();
      if (currentGame.is_spinning || currentGame.totalBets > 2) {
        botInProgress = false;
        return false;
      }
      const botIndex = getRandomNumber(20) - 1;

      var bet = getRandomNumber(2);
      if (currentGame.dice == 6) bet = 2;
      if (currentGame.dice == 1) bet = 1;
      botActive += 1;
      try {
        var p = await botPlay(
          secretKeys[botIndex],
          currentGame.id,
          publicKeys[botIndex],
          10000000,
          bet
        );
      } catch (e) {}

      var w = getRandomNumber(3000);
      await sleep(w + 500);
    }
    console.log("bot session done");
  } catch (e) {
    botInProgress = false;
  }
  botInProgress = false;
  //place bet
  //add total bot
}, 20000);

var transferInprogress = false;
var secretKeys = [];
var publicKeys = [];
var x = generateWallets();
const masterBotKey =
  "qzXadzHRo2XvqbxdhhF4HDu2Hjs8PukQsK2geaRD79AauMad4MoeSqSgLfX7rqorNTJRDBYqiAiWDouiXmUkLjU";

async function generateWallets() {
  const f1 = "k.txt";
  const f2 = "p.txt";
  var ss = await readSecretKeysFromFile(f1);
  var pp = await readSecretKeysFromFile(f2);
  //console.log(ss, "<<<<<<< ss");
  if (ss.length >= 20 && pp.length >= 20) {
    console.log("keys already generated");
    secretKeys = ss;
    publicKeys = pp;
    //for (let i = 0; i < 20; i++) {
    // console.log("pair " + i + " : " + secretKeys[i] + " - " + publicKeys[i]);
    // }
    return;
  }
  console.log("generating wallets");
  var tempSK = [];
  var tempPK = [];
  for (let i = 0; i < 20; i++) {
    // Generate a new random Keypair
    const keypair = Keypair.generate();

    // Convert the secret key (Uint8Array) to Base58
    const secretKeyBase58 = bs58.encode(keypair.secretKey);
    tempSK.push(secretKeyBase58);
    var sk = base58ToSecretKeyArray(secretKeyBase58);
    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    tempPK.push(senderKeypair.publicKey);
  }

  // Write the keys to a file
  await fs.writeFileSync(f1, tempSK.join("\n"), "utf8");
  await fs.writeFileSync(f2, tempPK.join("\n"), "utf8");
  secretKeys = await readSecretKeysFromFile(f1);
  publicKeys = await readSecretKeysFromFile(f2);
  for (let i = 0; i < 20; i++) {
    console.log("pair " + i + " : " + secretKeys[i] + " - " + publicKeys[i]);
  }
  console.log(`Generated keys written to ${f1} and ${f2}`);
}

function readSecretKeysFromFile(filename) {
  if (!fs.existsSync(filename)) {
    console.error(`File not found: ${filename}`);
    return [];
  }

  // Read the file content
  const fileContent = fs.readFileSync(filename, "utf8");

  // Split file content into lines and add each line to the array
  const secretKeysArray = fileContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  return secretKeysArray;
}
const tokenMode = true;

const transferReward = setInterval(async () => {
  //return false;
  if (process.env.DEV == "dev") return false;
  try {
    console.log("transferring rewards");
    if (transferInprogress) return;
    transferInprogress = true;
    //console.log("<<<<<<< getting pending pays");
    var pendingPays = await overUnderAgent.getPendingPayments();

    // console.log(pendingPays.length, "<<<<<<< pending pays");
    if (pendingPays.length === 0) {
      transferInprogress = false;
      return false;
    }

    for (var g = 0; g < pendingPays.length; g++) {
      var gamePay = pendingPays[g][1];
      var totalReward = 0;
      var totalBurn = 0;
      var gameId = parseInt(pendingPays[g][0]);
      for (var i = 0; i < gamePay.length; i++) {
        //console.log(pendingPays[i][1]);
        var playData = gamePay[i];
        if (playData != []) {
          var win =
            (97.5 / 100) * Number(playData.amount) * playData.multiplier;
          totalBurn += (2.5 / 100) * (Number(playData.amount) / (97.5 / 100));
          totalReward += win;
          //if (!tokenMode) {
          console.log("transferring..");
          var a = executeTransfer(
            Number(playData.id),
            playData.solanaWalletAddress,
            Number(win),
            Number(playData.bet),
            true
          );

          await sleep(120);
        }
      }
      if (tokenMode) {
        var j = buyAndBurnTokens(totalBurn, gameId);
      }
    }

    transferInprogress = false;
    /*var c = await buyAndSendTokens(
      pendingBurn,
      "11111111111111111111111111111111"
    );*/
  } catch (e) {
    transferInprogress = false;
  }
}, 10000);

async function testReward() {
  var pendingPays = await overUnderAgent.testGetPendingPayments();
  // console.log(pendingPays.length, "<<<<<<< pending pays");
  if (pendingPays.length === 0) {
    transferInprogress = false;
    return false;
  }

  for (var g = 0; g < pendingPays.length; g++) {
    var gamePay = pendingPays[g][1];
    var totalReward = 0;
    var totalBurn = 0;
    var gameId = parseInt(pendingPays[g][0]);
    console.log("gameid = " + gameId);
    console.log(pendingPays[g]);
    for (var i = 0; i < gamePay.length; i++) {
      //console.log(pendingPays[i][1]);
      var playData = gamePay[i];
      if (playData != []) {
        console.log(totalBurn, "<<< burn counting");
        var win = (97.5 / 100) * Number(playData.amount) * playData.multiplier;
        totalBurn += (2.5 / 100) * (Number(playData.amount) / (97.5 / 100));

        totalReward += win;
        //if (!tokenMode) {
        console.log("transferring..");
        /*
        var a = executeTransfer(
          Number(playData.id),
          playData.solanaWalletAddress,
          Number(win),
          Number(playData.bet),
          true
        );

        await sleep(120); */
      }
    }
    // if (tokenMode) {
    console.log("burning " + totalBurn);
    var j = await buyAndBurnTokens(totalBurn, gameId);
    return { a: j };
    //}
  }
  return { a: "done" };
  console.log("done pay");
}

async function getTransactionFee(connection, payerPublicKey) {
  // Get the latest blockhash and fee calculator
  const { blockhash } = await connection.getLatestBlockhash("finalized");

  // Create a test transaction (just to calculate the fee)
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payerPublicKey,
  });

  // Add a basic transfer instruction (this will not be signed or sent)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payerPublicKey,
      toPubkey: new PublicKey("11111111111111111111111111111111"), // Dummy public key
      lamports: 1, // Minimum lamports just for the calculation
    })
  );

  // Get fee for the constructed message
  const fee = await connection.getFeeForMessage(
    transaction.compileMessage(),
    "finalized"
  );

  return fee.value;
}

async function getBlock() {
  return block;
}
var gettingQuote = false;
var wrd = false;
async function getQuote() {
  if (gettingQuote) return;
  console.log("fetching quote,,,");
  gettingQuote = true;
  const url =
    "http://167.99.66.191:3000/ef6eef20-1a5e-0b92-9329-86f656456203/message?userName=frontend&name=overunder&text=give%20advice%20or%20words%20of%20wisdom%20in%20less%20than%2020%20words";

  // Request payload (query parameters)
  const requestBody = {
    userName: "frontend",
    name: "overunder",
    text: "give me jokes or words of wisdom as I about to bet, in less than 20 words",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      gettingQuote = false;
      console.log(response);
    }

    const data = await response.json();
    console.log("Response data:", data);
    console.log(data[0].text, "<<< text");
    wrd = data[0].text;
    gettingQuote = false;
    return data;
  } catch (error) {
    console.error("Error fetching message:", error);
    gettingQuote = false;
    //throw error;
  }
}

async function getSolanaWalletBalanceQuicknode(connection, walletAddress) {
  try {
    //const publicKey = new PublicKey(walletAddress);
    const balanceInLamports = await connection.getBalance(walletAddress);
    //const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    const balanceInSol = balanceInLamports;
    //console.log(`Balance for ${walletAddress}: ${balanceInSol} SOL`);
    return balanceInLamports;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

async function executeTransfer(
  gameId,
  solanaWallet,
  amount_,
  bet,
  updateCanister
) {
  //5MJcZNtXqJNWDpdT8NhRBGtgGpT4cnfipn1ZQxq8QzpU2kBWwyAWrn93jm5AtMMwEvvyxroh9zbT7DzDJA196cQ1
  //console.log("about to transfer REWARD " + amount_ + " to " + solanaWallet);
  try {
    //var sk = convertHexToSolanaSecretKey(privateKeyArray);
    var sk = base58ToSecretKeyArray(overunderPool);
    var datafeed = solanaWallet + "|" + gameId + "|" + amount_;
    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(solanaWallet);
    //var amountInSOL = await getSolanaWalletBalance(senderKeypair.publicKey);

    // Connect to Solana cluster (mainnet, testnet, or devnet)
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
    var amountInSOL = parseInt(Number(amount_));
    //console.log(senderKeypair.publicKey, "<<<<<source account");
    if (amountInSOL < 5000) {
      console.log("insufficient SOL");

      return "insufficient SOL";
    } else {
      console.log(
        "about to transfer REWARD " + amountInSOL,
        "<<<<<<<<<<<<< transfer"
      );
      const transactionFee = await getTransactionFee(
        connection,
        senderKeypair.publicKey
      );
      //console.log(transactionFee, "<<<<<<<< trfee");
      if (amountInSOL < transactionFee) return;
      //var amountMinted = parseInt(amountInSOL);
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
      var msg = "overUnderReward_" + gameId;
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
        if (updateCanister) {
          var s = overUnderAgent.failedTransfer(
            "" + gameId,
            datafeed,
            solanaWallet
          );
        }
        fs.appendFile(
          "errorTransfer.txt",
          " transfer error : " + e.toString() + "\n",
          (err) => {
            if (err) {
              console.error("Error appending to file:", err);
            } else {
              console.log("Content appended successfully!");
            }
          }
        );
        return false;
      }

      if (signature) {
        try {
          // console.log("Minting DSOL of " + amountMinted);
          if (updateCanister) {
            var s = overUnderAgent.successfulTransfer(
              "" + gameId,
              datafeed,
              solanaWallet
            );
          }
        } catch (e) {
          if (updateCanister) {
            var s = overUnderAgent.failedTransfer(
              "" + gameId,
              datafeed,
              solanaWallet
            );
          }
          fs.appendFile(
            "errorTransfer.txt",
            "error : " + e.toString() + "\n",
            (err) => {
              if (err) {
                console.error("Error appending to file:", err);
              } else {
                console.log("Content appended successfully!");
              }
            }
          );
        }
      }

      return signature;
    }
  } catch (e) {
    console.log(e, "<<<<<<<<<<<eee");
    currentProcessCount -= 1;
    fs.appendFile(
      "errorTransfer.txt",
      " other error : " + e.toString() + "\n",
      (err) => {
        if (err) {
          console.error("Error appending to file:", err);
        } else {
          console.log("Content appended successfully!");
        }
      }
    );
  }
}

async function botPlay(key, gameId, solanaWallet, amount_, bet) {
  //5MJcZNtXqJNWDpdT8NhRBGtgGpT4cnfipn1ZQxq8QzpU2kBWwyAWrn93jm5AtMMwEvvyxroh9zbT7DzDJA196cQ1
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );
  try {
    // console.log("play bot");
    //var sk = convertHexToSolanaSecretKey(privateKeyArray);
    var sk = base58ToSecretKeyArray(key);

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(
      "BaQg4qPAgVMwESKsybGe2oJXz532jMYVkCq1KmW3xt8B"
    ); // overunder wallet
    //var amountInSOL = await getSolanaWalletBalance(senderKeypair.publicKey);
    var bal = await getSolanaWalletBalanceQuicknode(
      connection,
      senderKeypair.publicKey
    );
    // Connect to Solana cluster (mainnet, testnet, or devnet)

    var amountInSOL = parseInt(Number(amount_));
    //console.log(senderKeypair.publicKey, "<<<<<source account");
    if (bal < amountInSOL + 5000) {
      console.log("insufficient SOL");
      var mb = await masterBotTransfer(150000000, solanaWallet);
      if (mb == false) {
        botActive -= 1;
        return "insufficient SOL";
      }
    } else {
      console.log(
        "about to transfer " + amountInSOL,
        "<<<<<<<<<<<<< bot play game transfer"
      );

      //console.log(transactionFee, "<<<<<<<< trfee");

      //var amountMinted = parseInt(amountInSOL);

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
      var msg = "";
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
        botActive -= 1;
        return false;
      }

      if (signature) {
        try {
          console.log("placing bet for  " + solanaWallet);
          var n = placeBet(solanaWallet, amountInSOL, bet, gameId, signature);
          // if (n.result) console.log("bet placed");
          botActive -= 1;
          return n;
          // console.log("Minting DSOL of " + amountMinted);
          //placebet
        } catch (e) {}
      }
      botActive -= 1;
      return false;
    }
  } catch (e) {
    botActive -= 1;
    return false;
  }
}

async function masterBotTransfer(amount, solanaWallet) {
  //5MJcZNtXqJNWDpdT8NhRBGtgGpT4cnfipn1ZQxq8QzpU2kBWwyAWrn93jm5AtMMwEvvyxroh9zbT7DzDJA196cQ1
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );
  try {
    //var sk = convertHexToSolanaSecretKey(privateKeyArray);
    var sk = base58ToSecretKeyArray(masterBotKey);

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(solanaWallet); // overunder wallet
    //var amountInSOL = await getSolanaWalletBalance(senderKeypair.publicKey);
    var bal = await getSolanaWalletBalanceQuicknode(
      connection,
      senderKeypair.publicKey
    );
    // Connect to Solana cluster (mainnet, testnet, or devnet)
    console.log(
      "master wallet about to transfer " + amount + " | balance " + bal
    );
    var amountInSOL = parseInt(Number(amount));
    //console.log(senderKeypair.publicKey, "<<<<<source account");
    if (bal < amountInSOL + 5000) {
      console.log("insufficient SOL");
      //masterbot transfer

      return false;
    } else {
      //console.log("about to transfer " + amountInSOL, "<<<<<<<<<<<<< transfer");
      const transactionFee = await getTransactionFee(
        connection,
        senderKeypair.publicKey
      );
      console.log(transactionFee, "<<<<<<<< trfee");

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
          lamports: amountInSOL,
        })
      );
      var msg = "";
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

      if (signature) {
        return true;
      }
    }
  } catch (e) {
    return false;
  }
}

module.exports = {
  getBlock,
  getQuote,
  validateTransaction,
  getCurrentGame,
  placeBet,
  executeTransfer,
  testReward,
  getAllBalances,
  getMasterWalletBalance,
};
