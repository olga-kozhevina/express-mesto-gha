const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const ConflictError = require('../utils/errors/ConflictError');
const { STATUS_CODES } = require('../utils/constants');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(STATUS_CODES.OK).send({ data: users }))
    .catch(next);
};

const createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.status(STATUS_CODES.CREATED)
      .json({
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

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-secret-key', { expiresIn: '7d' });
      res.send({ _id: token });
    })
    .catch((err) => {
      next(err);
    });
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return res.status(STATUS_CODES.OK).json({ data: user });
  } catch (err) {
    if (err.name === 'CastError') {
      throw new BadRequestError('Incorrect search data entered');
    }
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError('Invalid user id');
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return res.status(STATUS_CODES.OK).json({ data: user });
  } catch (err) {
    if (err.name === 'CastError') {
      throw new BadRequestError('Incorrect search data entered');
    }
    return next(err);
  }
};

const updateUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true });

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return res.status(STATUS_CODES.OK).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      throw new BadRequestError('Incorrect data entered when updating the avatar');
    }
    return next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, about }, { new: true });

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return res.status(STATUS_CODES.OK).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      throw new BadRequestError('Incorrect data entered when updating profile');
    }
    return next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
  login,
  getCurrentUser,
};
