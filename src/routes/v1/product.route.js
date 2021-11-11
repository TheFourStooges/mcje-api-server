const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');
const productOptionGroupValidation = require('../../validations/productOptionGroup.validation');
const productOptionGroupController = require('../../controllers/productOptionGroup.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
  .get(validate(productValidation.getProducts), productController.getProducts);

router
  .route('/:productId')
  .get(validate(productValidation.getProduct), productController.getProduct)
  .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

router
  .route('/:productId/option_group')
  .post(
    auth('manageProducts'),
    validate(productOptionGroupValidation.createProductOptionGroup),
    productOptionGroupController.createProductOptionGroup
  )
  .get(validate(productOptionGroupValidation.getProductOptionGroups), productOptionGroupController.getProductOptionGroups);

router
  .route('/:productId/option_group/:optionGroupId')
  .get(validate(productOptionGroupValidation.getProductOptionGroup), productOptionGroupController.getProductOptionGroup)
  .patch(
    auth('manageProducts'),
    validate(productOptionGroupValidation.updateProductOptionGroup),
    productOptionGroupController.updateProductOptionGroup
  )
  .delete(
    auth('manageProducts'),
    validate(productOptionGroupValidation.deleteProductOptionGroup),
    productOptionGroupController.deleteProductOptionGroup
  );

module.exports = router;
