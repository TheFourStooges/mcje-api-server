const Joi = require('joi');
const regexPatterns = require('../../config/regexPatterns');

const productAttributeOption = Joi.object().keys({
  name: Joi.string().required(),
  slug: Joi.string().regex(regexPatterns.slug).required(),
  description: Joi.string(),
});

module.exports = productAttributeOption;
