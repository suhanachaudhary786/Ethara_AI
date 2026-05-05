const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const { signupRules, loginRules } = require("../validators/authValidators");

const router = express.Router();
router.post("/signup", signupRules, validateRequest, asyncHandler(authController.signup));
router.post("/login", loginRules, validateRequest, asyncHandler(authController.login));
router.get("/me", protect, asyncHandler(authController.me));
module.exports = router;
