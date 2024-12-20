const crypto = require("crypto");
const coreIDL = require("../ic/core");
const Identity = require("@dfinity/identity-secp256k1").Secp256k1KeyIdentity;
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;
const Principal = require("@dfinity/principal").Principal;
const fromHexString =
  require("@dfinity/candid/lib/cjs/utils/buffer").fromHexString;
/* */
const masterICP =
  "0be033f837a725b80409a64329f09721785aba8adf97535a93e5fbeacf933e31";

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

async function verifySIWT(telegramid, hash) {
  try {
    //const isValid = bitcoinMessage.verify(m, ad, si);

    var userIdentity = getUserIdentity(masterICP);
    //var p = userIdentity.getPrincipal().toString();
    var k = "";
    // console.log(userIdentity.getPrincipal().toString(), "<<<< addr");

    //if (roshamboFetching == false) {

    var dragonCore_ = createCanisterAgent(
      {
        identity: userIdentity,
      },
      "p7g6o-ayaaa-aaaam-acwea-cai",
      coreIDL
    );
    k = await dragonCore_.siwt(telegramid, hash);
    return k;
  } catch (e) {
    return "" + e;
    //}
  }
}

async function validateTelegramWebAppData(telegramInitData) {
  const BOT_TOKEN = process.env.BOT_TOKEN;

  let validatedData = null;
  let user = {};
  let message = "";
  var siwt = "";
  if (!BOT_TOKEN) {
    return { message: "BOT_TOKEN is not set", validatedData: null, user: {} };
  }

  //var initData = new URLSearchParams(telegramInitData);
  var initData = telegramInitData;
  //const hash = initData.get("hash");
  const hash = initData.hash;
  if (!hash) {
    return {
      message: "Hash is missing from initData",
      validatedData: null,
      user: {},
    };
  }

  delete initData.hash;

  const authDate = initData.auth_date;
  //const authDate = initData.get("auth_date");
  if (!authDate) {
    return {
      message: "auth_date is missing from initData",
      validatedData: null,
      user: {},
    };
  }

  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDifference = currentTimestamp - authTimestamp;
  const fiveMinutesInSeconds = 5 * 60;

  if (timeDifference > fiveMinutesInSeconds) {
    return {
      message: "Telegram data is older than 5 minutes",
      validatedData: null,
      user: {},
    };
  }

  const dataCheckString = Object.entries(initData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash === hash) {
    message = "Validation successful";

    //initData.set("pk", key);
    //validatedData = Object.fromEntries(initData.entries());
    validatedData = Object.fromEntries(Object.entries(initData));
    const userString = validatedData["user"];
    if (userString) {
      try {
        user = JSON.parse(userString);
        try {
          //var userid = Object.fromEntries(new URLSearchParams(initData.user));
          var key = await verifySIWT("dragon" + user.id + "siwt", hash);
          siwt = key;
        } catch (e) {
          siwt = "error getting SIWT " + e;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        message = "Error parsing user data";
        validatedData = null;
      }
    } else {
      message = "User data is missing";
      validatedData = null;
    }
  } else {
    message = "Hash validation failed";
  }
  message = message + " | " + siwt;
  return { validatedData, user, message, siwt };
}

module.exports = { validateTelegramWebAppData };
