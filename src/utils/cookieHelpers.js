const cookieConfig = require("../config/cookies");

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(
    cookieConfig.names.accessToken,
    accessToken,
    cookieConfig.accessToken,
  );
  res.cookie(
    cookieConfig.names.refreshToken,
    refreshToken,
    cookieConfig.refreshToken,
  );
};

const clearAuthCookies = (res) => {
  res.clearCookie(cookieConfig.names.accessToken, {
    path: cookieConfig.accessToken.path,
  });
  res.clearCookie(cookieConfig.names.refreshToken, {
    path: cookieConfig.refreshToken.path,
  });
};

module.exports = { setAuthCookies, clearAuthCookies };
