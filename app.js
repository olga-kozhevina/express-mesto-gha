const express = require('express');
const mongoose = require('mongoose');
const usersRoutes = require('./routes/users');
const { STATUS_CODES } = require('./utils/constants');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

// middleware routes
app.use('/users', usersRoutes);

// middleware error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
  const message = err.message || 'An error occurred on the server';

  res.status(statusCode).send({ message });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
