const express = require("express");
const projectController = require("../controllers/projectController");
const { protect, loadProject, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const { createProjectRules, addMemberRules, removeMemberRules, projectIdRule } = require("../validators/projectValidators");

const router = express.Router();
router.use(protect);
router.get("/", asyncHandler(projectController.listProjects));
router.post("/", createProjectRules, validateRequest, asyncHandler(projectController.createProject));
router.get("/:projectId", projectIdRule, validateRequest, asyncHandler(loadProject), asyncHandler(projectController.getProject));
router.post("/:projectId/members", addMemberRules, validateRequest, asyncHandler(loadProject), adminOnly, asyncHandler(projectController.addMember));
router.delete("/:projectId/members/:userId", removeMemberRules, validateRequest, asyncHandler(loadProject), adminOnly, asyncHandler(projectController.removeMember));
module.exports = router;
