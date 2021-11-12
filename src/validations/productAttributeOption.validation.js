const Joi = require('joi');
const { objectId } = require('./custom.validation');
// const { productAttributeOptionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');

const createProductAttributeOption = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string(),
  }),
};

const getProductAttributeOptions = {
  query: Joi.object().keys({
    name: Joi.string(),
    slug: Joi.string().regex(regexPatterns.slug),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProductAttributeOption = {
  params: Joi.object().keys({
    attributeId: Joi.string().custom(objectId),
    attributeOptionId: Joi.string().custom(objectId),
  }),
};

const updateProductAttributeOption = {
  params: Joi.object().keys({
    attributeId: Joi.required().custom(objectId),
    attributeOptionId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      slug: Joi.string(),
      description: Joi.string(),
    })
    .min(1),
};

const deleteProductAttributeOption = {
  params: Joi.object().keys({
    attributeId: Joi.string().custom(objectId),
    attributeOptionId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProductAttributeOption,
  getProductAttributeOptions,
  getProductAttributeOption,
  updateProductAttributeOption,
  deleteProductAttributeOption,
};
