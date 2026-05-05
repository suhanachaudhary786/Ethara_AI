require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { error } = require("./utils/apiResponse");
const status = require("./utils/httpStatus");

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(status.OK).json({ success: true, message: "API is running", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use((req, res) => error(res, status.NOT_FOUND, "API route not found"));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") return error(res, status.BAD_REQUEST, "Validation failed", Object.values(err.errors).map((item) => item.message));
  if (err.name === "CastError") return error(res, status.BAD_REQUEST, "Invalid id format");
  return error(res, err.statusCode || status.INTERNAL_SERVER_ERROR, err.message || "Something went wrong");
});

connectDB().then(() => app.listen(port, () => console.log(`Backend running on http://localhost:${port}`))).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
