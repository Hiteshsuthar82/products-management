// Standardized response format utility

const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    data
  };

  if (!success && statusCode !== 200) {
    response.status = statusCode;
  }

  return res.status(statusCode).json(response);
};

// Success responses
const sendSuccess = (res, message, data = null) => {
  return sendResponse(res, 200, true, message, data);
};

// Error responses
const sendError = (res, statusCode, message, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

// Validation error response
const sendValidationError = (res, errors) => {
  return sendResponse(res, 400, false, 'Validation failed', errors);
};

// Not found error response
const sendNotFound = (res, message = 'Resource not found') => {
  return sendResponse(res, 404, false, message, null);
};

// Unauthorized error response
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendResponse(res, 401, false, message, null);
};

// Forbidden error response
const sendForbidden = (res, message = 'Access forbidden') => {
  return sendResponse(res, 403, false, message, null);
};

// Server error response
const sendServerError = (res, message = 'Internal server error') => {
  return sendResponse(res, 500, false, message, null);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendServerError
};
