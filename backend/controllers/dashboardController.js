const Project = require("../models/Project");
const Task = require("../models/Task");
const { success } = require("../utils/apiResponse");
const status = require("../utils/httpStatus");

async function getDashboard(req, res) {
  const projects = await Project.find({ "members.user": req.user._id }).select("_id members");
  const adminProjectIds = projects.filter((project) => project.members.some((member) => member.user.toString() === req.user._id.toString() && member.role === "Admin")).map((project) => project._id);
  const tasks = await Task.find({ $or: [{ project: { $in: adminProjectIds } }, { assignedTo: req.user._id }] }).populate("assignedTo", "name email").populate("project", "name");
  const byStatus = { "To Do": 0, "In Progress": 0, Done: 0 };
  const perUser = {};
  const overdueTasks = [];
  const now = new Date();
  for (const task of tasks) {
    byStatus[task.status] += 1;
    const key = task.assignedTo ? task.assignedTo.email : "Unassigned";
    perUser[key] = perUser[key] || { user: task.assignedTo ? task.assignedTo.name : "Unassigned", email: key, count: 0 };
    perUser[key].count += 1;
    if (task.status !== "Done" && new Date(task.dueDate) < now) overdueTasks.push(task);
  }
  return success(res, status.OK, "Dashboard fetched", { totalTasks: tasks.length, byStatus, tasksPerUser: Object.values(perUser), overdueTasks });
}

module.exports = { getDashboard };
