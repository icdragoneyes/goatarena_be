const express = require("express");
const { getSession } = require("../utils/session");

const router = express.Router();

router.get("/", async (req, res) => {
  const session = await getSession(req);
  if (session) {
    res.json({ isAuthenticated: true });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;
