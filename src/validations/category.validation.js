const Joi = require('joi');
const { objectId, id } = require('./custom.validation');
const regexPatterns = require('../config/regexPatterns');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string(),
    isActive: Joi.boolean(),
    assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
    parentId: id,
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    slug: Joi.string().regex(regexPatterns.slug),
    webId: Joi.string().regex(regexPatterns.uuidv4),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    parentId: Joi.string().custom(objectId),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      slug: Joi.string(),
      description: Joi.string(),
      isActive: Joi.boolean(),
      assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
      parentId: id,
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
