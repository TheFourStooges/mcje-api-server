const Joi = require('joi');
const { objectId } = require('./custom.validation');
// const { idUnionSchema } = require('./schemas');
// const regexPatterns = require('../config/regexPatterns');

const createShippingMethod = {
  body: Joi.object().keys({
    description: Joi.string().required(),
    provider: Joi.string().required(),
    price: Joi.number().precision(2).positive().required(),
  }),
};

const getShippingMethods = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getShippingMethod = {
  params: Joi.object().keys({
    shippingMethodId: Joi.string().custom(objectId),
  }),
};

const updateShippingMethod = {
  params: Joi.object().keys({
    shippingMethodId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      description: Joi.string(),
      provider: Joi.string(),
      price: Joi.number().precision(2).positive(),
    })
    .min(1),
};

const deleteShippingMethod = {
  params: Joi.object().keys({
    shippingMethodId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createShippingMethod,
  getShippingMethods,
  getShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
};
