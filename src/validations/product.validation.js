const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { idUnionSchema, slug } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');

const optionSchema = Joi.object().keys({
  name: Joi.string().required(),
  priceOffset: Joi.number().precision(2),
  quantity: Joi.number().integer(),
  assets: Joi.array().items(idUnionSchema).min(1).unique,
});

const optionGroupSchema = Joi.object()
  .keys({
    name: Joi.string().required(),
    // https://stackoverflow.com/questions/42656549/joi-validation-of-array
    options: Joi.array().items(optionSchema).min(1).unique('name'),
  })
  .required();

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string(),
    isActive: Joi.boolean(),
    categoryId: idUnionSchema,
    basePrice: Joi.number().precision(2).positive(),
    // https://stackoverflow.com/questions/54483904/how-to-use-joi-to-validate-map-object-map-keys-and-map-values
    attributes: Joi.object().pattern(slug, slug),
    optionGroups: Joi.array().items(optionGroupSchema),
    assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
    parentId: idUnionSchema,
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    categorySlug: Joi.string().regex(regexPatterns.slug),
    categoryWebId: Joi.string().regex(regexPatterns.uuidv4),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    parentId: Joi.string().custom(objectId),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().valid('id', 'webId', 'slug', 'sku'),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      slug: Joi.string(),
      description: Joi.string(),
      isActive: Joi.boolean(),
      assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
      parentId: idUnionSchema,
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
