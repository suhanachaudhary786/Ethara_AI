const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.get("/", protect, asyncHandler(dashboardController.getDashboard));
module.exports = router;
