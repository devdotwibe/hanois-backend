// ----------------------
//  Load Environment
// ----------------------
const { validateEnv, config } = require("./config/env");
validateEnv();

// ----------------------
//  Core Modules
// ----------------------
const path = require("path");
const fs = require("fs");

// ----------------------
//  Packages
// ----------------------
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// ----------------------
//  Route Imports
// ----------------------
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const providerRouted = require("./routes/providerRouted");
const faqRoutes = require("./routes/faqRoutes");
const pageRoutes = require("./routes/pageRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const projectImageRoutes = require("./routes/projectImageRoutes");
const designRoutes = require("./routes/designRoutes");

// ⭐ NEW ROUTES
const likesDislikesRoutes = require("./routes/likesDislikes");
const commentsRoutes = require("./routes/commentsRoutes");

// ----------------------
//  Error Handlers
// ----------------------
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const pool = require("./db/pool");

// ----------------------
//  Express App
// ----------------------
const app = express();
const port = config.port;

// ----------------------
//  Logging
// ----------------------
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// ----------------------
//  Parse JSON
// ----------------------
app.use(express.json());

// ----------------------
//  Serve Public Folder
// ----------------------
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
//  Auto-create directories
// ----------------------
const bannerDir = path.join(__dirname, "public/banner");
const projectUploadDir = path.join(__dirname, "public/uploads/projects");
const proposalDir = path.join(__dirname, "public/proposals");

const makeDir = (dir, name) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created ${name}`);
  }
};

makeDir(bannerDir, "/public/banner");
makeDir(projectUploadDir, "/public/uploads/projects");
makeDir(proposalDir, "/public/proposals");

// ----------------------
//  Static Directories
// ----------------------
app.use("/banner", express.static(bannerDir));
app.use("/uploads/projects", express.static(projectUploadDir));
app.use("/proposals", express.static(proposalDir)); // MUST COME BEFORE API ROUTES

// ----------------------
//  CORS
// ----------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// ----------------------
//  API ROUTES
// ----------------------
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRouted);
app.use("/api/admin", adminRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/page", pageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/design", designRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-images", projectImageRoutes);

// ⭐ NEW REACTIONS & COMMENTS ROUTES – CORRECT LOCATION
app.use("/api/reactions", likesDislikesRoutes);
app.use("/api/comments", commentsRoutes);

// ----------------------
//  Welcome Route
// ----------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Hanois Backend API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
    },
  });
});

// ----------------------
//  ERROR HANDLERS (ALWAYS LAST)
// ----------------------
app.use(notFoundHandler);
app.use(errorHandler);

// ----------------------
//  Start Server
// ----------------------
const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

// ----------------------
//  Graceful Shutdown
// ----------------------
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log("HTTP server closed");

    pool.end(() => {
      console.log("Database connection pool closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
