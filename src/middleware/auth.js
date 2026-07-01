const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const cookieConfig = require("../config/cookies");
const User = require("../models/User");
const AppError = require("../utils/AppError");

exports.protect = async (req, res, next) => {
  let token = null;
  let secret = null;

  // 1. Try access token cookie (path: "/", available on all routes)
  if (req.cookies?.[cookieConfig.names.accessToken]) {
    token = req.cookies[cookieConfig.names.accessToken];
    secret = jwtConfig.accessSecret;
  }

  // 2. Fall back to refresh token cookie (path: "/api/v1/auth", only on auth routes)
  if (!token && req.cookies?.[cookieConfig.names.refreshToken]) {
    token = req.cookies[cookieConfig.names.refreshToken];
    secret = jwtConfig.refreshSecret;
  }

  // 3. Fall back to Bearer header
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    secret = jwtConfig.accessSecret;
  }

  if (!token) {
    throw new AppError("Not authorized to access this route", 401);
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Not authorized to access this route", 401);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};
