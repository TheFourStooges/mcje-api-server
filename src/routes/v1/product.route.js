const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');
const productOptionGroupValidation = require('../../validations/productOptionGroup.validation');
const productOptionGroupController = require('../../controllers/productOptionGroup.controller');
const productAttributeValidation = require('../../validations/productAttribute.validation');
const productAttributeController = require('../../controllers/productAttribute.controller');

const router = express.Router();

// /product
router
  .route('/')
  .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
  .get(validate(productValidation.getProducts), productController.getProducts);

// /product/{productId}
router
  .route('/:productId')
  .get(validate(productValidation.getProduct), productController.getProduct)
  .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

// /product/{productId}/option_group
router
  .route('/:productId/option_group')
  .post(
    auth('manageProducts'),
    validate(productOptionGroupValidation.createProductOptionGroup),
    productOptionGroupController.createProductOptionGroup
  )
  .get(validate(productOptionGroupValidation.getProductOptionGroups), productOptionGroupController.getProductOptionGroups);

// /product/{productId}/option_group
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

// /product/attribute
router
  .route('/attribute')
  .post(
    auth('manageProducts'),
    validate(productAttributeValidation.createProductAttribute),
    productAttributeController.createProduct
  )
  .get(validate(productAttributeValidation.getProductAttributes), productAttributeController.getProducts);

// /product/attribute/{attributeId}
router
  .route('/attribute/:attributeId')
  .get(validate(productAttributeValidation.getProductAttribute), productAttributeController.getProduct)
  .patch(
    auth('manageProducts'),
    validate(productAttributeValidation.updateProductAttribute),
    productAttributeController.updateProduct
  )
  .delete(
    auth('manageProducts'),
    validate(productAttributeValidation.deleteProductAttribute),
    productAttributeController.deleteProduct
  );

module.exports = router;
