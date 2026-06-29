const jwtConfig = require("./jwt");

const parseExpiryToMs = (expiry) => {
  const match = String(expiry).match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;

  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return parseInt(match[1], 10) * multipliers[match[2]];
};

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
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
