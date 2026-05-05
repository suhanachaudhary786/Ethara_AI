const express = require("express");
const taskController = require("../controllers/taskController");
const { protect, loadProject, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const { createTaskRules, updateTaskRules, listTaskRules, taskIdRule } = require("../validators/taskValidators");

const router = express.Router();
router.use(protect);
router.get("/", listTaskRules, validateRequest, asyncHandler(taskController.listTasks));
router.post("/", createTaskRules, validateRequest, asyncHandler(loadProject), adminOnly, asyncHandler(taskController.createTask));
router.patch("/:taskId", updateTaskRules, validateRequest, asyncHandler(taskController.updateTask));
router.delete("/:taskId", taskIdRule, validateRequest, asyncHandler(taskController.deleteTask));
module.exports = router;
