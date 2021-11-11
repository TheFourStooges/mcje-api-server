const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { idUnionSchema, slugSchema, productOptionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');

const createProductOptionGroup = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      slug: Joi.string().regex(regexPatterns.slug).required(),
      // https://stackoverflow.com/questions/42656549/joi-validation-of-array
      options: Joi.array().items(productOptionSchema).min(1).unique('name').required(),
    })
    .required(),
};

const getProductOptionGroups = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    name: Joi.string(),
    // categorySlug: Joi.string().regex(regexPatterns.slug),
    // categoryId: Joi.string().regex(regexPatterns.uuidv4),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProductOptionGroup = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    optionGroupId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().valid('id', 'slug'),
  }),
};

const updateProductOptionGroup = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
    optionGroupId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      slug: Joi.string().regex(regexPatterns.slug),
      // https://stackoverflow.com/questions/42656549/joi-validation-of-array
      options: Joi.array().items(productOptionSchema).min(1).unique('name'),
    })
    .min(1),
};

const deleteProductOptionGroup = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    optionGroupId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProductOptionGroup,
  getProductOptionGroups,
  getProductOptionGroup,
  updateProductOptionGroup,
  deleteProductOptionGroup,
};
