const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cartValidation = require('../../validations/cart.validation');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.route('/').get(auth('createCart'), validate(cartValidation.createCart), cartController.createCart);

router
  .route('/:cartId/items/:lineItemId')
  .put(auth('createCart'), validate(cartValidation.updateItemInCart), cartController.updateItemInCart);

router
  .route('/:cartId')
  .get(auth('createCart'), validate(cartValidation.getCart), cartController.getCart)
  .post(auth('createCart'), validate(cartValidation.addItemToCart), cartController.addItemToCart);

module.exports = router;
