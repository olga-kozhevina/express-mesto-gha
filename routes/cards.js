const cardsRouter = require('express').Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  cardValidator, cardIdValidator,
} = require('../middlewares/validation');

cardsRouter.get('/', getCards);
cardsRouter.post('/', cardValidator, createCard);
cardsRouter.delete('/:cardId', cardIdValidator, deleteCard);
cardsRouter.put('/:cardId/likes', cardIdValidator, likeCard);
cardsRouter.delete('/:cardId/likes', cardIdValidator, dislikeCard);

module.exports = cardsRouter;
