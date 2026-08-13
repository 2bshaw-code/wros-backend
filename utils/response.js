const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
};

const sendError = (res, message, statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
};

const isValidObjectId = (id) => {
  return /^[a-f\d]{24}$/i.test(String(id));
};

module.exports = {
  sendSuccess,
  sendError,
  isValidObjectId,
};
