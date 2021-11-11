const Joi = require('joi');
const idUnionSchema = require('./idUnion.schema');
const regexPatterns = require('../../config/regexPatterns');

const productOptionSchema = Joi.object().keys({
  name: Joi.string().required(),
  slug: Joi.string().regex(regexPatterns.slug).required(),
  priceOffset: Joi.number().precision(2).required(),
  assets: Joi.array().items(idUnionSchema).min(0).unique(),
});

module.exports = productOptionSchema;
