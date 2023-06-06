const { STATUS_CODES } = require('../constants');

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = STATUS_CODES.UNAUTHORIZED;
  }
}

module.exports = UnauthorizedError;
