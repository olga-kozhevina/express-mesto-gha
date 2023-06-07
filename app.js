const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { PORT, MONGO_URL } = require('./config');
const router = require('./routes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// подключение к MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database is connected'))
  .catch((err) => console.log('Error connecting to the database', err));

mongoose.set({ runValidators: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// настраиваем заголовки
app.use(helmet());

// настраиваем миддлвэр для ограничения кол-ва запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// используем корневой рутер
app.use('/', router);

// Обработка ошибок Joi validation
app.use(errors());

// подключаем централизованный обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
