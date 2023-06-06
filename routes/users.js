const express = require('express');
const {
  getUsers,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
  getCurrentUser,
} = require('../controllers/users');

const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/me', getCurrentUser);
usersRouter.get('/:userId', getUserById);
usersRouter.patch('/me/avatar', updateUserAvatar);
usersRouter.patch('/me', updateUserProfile);

module.exports = usersRouter;
