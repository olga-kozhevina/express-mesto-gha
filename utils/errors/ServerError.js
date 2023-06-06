const { STATUS_CODES } = require('../constants');

const ServerError = (err, req, res) => {
  const { statusCode = STATUS_CODES.SERVER_ERROR, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === STATUS_CODES.SERVER_ERROR
        ? 'An error occurred on the server'
        : message,
    });
};

module.exports = ServerError;
