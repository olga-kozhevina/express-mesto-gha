const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const { STATUS_CODES } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const ConflictError = require('../utils/errors/ConflictError');

const getUsers = (req, res, next) => {
  user.find({})
    .then((users) => res.status(STATUS_CODES.OK).send({ users }))
    .catch(next);
};

const findUser = (id, next) => {
  user.findById(id)
    .then((users) => {
      if (!users) {
        throw new NotFoundError('User not found');
      }
      return users;
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => user.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.status(STATUS_CODES.CREATED)
      .send({
        data: {
          name,
          about,
          avatar,
          email,
        },
      }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data entered when creating user'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('User with this email exists'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  user.findUserByCredentials(email, password)
    .then((users) => {
      const token = jwt.sign({ _id: users._id }, 'super-secret-key', { expiresIn: '7d' });
      res.send({ _id: token });
    })
    .catch((err) => next(err));
};

const getCurrentUser = (req, res, next) => {
  findUser(req.user._id, next)
    .then((users) => res.status(STATUS_CODES.OK).send({ data: users }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  findUser(req.params.userId, next)
    .then((users) => res.status(STATUS_CODES.OK).send({ data: users }))
    .catch(next);
};

const updateUserData = (fieldsToUpdate, errorMessage) => (req, res, next) => {
  const data = fieldsToUpdate.reduce((acc, field) => {
    if (req.body[field]) acc[field] = req.body[field];
    return acc;
  }, {});
  return user.findByIdAndUpdate(
    req.users._id,
    data,
    { new: true, runValidators: true },
  )
    .then((users) => {
      if (!users) {
        throw new NotFoundError('User not found');
      }
      res.status(STATUS_CODES.OK).send(users);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(errorMessage));
      }
      return next(err);
    });
};

const updateUserAvatar = updateUserData(['avatar'], 'Incorrect data entered when updating the avatar');
const updateUserProfile = updateUserData(['name', 'about'], 'Incorrect data entered when updating profile');

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
  login,
  getCurrentUser,
};
