const card = require('../models/card');
const { STATUS_CODES } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const ForbiddenError = require('../utils/errors/ForbiddenError');

const getCards = (req, res, next) => {
  card.find({})
    .then((cards) => res.status(STATUS_CODES.OK).send({ cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  return card.create({ name, link, owner: req.user._id })
    .then((cards) => res.status(STATUS_CODES.CREATED).send({ cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data entered when creating card'));
      }
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  card.findById(req.params.cardId)
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError('Card not found');
      }
      // проверяем, является ли текущий пользователь владельцем карточки
      if (cards.owner.toString() !== req.user._id) {
        throw new ForbiddenError('You do not have permission to delete this card');
      }
      cards.deleteOne()
        .then(() => res.send({ message: 'Card deleted successfully' }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Incorrect search data entered'));
      }
      return next(err);
    });
};

const likeCard = (req, res, next) => {
  card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError('Card not found');
      }
      res.status(STATUS_CODES.OK).send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Incorrect search data entered'));
      }
      return next(err);
    });
};

const dislikeCard = (req, res, next) => {
  card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError('Card not found');
      }
      res.status(STATUS_CODES.OK).send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Incorrect search data entered'));
      }
      return next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};

