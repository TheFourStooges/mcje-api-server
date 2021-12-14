const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { idUnionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');

const createAsset = {
  body: Joi.object().keys({
    description: Joi.string(),
    productId: Joi.string().custom(objectId),
  }),
};

const getAssets = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    productId: Joi.string().custom(objectId),
  }),
};

const getAsset = {
  params: Joi.object().keys({
    assetId: Joi.string().custom(objectId),
  }),
};

const updateAsset = {
  params: Joi.object().keys({
    assetId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      description: Joi.string(),
      productId: idUnionSchema,
    })
    .min(1),
};

const deleteAsset = {
  params: Joi.object().keys({
    assetId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
};
