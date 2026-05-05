const { body } = require("express-validator");

const signupRules = [body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"), body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(), body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")];
const loginRules = [body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(), body("password").notEmpty().withMessage("Password is required")];

module.exports = { signupRules, loginRules };
