const Joi = require('joi');
const regexPatterns = require('../../config/regexPatterns');

const id = Joi.string().regex(regexPatterns.slug);

module.exporrts = id;
