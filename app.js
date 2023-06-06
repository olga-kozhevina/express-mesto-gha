const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { errors } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { STATUS_CODES } = require('./utils/constants');
const NotFoundError = require('./utils/errors/NotFoundError');
const { login, createUser } = require('./controllers/users');
const {
  signinValidator,
  signupValidator,
} = require('./middlewares/validation');

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1/mestodb' } = process.env;

const app = express();

// подключение к MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database is connected'))
  .catch((err) => console.log('Error connecting to the database', err));

mongoose.set({ runValidators: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// настраиваем заголовки
app.use(helmet());

// настраиваем миддлвэр для ограничения кол-ва запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Обработчики POST-запросов signin/signup
app.post('/signin', signinValidator, login);
app.post('/signup', signupValidator, createUser);

// руты миддлвэры
app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.all('/*', (req, res, next) => {
  next(new NotFoundError('Page does not exist'));
});

// ошибки миддлвэры
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
  const message = err.message || 'An error occurred on the server';

  res.status(statusCode).send({ message });
  next();
});

// Обработка ошибок Joi validation
app.use(errors());

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
