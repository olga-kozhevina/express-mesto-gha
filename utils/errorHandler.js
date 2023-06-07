const mongoose = require('mongoose');
const { STATUS_CODES } = require('./constants');

module.exports = (err, req, res, next) => {
  // Если ошибка является ошибкой валидации mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    return res
      .status(400)
      .send({ message: 'Mongoose validation failed' });
  }

  const {
    statusCode = STATUS_CODES.SERVER_ERROR,
    message,
  } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === STATUS_CODES.SERVER_ERROR ? 'An error occurred on the server' : message,
    });

  return next();
};
