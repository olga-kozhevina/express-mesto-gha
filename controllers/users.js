const User = require('../models/User');
const { STATUS_CODES } = require('../utils/constants');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(STATUS_CODES.OK).send({ users }))
    .catch((err) => next(err));
};

const createUser = async (req, res, next) => {
  try {
    const { name, about, avatar } = req.body;
    const user = await User.create({ name, about, avatar });

    res.status(STATUS_CODES.CREATED).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect data entered when creating user';
    }
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: 'User not found' });
    }
    res.status(STATUS_CODES.OK).send({ data: user });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect search data entered';
    }
    next(err);
  }
};

const updateUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: 'User not found' });
    }
    res.status(STATUS_CODES.OK).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect data entered when updating the avatar';
    }
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, about }, { new: true });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: 'User not found' });
    }
    res.status(STATUS_CODES.OK).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect data entered when updating profile';
    }

    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
};
