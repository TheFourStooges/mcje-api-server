const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cartValidation = require('../../validations/cart.validation');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.route('/').get(auth('customerCartAndCheckout'), validate(cartValidation.createCart), cartController.createCart);

router
  .route('/:cartId/items')
  .delete(auth('customerCartAndCheckout'), validate(cartValidation.emptyCart), cartController.emptyCart);

router
  .route('/:cartId/items/:lineItemId')
  .put(auth('customerCartAndCheckout'), validate(cartValidation.updateItemInCart), cartController.updateItemInCart)
  .delete(auth('customerCartAndCheckout'), validate(cartValidation.deleteItemInCart), cartController.deleteItemInCart);

router
  .route('/:cartId')
  .get(auth('customerCartAndCheckout'), validate(cartValidation.getCart), cartController.getCart)
  .post(auth('customerCartAndCheckout'), validate(cartValidation.addItemToCart), cartController.addItemToCart)
  .delete(auth('customerCartAndCheckout'), validate(cartValidation.deleteCart), cartController.deleteCart);

module.exports = router;
