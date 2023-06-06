const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NotFoundError = require('../utils/errors/NotFoundError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');
const BadRequestError = require('../utils/errors/BadRequestError');
const { STATUS_CODES } = require('../utils/constants');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(STATUS_CODES.OK).send({ users }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-secret-key', { expiresIn: '7d' });
      res.send({ _id: token });
    })
    .catch((next));
};

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      about,
      avatar,
      email,
      password,
    } = req.body;

    // проверяем, есть ли такой email в БД
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new BadRequestError('User with this email already exists');
    }

    // хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    // проверяем, чтобы пароль не возвращался в ответе
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(STATUS_CODES.CREATED).send({ data: userWithoutPassword });
  } catch (err) {
    if (err.name === 'ValidationError') {
      throw new BadRequestError('Incorrect data entered when creating user');
    }
    return next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return res.status(STATUS_CODES.OK).send({ data: user });
  } catch (err) {
    if (err.name === 'CastError') {
      throw new BadRequestError('Incorrect search data entered');
    }
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return res.status(STATUS_CODES.OK).send({ data: user });
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
    return res.status(STATUS_CODES.OK).send(user);
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
    return res.status(STATUS_CODES.OK).send(user);
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
