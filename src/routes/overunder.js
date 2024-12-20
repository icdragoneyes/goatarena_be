const express = require("express");
const { getBlock } = require("../utils/blockManager");
const {
  buyAndSendTokens,
  getCurrentGame,
  placeBet,
  getAllBalances,
  getQuote,
  getMasterWalletBalance,
  executeTransfer,
  testReward,
} = require("../utils/overunderManager");
const { encrypt, SESSION_DURATION } = require("../utils/session");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const block = await getBlock();

    if (block) {
      res.json({
        lastBlock: block,
      });
    } else {
      res.json({ message: "Failed " });
      //res.status(401).json({ message: validationResult.message });
    }
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

router.get("/buyBurn", async (req, res) => {
  try {
    const block = await buyAndBurnTokens(0.0001);

    if (block) {
      res.json({
        result: block,
      });
    } else {
      res.json({ message: "Failed " });
      //res.status(401).json({ message: validationResult.message });
    }
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

router.get("/getCurrentGame", async (req, res) => {
  try {
    const game = await getCurrentGame();

    if (game) {
      res.json(game);
    } else {
      res.json({ message: "Failed " });
      //res.status(401).json({ message: validationResult.message });
    }
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

router.get("/placeBet", async (req, res) => {
  const { solanaWallet, betAmount, gameId, betType, signature } = req.query;
  console.log("placing bet " + betAmount);
  try {
    var betResult = await placeBet(
      solanaWallet,
      betAmount,
      betType,
      gameId,
      signature
    );
    console.log(betResult, "<<<< br1");
    res.json(betResult);
    //console.log(res, "<<<<< re");
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

router.post("/burn", async (req, res) => {
  // console.log("burning ");
  try {
    var a = { data: process.env.DEV };
    //res.json(a);
    //return true;
    var betResult = await getAllBalances();
    console.log(betResult, "<<<< burn result");
    res.json(betResult);
    //console.log(res, "<<<<< re");
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

router.get("/masterBalance", async (req, res) => {
  // console.log("burning ");
  try {
    var d = await getMasterWalletBalance();

    //res.json(a);
    //return true;

    res.json(d);
    //console.log(res, "<<<<< re");
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

module.exports = router;
