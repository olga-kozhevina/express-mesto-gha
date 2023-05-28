const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { STATUS_CODES } = require('./utils/constants');

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

// временное решение авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '6472023f9f2c783c6b9aa806',
  };
  next();
});

// руты миддлвэры
app.use('/', usersRouter);
app.use('/', cardsRouter);

app.all('/*', (req, res) => {
  res.status(STATUS_CODES.NOT_FOUND).send({ message: 'Page does not exist' });
});

// ошибки миддлвэры
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
  const message = err.message || 'An error occurred on the server';

  res.status(statusCode).send({ message });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
