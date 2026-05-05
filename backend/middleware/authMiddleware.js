const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");
const { error } = require("../utils/apiResponse");
const status = require("../utils/httpStatus");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return error(res, status.UNAUTHORIZED, "Login required");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return error(res, status.UNAUTHORIZED, "Invalid token");
    req.user = user;
    next();
  } catch {
    return error(res, status.UNAUTHORIZED, "Invalid or expired token");
  }
}

async function loadProject(req, res, next) {
  const projectId = req.params.projectId || req.body.project || req.query.projectId;
  const project = await Project.findById(projectId);
  if (!project) return error(res, status.NOT_FOUND, "Project not found");
  const membership = project.members.find((member) => member.user.toString() === req.user._id.toString());
  if (!membership) return error(res, status.FORBIDDEN, "You are not a member of this project");
  req.project = project;
  req.membership = membership;
  next();
}

function adminOnly(req, res, next) {
  if (!req.membership || req.membership.role !== "Admin") return error(res, status.FORBIDDEN, "Admin access required");
  next();
}

module.exports = { protect, loadProject, adminOnly };
