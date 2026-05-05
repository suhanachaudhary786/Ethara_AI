const Project = require("../models/Project");
const Task = require("../models/Task");
const { success, error } = require("../utils/apiResponse");
const status = require("../utils/httpStatus");

const isProjectMember = (project, userId) => project.members.some((member) => member.user.toString() === userId.toString());

async function listTasks(req, res) {
  let query = { assignedTo: req.user._id };
  if (req.query.projectId) {
    const project = await Project.findById(req.query.projectId);
    if (!project) return error(res, status.NOT_FOUND, "Project not found");
    const membership = project.members.find((member) => member.user.toString() === req.user._id.toString());
    if (!membership) return error(res, status.FORBIDDEN, "You are not a member of this project");
    query = membership.role === "Admin" ? { project: req.query.projectId } : { project: req.query.projectId, assignedTo: req.user._id };
  }
  const tasks = await Task.find(query).populate("project", "name").populate("assignedTo", "name email").populate("createdBy", "name email").sort({ dueDate: 1 });
  return success(res, status.OK, "Tasks fetched", { tasks });
}

async function createTask(req, res) {
  const { title, description, dueDate, priority, assignedTo } = req.body;
  if (!isProjectMember(req.project, assignedTo)) return error(res, status.BAD_REQUEST, "Task assignee must be a project member");
  const task = await Task.create({ title, description, dueDate, priority, assignedTo, project: req.project._id, createdBy: req.user._id });
  await task.populate("assignedTo", "name email");
  await task.populate("createdBy", "name email");
  return success(res, status.CREATED, "Task created", { task });
}

async function updateTask(req, res) {
  const task = await Task.findById(req.params.taskId);
  if (!task) return error(res, status.NOT_FOUND, "Task not found");
  const project = await Project.findById(task.project);
  const membership = project.members.find((member) => member.user.toString() === req.user._id.toString());
  if (!membership) return error(res, status.FORBIDDEN, "You are not a member of this project");
  const updates = {};
  if (membership.role === "Admin") {
    for (const field of ["title", "description", "dueDate", "priority", "assignedTo", "status"]) if (req.body[field] !== undefined) updates[field] = req.body[field];
    if (updates.assignedTo && !isProjectMember(project, updates.assignedTo)) return error(res, status.BAD_REQUEST, "Task assignee must be a project member");
  } else {
    if (task.assignedTo.toString() !== req.user._id.toString()) return error(res, status.FORBIDDEN, "Members can update only their assigned tasks");
    if (!req.body.status) return error(res, status.BAD_REQUEST, "Members can update task status only");
    updates.status = req.body.status;
  }
  Object.assign(task, updates);
  await task.save();
  await task.populate("assignedTo", "name email");
  await task.populate("createdBy", "name email");
  return success(res, status.OK, "Task updated", { task });
}

async function deleteTask(req, res) {
  const task = await Task.findById(req.params.taskId);
  if (!task) return error(res, status.NOT_FOUND, "Task not found");
  const project = await Project.findById(task.project);
  const membership = project.members.find((member) => member.user.toString() === req.user._id.toString());
  if (!membership || membership.role !== "Admin") return error(res, status.FORBIDDEN, "Admin access required");
  await task.deleteOne();
  return success(res, status.OK, "Task deleted");
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
