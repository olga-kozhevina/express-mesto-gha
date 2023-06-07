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

cardsRouter.get('/cards', getCards);
cardsRouter.post('/cards', cardValidator, createCard);
cardsRouter.delete('/cards/:cardId', cardIdValidator, deleteCard);
cardsRouter.put('/cards/:cardId/likes', cardIdValidator, likeCard);
cardsRouter.delete('/cards/:cardId/likes', cardIdValidator, dislikeCard);

module.exports = cardsRouter;
