const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization required');
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, 'super-secret-key');
  } catch (err) {
    throw new UnauthorizedError('Invalid token');
  }

  req.user = payload;
  next();
};
