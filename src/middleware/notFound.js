const notFound = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const origin =
      req.headers.origin ||
      process.env.CORS_ORIGIN ||
      "https://rsdecor.vercel.app";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
