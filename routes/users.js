const usersRouter = require('express').Router();
const {
  getUsers,
  getUserById,
  updateUserAvatar,
  updateUserProfile,
  getCurrentUser,
} = require('../controllers/users');

const {
  userIdValidator,
  userInfoValidator,
  userAvatarValidator,
} = require('../middlewares/validation');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/me', getCurrentUser);
usersRouter.get('/users/:userId', userIdValidator, getUserById);
usersRouter.patch('/users/me/avatar', userAvatarValidator, updateUserAvatar);
usersRouter.patch('/users/me', userInfoValidator, updateUserProfile);

module.exports = usersRouter;
