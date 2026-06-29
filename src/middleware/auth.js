const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const cookieConfig = require("../config/cookies");
const User = require("../models/User");
const AppError = require("../utils/AppError");

exports.protect = async (req, res, next) => {
  let token = req.cookies?.[cookieConfig.names.accessToken];

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized to access this route", 401);
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
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
