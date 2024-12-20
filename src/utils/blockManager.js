const crypto = require("crypto");
const fetch = require("node-fetch");
const fs = require("fs");

// Write to a file asynchronously

if (!global.fetch) {
  global.fetch = fetch;
}
const solIDL = require("../ic/dragonsolminter");
const coreIDL = require("../ic/core");
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

/* parameters */
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

/*async function getSolanaWalletBalance(walletAddress) {
  try {
    const response = await Moralis.SolApi.account.getBalance({
      network: "mainnet", // Use 'testnet' or 'devnet' if required
      address: walletAddress,
    });
    //console.log(response.jsonResponse, "<<< r");
    // Convert the balance from lamports to SOL
    const balanceInSol = parseFloat(Number(response.jsonResponse.lamports)); // 1 SOL = 1,000,000,000 lamports
    return balanceInSol;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
} */

async function getSolanaWalletBalanceQuicknode(connection, walletAddress) {
  try {
    //const publicKey = new PublicKey(walletAddress);
    const balanceInLamports = await connection.getBalance(walletAddress);
    //const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    const balanceInSol = balanceInLamports;
    console.log(`Balance for ${walletAddress}: ${balanceInSol} SOL`);
    return balanceInSol;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var prevSecondCount = 0;
var currentProcessCount = 0;
var maxProcessPerSecond = 15;
const processCountListener = setInterval(async () => {
  //check canister for queue every 5 secs

  if (prevSecondCount >= currentProcessCount) {
    currentProcessCount = 0;
  } else {
    prevSecondCount = currentProcessCount;
  }
}, 1100);

async function updateBalance() {
  try {
    var updateRequest = "";
    updateRequest = await dragonSOLMinter_.getUpdateRequest();
    if (updateRequest.length > 0)
      console.log(updateRequest, "<<<<<< update requests");

    for (const req of updateRequest) {
      if (!queue_[req[1]]) {
        queue_[req[1]] = true;
        //transfer
        console.log(req[0], "<<<<<<<<<<< handling update request");
        currentProcessCount += 1;
        while (currentProcessCount >= maxProcessPerSecond - 1) {
          await sleep(1000);
        }
        var transferResult = mintDSOL(req[0], req[1]);

        //call update balance
      } else {
        console.log(
          req[0],
          "<<<<<<<<<<< update request is already being handled"
        );
      }
    }

    /*updateRequest.forEach((req) => {
      if (!queue_[req[1]]) {
        queue_[req[1]] = true;
        //transfer
        console.log(req[0], "<<<<<<<<<<< handling request");

        var transferResult = mintDSOL(req[0], req[1]);

        //call update balance
      } else {
        console.log(req[0], "<<<<<<<<<<< is already being handled");
      }
    });*/

    return true;
  } catch (e) {
    console.log(e, "<<<<<< error updating balance");
    return "" + e;
    //}
  }
}

async function burnBalance() {
  try {
    var wdRequest = "";
    wdRequest = await dragonSOLMinter_.getWithdrawRequest();
    if (wdRequest.length > 0)
      console.log(wdRequest, "<<<<<< withdraw requests");

    for (const req of wdRequest) {
      var queueid = "burn" + req[0];
      if (!queue_[queueid]) {
        queue_[queueid] = true;
        //transfer
        console.log(queueid, "<<<<<<<<<<< handling withdraw request");
        var datas = req[1];
        var principal = datas.principal;
        var amount = Number(datas.amount);
        var targetWallet = datas.targetWallet;
        console.log(
          "burning " +
            amount +
            " and send to  " +
            targetWallet +
            " by " +
            principal
        );
        currentProcessCount += 1;
        while (currentProcessCount >= maxProcessPerSecond - 1) {
          await sleep(1000);
        }
        var transferResult = burnDSOL(req[0], principal, targetWallet, amount);

        //call update balance
      } else {
        console.log(req[0], "<<<<<<<<<<< is already being handled");
      }
    }

    /* wdRequest.forEach((req) => {
      var queueid = "burn" + [req[0]];
      if (!queue_[queueid]) {
        queue_[queueid] = true;
        //transfer
        console.log(queueid, "<<<<<<<<<<< handling withdraw request");
        var datas = req[1];
        var principal = datas.principal;
        var amount = Number(datas.amount);
        var targetWallet = datas.targetWallet;
        console.log(
          "burning " +
            amount +
            " and send to  " +
            targetWallet +
            " by " +
            principal
        );
        var transferResult = burnDSOL(req[0], principal, targetWallet, amount);

        //call update balance
      } else {
        console.log(req[0], "<<<<<<<<<<< is already being handled");
      }
    }); */

    return true;
  } catch (e) {
    console.log(e, "<<<<<< error updating balance");
    return "" + e;
    //}
  }
}

function hexToUint8Array(hex) {
  if (hex.length % 2 !== 0)
    throw new Error("Hex string must have an even number of characters");
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return arr;
}

// Function to convert 32-byte hex private key to a Solana secret key (64 bytes)
function convertHexToSolanaSecretKey(hexPrivateKey) {
  // Convert the hex string to a Uint8Array (32 bytes)
  const privateKeyBytes = hexToUint8Array(hexPrivateKey);

  if (privateKeyBytes.length !== 32) {
    throw new Error("Invalid private key length. Expected 32 bytes.");
  }

  // Generate the Keypair from the private key (using only the first 32 bytes)
  const keypair = Keypair.fromSeed(privateKeyBytes);

  // The keypair's secretKey contains both the private and public keys (64 bytes)
  const solanaSecretKey = keypair.secretKey;

  return solanaSecretKey;
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

async function addCampaignLiquidity() {
  //5MJcZNtXqJNWDpdT8NhRBGtgGpT4cnfipn1ZQxq8QzpU2kBWwyAWrn93jm5AtMMwEvvyxroh9zbT7DzDJA196cQ1
  try {
    //var sk = convertHexToSolanaSecretKey(privateKeyArray);
    var sk = base58ToSecretKeyArray(
      "5MJcZNtXqJNWDpdT8NhRBGtgGpT4cnfipn1ZQxq8QzpU2kBWwyAWrn93jm5AtMMwEvvyxroh9zbT7DzDJA196cQ1"
    );

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(
      "FGZkj6YCXCWZDjLyf8wL1oqwq8hj3C7faWoj17FkZKNE"
    );
    //var amountInSOL = await getSolanaWalletBalance(senderKeypair.publicKey);

    // Connect to Solana cluster (mainnet, testnet, or devnet)
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
    var amountInSOL = await getSolanaWalletBalanceQuicknode(
      connection,
      senderKeypair.publicKey
    );
    console.log(senderKeypair.publicKey, "<<<<<source account");
    if (amountInSOL < 5000) {
      console.log("insufficient SOL");

      return "insufficient SOL";
    } else {
      console.log("about to transfer " + amountInSOL, "<<<<<<<<<<<<< transfer");
      const transactionFee = await getTransactionFee(
        connection,
        senderKeypair.publicKey
      );
      console.log(transactionFee, "<<<<<<<< trfee");
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

      // Add the instruction to send SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amountInSOL, // Convert SOL to lamports
        })
      );
      var msg = "dedsolcmpgn_";
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
          [senderKeypair]
        );
        signature = signature__;
        console.log("Transaction successful with signature:", signature);
      } catch (e) {
        var afterbalance = await getSolanaWalletBalanceQuicknode(
          connection,
          senderKeypair.publicKey
        );
        fs.appendFile(
          "erroraddCampaign.txt",
          " transfer error : " + e.toString() + "\n",
          (err) => {
            if (err) {
              console.error("Error appending to file:", err);
            } else {
              console.log("Content appended successfully!");
            }
          }
        );
        if (afterbalance > 100000) {
          currentProcessCount -= 1;
          return false;
        } else {
          await dragonCore_.addCampaignBudget(amountInSOL);
          return;
          signature = e.toString();
        }
      }

      if (signature) {
        try {
          // console.log("Minting DSOL of " + amountMinted);
          await dragonCore_.addCampaignBudget(amountInSOL);
        } catch (e) {
          fs.appendFile(
            "errorAddCampaignBudget.txt",
            " mintDSOL error : " + e.toString() + "\n",
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
      "errorAddCampaignBudget.txt",
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
async function testGetBalance(walletAddress) {
  const toPublicKey = new PublicKey(
    "FGZkj6YCXCWZDjLyf8wL1oqwq8hj3C7faWoj17FkZKNE"
  );
  const connection = new Connection(
    "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
    "confirmed"
  );

  var a = await getSolanaWalletBalanceQuicknode(connection, toPublicKey);
  console.log(a, "<<<<<res : ");
}

async function mintDSOL(privateKeyArray, mintId) {
  // if (index > 0) return 0;
  try {
    var sk = convertHexToSolanaSecretKey(privateKeyArray);
    //var sk = base58ToSecretKeyArray(
    //"3cn35B2Nq3YKAW7o8xg1XfdCFpLrEMzrR65vnxLqgbWGV83bFdzr6KymN8fFt9wVTkwMu5Y1g8GTdfC3RM5Tz2c4"
    //);

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(
      "FGZkj6YCXCWZDjLyf8wL1oqwq8hj3C7faWoj17FkZKNE"
    );

    // Connect to Solana cluster (mainnet, testnet, or devnet)
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
    var amountInSOL = await getSolanaWalletBalanceQuicknode(
      connection,
      senderKeypair.publicKey
    );
    console.log(senderKeypair.publicKey, "<<<<<source account");
    console.log(amountInSOL, " <<<<<<<<<< sol ");
    if (amountInSOL < 100000) {
      console.log("insufficient SOL");
      // if (amountInSOL > 0) {
      dragonSOLMinter_.mintDSOL(
        privateKeyArray,
        0,
        "insufficient SOL",
        "balanceissue_" + mintId
      );
      //}

      index = index + 1;
      currentProcessCount -= 1;
      return "insufficient SOL";
    } else {
      console.log("about to transfer " + amountInSOL, "<<<<<<<<<<<<< transfer");
      const transactionFee = await getTransactionFee(
        connection,
        senderKeypair.publicKey
      );
      console.log(transactionFee, "<<<<<<<< trfee");
      var amountMinted = parseInt(amountInSOL - 100000);
      amountInSOL = amountInSOL - transactionFee;
      // Fetch latest blockhash to include in the transaction

      const { blockhash } = await connection.getLatestBlockhash("finalized");

      // Create a transaction to transfer SOL
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: senderKeypair.publicKey,
      });

      // Add the instruction to send SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amountInSOL, // Convert SOL to lamports
        })
      );
      var msg = "dedsolmint_" + mintId;
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
          [senderKeypair]
        );
        signature = signature__;
        console.log("Transaction successful with signature:", signature);
      } catch (e) {
        var afterbalance = await getSolanaWalletBalanceQuicknode(
          connection,
          senderKeypair.publicKey
        );
        fs.appendFile(
          "errorMint.txt",
          mintId + " transfer error : " + e.toString() + "\n",
          (err) => {
            if (err) {
              console.error("Error appending to file:", err);
            } else {
              console.log("Content appended successfully!");
            }
          }
        );
        if (afterbalance > 100000) {
          dragonSOLMinter_.mintDSOL(
            privateKeyArray,
            parseInt(0),
            "error",
            "transfer_error" + mintId
          );
          currentProcessCount -= 1;
          return false;
        } else {
          signature = e.toString();
        }
      }

      if (signature) {
        console.log("about to mint " + amountInSOL, "<<<<<<<<<<<<< mint");
        try {
          console.log("Minting DSOL of " + amountMinted);
          await dragonSOLMinter_.mintDSOL(
            privateKeyArray,
            amountMinted,
            signature.toString(),
            msg
          );
        } catch (e) {
          fs.appendFile(
            "errorMint.txt",
            mintId + " mintDSOL error : " + e.toString() + "\n",
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

      index = index + 1;
      currentProcessCount -= 1;
      return signature;
    }
  } catch (e) {
    console.log(e, "<<<<<<<<<<<eee");
    currentProcessCount -= 1;
    fs.appendFile(
      "errorMint.txt",
      mintId + " other error : " + e.toString() + "\n",
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

async function burnDSOL(burnId, principal, targetWallet, amount) {
  // if (index > 0) return 0;
  var burnkey = "burn" + burnId;
  try {
    //var sk = convertHexToSolanaSecretKey(privateKeyArray);
    var sk = base58ToSecretKeyArray(
      "95fAELgopdNiCetCyH3xGGAVjANBmQPrRnTmPgtqNNqjntDhHgBjd3UoJnZaXnLRRRSiGEN9FqnZUmrhxAu8eV4"
    );

    const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(sk));
    const toPublicKey = new PublicKey(targetWallet);
    var amountInSOL = amount;
    //console.log(senderKeypair.publicKey, "<<<<<source account");
    // Connect to Solana cluster (mainnet, testnet, or devnet)
    const connection = new Connection(
      "https://wandering-light-sponge.solana-mainnet.quiknode.pro/8fad23df9dae2e832049ac721f6c5ee5166d3e81",
      "confirmed"
    );
    const transactionFee = await getTransactionFee(
      connection,
      senderKeypair.publicKey
    );

    console.log(transactionFee, "<<<<<<<< tfr fee");
    console.log("about to burn " + amount + " of dragonSOL");
    if (amountInSOL < transactionFee) {
      console.log("insufficient SOL");
      //dragonSOLMinter_.mintDSOL(privateKeyArray, 0, "insufficient SOL");
      dragonSOLMinter_.confirmBurn(burnId, principal, amount, "");
      //queue_[burnkey] = false;
      currentProcessCount -= 1;
      return "insufficient SOL";
    } else {
      var amountBurnt = amountInSOL;
      if (transactionFee > 100000) amountBurnt = amountInSOL - transactionFee;
      // Fetch latest blockhash to include in the transaction

      const { blockhash } = await connection.getLatestBlockhash("finalized");

      // Create a transaction to transfer SOL
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: senderKeypair.publicKey,
      });

      // Add the instruction to send SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amountBurnt, // Convert SOL to lamports
        })
      );

      var msg = "dedsolburn_" + burnId + "_" + principal;
      // Add the memo instruction (memo is a string)
      // Create a memo instruction and add it to the transaction
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"), // Memo Program ID
        data: Buffer.from(msg), // Convert memo string to Buffer
      });

      // Add the memo instruction to the transaction
      transaction.add(memoInstruction);

      var signature = false;
      // Sign the transaction with the sender's keypair
      try {
        signature = await sendAndConfirmTransaction(connection, transaction, [
          senderKeypair,
        ]);

        console.log("Transaction successful with signature:", signature);
      } catch (e) {
        signature = e.toString();
        fs.appendFile(
          "errorBurn.txt",
          burnId + " transfer error : " + e.toString() + "\n",
          (err) => {
            if (err) {
              console.error("Error appending to file:", err);
            } else {
              console.log("Content appended successfully!");
            }
          }
        );
      }
      //if (signature) {
      await dragonSOLMinter_.confirmBurn(
        burnId,
        principal,
        amount,
        signature.toString()
      );
      //}

      index = index + 1;
      currentProcessCount -= 1;
      return signature;
      console.log("confirming");
      await dragonSOLMinter_.confirmBurn(burnId, principal, amount, "");
      queue_[burnkey] = false;
      return true;
    }
  } catch (e) {
    console.log(e, "<<<<<<<<<<<eee");
    currentProcessCount -= 1;
    dragonSOLMinter_.confirmBurn(burnId, principal, amount, "");
  }
}

async function getBlock() {
  return block;
}

async function updateBlock() {
  var a = await updateBalance();
  var tr = await transferSOL("1", "2", 0.01);

  var n = Number(block) + 1;
  block = "" + n;
  return block;
}

(async () => {
  //await initMoralis(); // Initialize Moralis
  // const walletAddress = generateSolanaAddress(privateKey);
  //console.log("Generated Wallet Address:", walletAddress);
})();

module.exports = {
  updateBlock,
  getBlock,
  updateBalance,
  burnBalance,
  addCampaignLiquidity,
  testGetBalance,
};
