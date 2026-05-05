const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { success, error } = require("../utils/apiResponse");
const status = require("../utils/httpStatus");

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });
const createToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

async function signup(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return error(res, status.CONFLICT, "Email is already registered");
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
  return success(res, status.CREATED, "Signup successful", { token: createToken(user), user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return error(res, status.UNAUTHORIZED, "Invalid email or password");
  return success(res, status.OK, "Login successful", { token: createToken(user), user: publicUser(user) });
}

async function me(req, res) {
  return success(res, status.OK, "Profile fetched", { user: publicUser(req.user) });
}

module.exports = { signup, login, me };
