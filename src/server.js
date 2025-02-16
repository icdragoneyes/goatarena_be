require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");
if (!global.fetch) {
  global.fetch = fetch;
}
global.lastGame = {};
const goatarena = require("./routes/goatarena");

const app = express();

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

var isDev = false;
if (process.env.DEV == "dev") {
  console.log("setting to dev");
  isDev = true;
} else {
  console.log("PROD MODE");
}



const PORT = process.env.PORT || 3015;
console.log(process.env.DEV, "<<<<<<<<<< DEV");
console.log("Your environment variable:", process.env.BOT_TOKEN);
// Use routes

app.use("/", goatarena);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
