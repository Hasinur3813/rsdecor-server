module.exports = {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpire: process.env.JWT_ACCESS_EXPIRE || "15m",
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
};
