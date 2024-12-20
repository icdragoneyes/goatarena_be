const express = require("express");
const { getBlock } = require("../utils/blockManager");

const { scrapeDexScreener } = require("../utils/goatArenaManager");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const block = await scrapeDexScreener();

    if (block) {
      res.json({
        data: block,
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
