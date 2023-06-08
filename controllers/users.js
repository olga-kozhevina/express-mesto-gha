const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { STATUS_CODES } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const ConflictError = require('../utils/errors/ConflictError');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(STATUS_CODES.OK).send({ users }))
    .catch(next);
};

const findUser = (id, next) => User.findById(id)
  .then((user) => {
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      return next(new NotFoundError('User not found'));
    }
    return next(err);
  });

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      const userData = {
        email,
        password: hash,
      };

      if (name) userData.name = name;
      if (about) userData.about = about;
      if (avatar) userData.avatar = avatar;

      return User.create(userData);
    })
    .then((user) => res.status(STATUS_CODES.CREATED)
      .send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
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

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-secret-key', { expiresIn: '7d' });
      res.send({ _id: token });
    })
    .catch((err) => next(err));
};

const getCurrentUser = (req, res, next) => {
  findUser(req.user._id, next)
    .then((user) => res.status(STATUS_CODES.OK).send({ data: user }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  findUser(req.params.userId, next)
    .then((user) => res.status(STATUS_CODES.OK).send({ data: user }))
    .catch(next);
};

const updateUserData = (fieldsToUpdate, errorMessage) => (req, res, next) => {
  const data = fieldsToUpdate.reduce((acc, field) => {
    if (req.body[field]) acc[field] = req.body[field];
    return acc;
  }, {});

  User.findByIdAndUpdate(
    req.user._id,
    data,
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('User not found');
      }
      res.status(STATUS_CODES.OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(errorMessage));
      }
      return next(err);
    });
};

const updateUserProfile = updateUserData(['name', 'about'], 'Incorrect data entered when updating profile');
const updateUserAvatar = updateUserData(['avatar'], 'Incorrect data entered when updating the avatar');

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
  login,
  getCurrentUser,
};
