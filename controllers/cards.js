const Card = require('../models/Card');
const { STATUS_CODES } = require('../utils/constants');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(STATUS_CODES.OK).send({ cards }))
    .catch((err) => next(err));
};

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner: req.user._id });
    console.log(req.user._id);

    res.status(STATUS_CODES.CREATED).send({ card });
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect data entered when creating card';
    }
    next(err);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);

    if (!card) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: 'Card not found' });
    }
    return res.status(STATUS_CODES.OK).send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect search data entered';
    }
    return next(err);
  }
};

const likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: 'Card not found' });
    }
    return res.status(STATUS_CODES.OK).send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect search data entered';
    }
    return next(err);
  }
};

const dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: 'Card not found' });
    }
    return res.status(STATUS_CODES.OK).send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = STATUS_CODES.BAD_REQUEST;
      err.message = 'Incorrect search data entered';
    }
    return next(err);
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
