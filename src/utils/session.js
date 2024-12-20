const { SignJWT, jwtVerify } = require("jose");

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

const key = new TextEncoder().encode(process.env.JWT_SECRET);

async function encrypt(payload) {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(key);
}

async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

async function getSession(req) {
  const session = req.cookies.session;
  if (!session) return null;
  return await decrypt(session);
}

async function updateSession(req, res, next) {
  const session = req.cookies.session;
  if (!session) return next();

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + SESSION_DURATION);
  res.cookie("session", await encrypt(parsed), {
    httpOnly: true,
    expires: parsed.expires,
  });
  next();
}

module.exports = {
  SESSION_DURATION,
  encrypt,
  decrypt,
  getSession,
  updateSession,
};
