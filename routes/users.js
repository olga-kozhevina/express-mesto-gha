const express = require('express');
const {
  getUsers,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
  getCurrentUser,
} = require('../controllers/users');

const usersRouter = express.Router();

usersRouter.get('/users', getUsers);
usersRouter.get('/users/me', getCurrentUser);
usersRouter.get('/users/:userId', getUserById);
usersRouter.patch('/users/me/avatar', updateUserAvatar);
usersRouter.patch('/users/me', updateUserProfile);

module.exports = usersRouter;
