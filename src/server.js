require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");
if (!global.fetch) {
  global.fetch = fetch;
}
const blockRoutes = require("./routes/auth");
const overUnder = require("./routes/goatarena");

const app = express();

/*const allowedDomains = [
  "https://staging-dragoneyes.vercel.app",
  "https://dragoneyes.xyz",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedDomains.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Reject the request
    }
  },
  credentials: true,
}; */

// Use CORS middleware

// Konfigurasi CORS
const corsOptions = {
  origin: "https://staging-dragoneyes.vercel.app", // should be match to FE origin
  origin: "https://dragoneyes.xyz",
  origin: "*", // allow all origins
  credentials: true, // this is important to allow session cookies
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const {
  updateBalance,
  burnBalance,
  addCampaignLiquidity,
} = require("./utils/blockManager");

var isDev = false;
if (process.env.DEV == "dev") {
  console.log("setting to dev");
  isDev = true;
} else {
  console.log("PROD MODE");
}

app.get("/", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/plain");
    res.send("Dragon Eyes Overunder");
  } catch (error) {
    var msg = "Error " + error.message;

    //console.log(msg);
    res.status(500).json({ error: msg });
  }
});

const PORT = process.env.PORT || 3012;
console.log(process.env.DEV, "<<<<<<<<<< DEV");
console.log("Your environment variable:", process.env.BOT_TOKEN);
// Use routes

app.use("/game", overUnder);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
