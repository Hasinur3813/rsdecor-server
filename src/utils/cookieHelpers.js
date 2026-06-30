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
    ...cookieConfig.accessToken,
    path: cookieConfig.accessToken.path,
    expires: new Date(0),
  });
  res.clearCookie(cookieConfig.names.refreshToken, {
    ...cookieConfig.refreshToken,
    path: cookieConfig.refreshToken.path,
    expires: new Date(0),
  });
};

module.exports = { setAuthCookies, clearAuthCookies };
