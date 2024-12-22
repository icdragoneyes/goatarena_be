const express = require("express");

const {
  buyToken,
  scrapeGMGNAI,
  startNewGame,
  fetchCurrentGameStatus,
} = require("../controllers/goatArenaController");
const { getGameInfo } = require("../services/database");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("ok");
  try {
    const latest = await fetchCurrentGameStatus();
    const block = { data: latest };

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
    var a = await buyToken(
      "EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU",
      "under",
      "txSign10",
      1000000000
    );
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
