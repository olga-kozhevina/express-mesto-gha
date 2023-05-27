const Card = require('../models/Card');
const { STATUS_CODES } = require('../utils/constants');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(STATUS_CODES.OK).send({ cards }))
    .catch(() => res.status(STATUS_CODES.SERVER_ERROR).send({ message: 'An error occurred on the server' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(STATUS_CODES.CREATED).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(STATUS_CODES.BAD_REQUEST).send({ message: 'Incorrect data entered when creating user' });
      } else {
        res.status(STATUS_CODES.SERVER_ERROR).send({ message: 'An error occurred on the server' });
      }
    });
};