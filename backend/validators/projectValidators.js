const { body, param } = require("express-validator");

const objectId = (field) => param(field).isMongoId().withMessage(`Invalid ${field}`);
const createProjectRules = [body("name").trim().isLength({ min: 2 }).withMessage("Project name must be at least 2 characters"), body("description").optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters")];
const addMemberRules = [objectId("projectId"), body("email").trim().isEmail().withMessage("Enter a valid member email").normalizeEmail(), body("role").optional().isIn(["Admin", "Member"]).withMessage("Role must be Admin or Member")];
const removeMemberRules = [objectId("projectId"), param("userId").isMongoId().withMessage("Invalid userId")];

module.exports = { createProjectRules, addMemberRules, removeMemberRules, projectIdRule: [objectId("projectId")] };
