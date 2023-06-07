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

usersRouter.get('/', getUsers);
usersRouter.get('/me', getCurrentUser);
usersRouter.get('/:userId', userIdValidator, getUserById);
usersRouter.patch('/me/avatar', userAvatarValidator, updateUserAvatar);
usersRouter.patch('/me', userInfoValidator, updateUserProfile);

module.exports = usersRouter;
