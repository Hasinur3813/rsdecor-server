const errorHandler = (err, req, res, next) => {
  // 1. Explicitly attach CORS headers right at the start of the error lifecycle
  // This guarantees that the client's browser actually receives the 4xx or 5xx status code
  if (process.env.NODE_ENV === "production") {
    res.header("Access-Control-Allow-Origin", "https://rsdecor.vercel.app"); // Replace with your actual Vercel URL
    res.header("Access-Control-Allow-Credentials", "true");
  }

  // Use the original err object fallback values reliably
  console.error("💥 Error Logged:", err.stack || err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    return res
      .status(404)
      .json({ success: false, message: "Resource not found" });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return res
      .status(400)
      .json({ success: false, message: "Duplicate field value entered" });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Custom Operational Errors (e.g., AppError instances)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  // Final fallback for unexpected runtime crashes
  const finalStatusCode = err.statusCode || 500;

  res.status(finalStatusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
