const express = require("express");

const {
  buyToken,
  scrapeGMGNAI,
  startNewGame,
  fetchCurrentGameStatus,
  sellToken,
} = require("../controllers/goatArenaController");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("ok");
  try {
    await fetchCurrentGameStatus();
    const latest = global.lastGame;
    const block = { latest };

    if (block) {
      res.json({
        currentGame: block,
      });
    } else {
      res.json({ error: true, message: "Failed to fetch current game" });
      //res.status(401).json({ message: validationResult.message });
    }
  } catch (e) {
    res.status(401).json({ error: e });
    //res.json({ error: "ERROR " + e });
  }
});

router.post("/buy", async (req, res) => {
  try {
    const { wallet, side, tx, amount } = req.body;
    var a = await buyToken(wallet,side,tx,amount);
    /*var a = await buyToken(
      "EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU",
      "under",
      "12345",
      1000000000
    ); */

    if (a.error) {
      res.json({
        error: a.error,
      });
      return;
    }
    const block = { data: a };
    if (block) {
      res.json({
        buyResult: block,
      });
    } else {
      res.json({ message: "Buy Failed " });
      //res.status(401).json({ message: validationResult.message });
    }
  } catch (e) {
    // res.status(401).json({ message: e });
    res.json({ error: "ERROR " + e });
  }
});

router.post("/new", async (req, res) => {
  try {
    var a = await startNewGame();
    const block = { data: a };
    if (a.error) {
    }

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

router.post("/sell", async (req, res) => {
  try {
    var a = await sellToken(
      "EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU",
      0,
      "under"
    );
    const block = { data: "ok" };

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

router.get("/claim", async (req, res) => {
  try {
    const block = { data: "ok" };

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

module.exports = router;
