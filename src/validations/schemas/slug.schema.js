const Joi = require('joi');
const regexPatterns = require('../../config/regexPatterns');

const slug = Joi.string().regex(regexPatterns.slug);

module.exporrts = slug;
