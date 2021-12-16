const Joi = require('joi');
const { objectId } = require('./custom.validation');
// const { idUnionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');
const orderStatusEnum = require('../config/enums/orderStatusEnum');

// const createOrder = {
//   body: Joi.object().keys({
//     name: Joi.string().required(),
//     slug: Joi.string().required(),
//     description: Joi.string(),
//     isActive: Joi.boolean(),
//     assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
//     parentId: idUnionSchema,
//   }),
// };

const getOrders = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      customer: Joi.object().keys({
        name: Joi.string().max(100),
        email: Joi.string().email(),
      }),
      shippingAddress: Joi.object().keys({
        name: Joi.string().max(100),
        phone: Joi.string().min(10).max(13).regex(regexPatterns.phoneNumber),
        streetLine1: Joi.string().max(100),
        ward: Joi.string().max(100),
        district: Joi.string().max(100),
        city: Joi.string().max(100),
        postalCode: Joi.string().max(6).regex(regexPatterns.postalCode),
        country: Joi.string().max(100),
      }),
    })
    .min(1),
};

const addOrderPayment = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    transactionId: Joi.string().required(),
    type: Joi.string()
      .valid(...orderStatusEnum.orderPaymentType)
      .required(),
    amount: Joi.number().precision(2).positive().required(),
    currency: Joi.string().min(3).max(3).required().default('VND'),
  }),
};

const addOrderFulfillment = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    description: Joi.string().required(),
    carrier: Joi.string().required(),
    type: Joi.string()
      .valid(...orderStatusEnum.orderFulfillmentType)
      .required(),
    trackingNumber: Joi.string(),
  }),
};

// const deleteCategory = {
//   params: Joi.object().keys({
//     categoryId: Joi.string().custom(objectId),
//   }),
// };

module.exports = {
  // createOrder,
  getOrders,
  getOrder,
  updateOrder,
  addOrderPayment,
  addOrderFulfillment,
  // deleteCategory,
};
