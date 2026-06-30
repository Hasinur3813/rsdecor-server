const jwtConfig = require("./jwt");

const parseExpiryToMs = (expiry) => {
  const match = String(expiry).match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;

  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return parseInt(match[1], 10) * multipliers[match[2]];
};

const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction, // Must be true in production or Vercel for SameSite=None
  sameSite: isProduction ? "none" : "strict", // 'none' for production cross-site, 'lax' for localhost
};

module.exports = {
  names: {
    accessToken: process.env.ACCESS_TOKEN_COOKIE_NAME || "rs_access_token",
    refreshToken: process.env.REFRESH_TOKEN_COOKIE_NAME || "rs_refresh_token",
  },
  accessToken: {
    ...baseCookieOptions,
    maxAge: parseExpiryToMs(jwtConfig.accessExpire),
    path: "/",
  },
  refreshToken: {
    ...baseCookieOptions,
    maxAge: parseExpiryToMs(jwtConfig.refreshExpire),
    path: "/api/v1/auth",
  },
};
