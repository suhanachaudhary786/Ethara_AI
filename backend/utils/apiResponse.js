function success(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({ success: true, message, ...data });
}

function error(res, statusCode, message, errors = null) {
  return res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { success, error };
