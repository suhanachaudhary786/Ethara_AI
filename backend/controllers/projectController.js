const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { success, error } = require("../utils/apiResponse");
const status = require("../utils/httpStatus");

async function listProjects(req, res) {
  const projects = await Project.find({ "members.user": req.user._id }).populate("members.user", "name email").sort({ updatedAt: -1 });
  return success(res, status.OK, "Projects fetched", { projects });
}

async function createProject(req, res) {
  const project = await Project.create({ name: req.body.name, description: req.body.description, createdBy: req.user._id, members: [{ user: req.user._id, role: "Admin" }] });
  await project.populate("members.user", "name email");
  return success(res, status.CREATED, "Project created", { project });
}

async function getProject(req, res) {
  await req.project.populate("members.user", "name email");
  const taskQuery = req.membership.role === "Admin" ? { project: req.project._id } : { project: req.project._id, assignedTo: req.user._id };
  const tasks = await Task.find(taskQuery).populate("assignedTo", "name email").populate("createdBy", "name email").sort({ dueDate: 1 });
  return success(res, status.OK, "Project fetched", { project: req.project, membership: req.membership, tasks });
}

async function addMember(req, res) {
  const { email, role = "Member" } = req.body;
  const user = await User.findOne({ email });
  if (!user) return error(res, status.NOT_FOUND, "User not found. Ask them to sign up first.");
  if (req.project.members.some((member) => member.user.toString() === user._id.toString())) return error(res, status.CONFLICT, "User is already a project member");
  req.project.members.push({ user: user._id, role });
  await req.project.save();
  await req.project.populate("members.user", "name email");
  return success(res, status.OK, "Member added", { project: req.project });
}

async function removeMember(req, res) {
  const { userId } = req.params;
  if (userId === req.project.createdBy.toString()) return error(res, status.BAD_REQUEST, "Project creator cannot be removed");
  req.project.members = req.project.members.filter((member) => member.user.toString() !== userId);
  await req.project.save();
  await Task.deleteMany({ project: req.project._id, assignedTo: userId });
  await req.project.populate("members.user", "name email");
  return success(res, status.OK, "Member removed", { project: req.project });
}

module.exports = { listProjects, createProject, getProject, addMember, removeMember };
