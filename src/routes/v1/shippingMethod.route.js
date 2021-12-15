const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const shippingMethodValidation = require('../../validations/shippingMethod.validation');
const shippingMethodController = require('../../controllers/shippingMethod.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageProducts'),
    validate(shippingMethodValidation.createShippingMethod),
    shippingMethodController.createShippingMethod
  )
  .get(validate(shippingMethodValidation.getShippingMethods), shippingMethodController.getShippingMethods);

// /product/{productId}
router
  .route('/:shippingMethodId')
  .get(validate(shippingMethodValidation.getShippingMethod), shippingMethodController.getShippingMethod)
  .patch(
    auth('manageProducts'),
    validate(shippingMethodValidation.updateShippingMethod),
    shippingMethodController.updateShippingMethod
  )
  .delete(
    auth('manageProducts'),
    validate(shippingMethodValidation.deleteShippingMethod),
    shippingMethodController.deleteShippingMethod
  );

// // /product
// router
//   .route('/')
//   .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
//   .get(validate(productValidation.getProducts), productController.getProducts);

// // /product/{productId}
// router
//   .route('/:productId')
//   .get(validate(productValidation.getProduct), productController.getProduct)
//   .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
//   .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

module.exports = router;
