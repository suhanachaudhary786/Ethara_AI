const { validationResult } = require("express-validator");
const { error } = require("../utils/apiResponse");
const status = require("../utils/httpStatus");

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return error(res, status.BAD_REQUEST, "Validation failed", result.array().map((item) => item.msg));
};
