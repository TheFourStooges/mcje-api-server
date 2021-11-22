const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { idUnionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');

const generateCheckoutToken = {
  body: Joi.object().keys({
    cartId: Joi.string().custom(objectId).required(),
  }),
};

const getCheckoutToken = {
  params: Joi.object().keys({
    checkoutTokenId: Joi.string().custom(objectId),
  }),
};

const updateCheckoutToken = {
  params: Joi.object().keys({
    checkoutTokenId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    shippingMethodId: idUnionSchema,
  }),
};

// const getCategories = {
//   query: Joi.object().keys({
//     name: Joi.string(),
//     slug: Joi.string().regex(regexPatterns.slug),
//     webId: Joi.string().regex(regexPatterns.uuidv4),
//     limit: Joi.number().integer(),
//     page: Joi.number().integer(),
//     parentId: Joi.string().custom(objectId),
//   }),
// };

const getCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
  }),
};

const addItemToCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    quantity: Joi.number().integer().positive().default(1),
  }),
};

const updateItemInCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
    lineItemId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    quantity: Joi.number().integer().min(1),
  }),
};

const deleteItemInCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
    lineItemId: Joi.string().custom(objectId),
  }),
};

// const updateCategory = {
//   params: Joi.object().keys({
//     categoryId: Joi.required().custom(objectId),
//   }),
//   body: Joi.object()
//     .keys({
//       name: Joi.string(),
//       slug: Joi.string(),
//       description: Joi.string(),
//       isActive: Joi.boolean(),
//       assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
//       parentId: idUnionSchema,
//     })
//     .min(1),
// };

const deleteCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
  }),
};

const emptyCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  generateCheckoutToken,
  getCheckoutToken,
  updateCheckoutToken,
  // getCategories,
  getCart,
  // updateCategory,
  deleteCart,
  emptyCart,
  addItemToCart,
  updateItemInCart,
  deleteItemInCart,
};
