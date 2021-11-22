const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const checkoutValidation = require('../../validations/checkout.validation');
const checkoutController = require('../../controllers/checkout.controller');

const router = express.Router();

router
  .route('/')
  .get(
    auth('customerCartAndCheckout'),
    validate(checkoutValidation.generateCheckoutToken),
    checkoutController.generateCheckoutToken
  );

router
  .route('/:checkoutTokenId')
  .get(auth('customerCartAndCheckout'), validate(checkoutValidation.getCheckoutToken), checkoutController.getCheckoutToken)
  .patch(
    auth('customerCartAndCheckout'),
    validate(checkoutValidation.updateCheckoutToken),
    checkoutController.updateCheckoutToken
  );

// router
//   .route('/:cartId/items')
//   .delete(auth('customerCartAndCheckout'), validate(checkoutValidation.emptyCart), checkoutController.emptyCart);

// router
//   .route('/:cartId/items/:lineItemId')
//   .put(auth('customerCartAndCheckout'), validate(checkoutValidation.updateItemInCart), checkoutController.updateItemInCart)
//   .delete(
//     auth('customerCartAndCheckout'),
//     validate(checkoutValidation.deleteItemInCart),
//     checkoutController.deleteItemInCart
//   );

// router
//   .route('/:cartId')
//   .get(auth('customerCartAndCheckout'), validate(checkoutValidation.getCart), checkoutController.getCart)
//   .post(auth('customerCartAndCheckout'), validate(checkoutValidation.addItemToCart), checkoutController.addItemToCart)
//   .delete(auth('customerCartAndCheckout'), validate(checkoutValidation.deleteCart), checkoutController.deleteCart);

module.exports = router;
