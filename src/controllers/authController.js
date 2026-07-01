const jwt = require("jsonwebtoken");
const User = require("../models/User");
const jwtConfig = require("../config/jwt");
const cookieConfig = require("../config/cookies");
const AppError = require("../utils/AppError");
const { setAuthCookies, clearAuthCookies } = require("../utils/cookieHelpers");

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Please provide name, email and password", 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 401);
  }

  const accessToken = user.getSignedJwtAccessToken();
  const refreshToken = user.getSignedJwtRefreshToken();

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: formatUser(user) },
  });
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.role !== "admin") {
    throw new AppError("Access denied. Admin credentials required.", 403);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 401);
  }

  const accessToken = user.getSignedJwtAccessToken();
  const refreshToken = user.getSignedJwtRefreshToken();

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Admin login successful",
    data: { user: formatUser(user) },
  });
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.[cookieConfig.names.refreshToken];

  if (!refreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
  } catch {
    clearAuthCookies(res);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    clearAuthCookies(res);
    throw new AppError("Invalid refresh token", 401);
  }

  const accessToken = user.getSignedJwtAccessToken();
  const newRefreshToken = user.getSignedJwtRefreshToken();

  setAuthCookies(res, accessToken, newRefreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed",
  });
};

exports.logout = async (_req, res) => {
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: formatUser(req.user),
  });
};
