const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');

const productOptionGroupValidation = require('../../validations/productOptionGroup.validation');
const productOptionGroupController = require('../../controllers/productOptionGroup.controller');

const productAttributeValidation = require('../../validations/productAttribute.validation');
const productAttributeController = require('../../controllers/productAttribute.controller');

const productAttributeOptionValidation = require('../../validations/productAttributeOption.validation');
const productAttributeOptionController = require('../../controllers/productAttributeOption.controller');

const router = express.Router();

// /product/attribute
router
  .route('/attribute')
  .post(
    auth('manageProducts'),
    validate(productAttributeValidation.createProductAttribute),
    productAttributeController.createProductAttribute
  )
  .get(validate(productAttributeValidation.getProductAttributes), productAttributeController.getProductAttributes);

// /product/attribute/{attributeId}
router
  .route('/attribute/:attributeId')
  .get(validate(productAttributeValidation.getProductAttribute), productAttributeController.getProductAttribute)
  .patch(
    auth('manageProducts'),
    validate(productAttributeValidation.updateProductAttribute),
    productAttributeController.updateProductAttribute
  )
  .delete(
    auth('manageProducts'),
    validate(productAttributeValidation.deleteProductAttribute),
    productAttributeController.deleteProductAttribute
  );

// /product/attribute/{attributeId}/attribute_option
router
  .route('/attribute/:attributeId/attribute_option')
  .post(
    auth('manageProducts'),
    validate(productAttributeOptionValidation.createProductAttributeOption),
    productAttributeOptionController.createProductAttributeOption
  )
  .get(
    validate(productAttributeOptionValidation.getProductAttributeOptions),
    productAttributeOptionController.getProductAttributeOptions
  );
// /product/attribute/{attributeId}/attribute_option/{attributeOptionId}
router
  .route('/attribute/:attributeId/attribute_option/:attributeOptionId')
  .get(
    validate(productAttributeOptionValidation.getProductAttributeOption),
    productAttributeOptionController.getProductAttributeOption
  )
  .patch(
    auth('manageProducts'),
    validate(productAttributeOptionValidation.updateProductAttributeOption),
    productAttributeOptionController.updateProductAttributeOption
  )
  .delete(
    auth('manageProducts'),
    validate(productAttributeOptionValidation.deleteProductAttributeOption),
    productAttributeOptionController.deleteProductAttributeOption
  );

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

// /product/{productId}/option_group/{optionGroupId}
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
