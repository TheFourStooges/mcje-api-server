const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { productAttributeOptionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');

const createProductAttribute = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string(),
    attributeOptions: Joi.array().items(productAttributeOptionSchema).min(1).unique('name').required(),
  }),
};

const getProductAttributes = {
  query: Joi.object().keys({
    name: Joi.string(),
    slug: Joi.string().regex(regexPatterns.slug),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProductAttribute = {
  params: Joi.object().keys({
    attributeId: Joi.string().custom(objectId),
  }),
};

const updateProductAttribute = {
  params: Joi.object().keys({
    attributeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      slug: Joi.string(),
      description: Joi.string(),
      attributeOptions: Joi.array().items(productAttributeOptionSchema).min(1).unique('name'),
    })
    .min(1),
};

const deleteProductAttribute = {
  params: Joi.object().keys({
    attributeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProductAttribute,
  getProductAttributes,
  getProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
};
