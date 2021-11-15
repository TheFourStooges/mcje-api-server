const Joi = require('joi');
const regexPatterns = require('../../config/regexPatterns');

const uuid = Joi.string().regex(regexPatterns.uuidv4);

module.exports = uuid;
