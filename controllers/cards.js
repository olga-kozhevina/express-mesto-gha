const Card = require('../models/Card');
const { STATUS_CODES } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const ForbiddenError = require('../utils/errors/ForbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
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
      throw new BadRequestError('Incorrect data entered when creating card');
    }
    next(err);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    // проверяем, является ли текущий пользователь владельцем карточки
    if (card.owner.toString() !== req.user._id) {
      throw new ForbiddenError('You do not have permission to delete this card.');
    }

    // если текущий пользователь = владелец карточки, то удаляем ее
    await Card.deleteOne(card);
    return res.status(STATUS_CODES.OK).send({ message: 'Card deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      throw new BadRequestError('Incorrect search data entered');
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
      throw new NotFoundError('Card not found');
    }
    return res.status(STATUS_CODES.OK).send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      throw new BadRequestError('Incorrect search data entered');
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
      throw new NotFoundError('Card not found');
    }
    return res.status(STATUS_CODES.OK).send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      throw new BadRequestError('Incorrect search data entered');
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
