const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { errors } = require('celebrate');
const morgan = require('morgan');
const logger = require('./logger');
const { PORT, MONGO_URL } = require('./config');
const router = require('./routes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Логирование запросов
app.use(morgan('tiny', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
}));

// Логирование ошибок
app.use((err, req, res, next) => {
  logger.error(err.stack);
  next(err);
});

// подключение к MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => logger.info('Database is connected'))
  .catch((err) => logger.error('Error connecting to the database', err));

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

// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'localhost:3000',
];

// Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

app.use((req, res, next) => {
  // Сохраняем источник запроса и тип запроса (HTTP-метод) в переменные
  const { origin, method } = req.headers;

  // проверяем, что источник запроса есть среди разрешённых
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header('Access-Control-Allow-Origin', origin);
  }

  // сохраняем список заголовков исходного запроса
  const requestHeaders = req.headers['access-control-request-headers'];

  // Если это предварительный запрос, добавляем нужные заголовки
  if (method === 'OPTIONS') {
    // разрешаем кросс-доменные запросы любых типов (по умолчанию)
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    // разрешаем кросс-доменные запросы с этими заголовками
    res.header('Access-Control-Allow-Headers', requestHeaders);
    // завершаем обработку запроса и возвращаем результат клиенту
    return res.status(200).end();
  }

  return next();
});

app.listen(PORT, () => {
  logger.info(`App listening on port ${PORT}`);
});
