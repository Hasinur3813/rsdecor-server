require("dotenv").config();
require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const uploadRoutes = require("./routes/uploads");
const sliderRoutes = require("./routes/sliders");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

connectDB();


// app.use(
//   cors({
//     origin: [
//       process.env.CORS_ORIGIN || "http://localhost:3000",
//       "https://rsdecor.vercel.app",
//       "https://rsdecor-admin.vercel.app"
//     ],
//     credentials: true,
//   }),
// );

// Move Helmet down, or configure it to allow cross-origin requests
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows images/resources to be read cross-origin
  })
);
app.use(morgan("dev"));

// Upgraded CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://rsdecor.vercel.app",
  "https://rsdecor-admin.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173" // Vite default just in case
].filter(Boolean); // Removes undefined values if process.env.CORS_ORIGIN isn't set

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      // Check if origin matches allowed array OR is a Vercel preview deployment
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// CRUCIAL: Explicitly handle Preflight OPTIONS requests right after CORS
app.options("*", cors());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes (15 * 60 seconds * 1000ms)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,             // Maximum 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/sliders", sliderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
