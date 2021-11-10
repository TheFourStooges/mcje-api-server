const Joi = require('joi');
const regexPatterns = require('../../config/regexPatterns');

const webId = Joi.string().regex(regexPatterns.uuidv4);

module.exports = webId;
