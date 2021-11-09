const Joi = require('joi');
const regexPatterns = require('../config/regexPatterns');

const objectId = (value, helpers) => {
  // const pattern = /^[0-9a-fA-F]{24}$/;
  const pattern = /^[0-9a-fA-f]$/;

  if (!value.match(pattern)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const id = Joi.object()
  .keys({
    id: Joi.number().integer().min(1),
    webId: Joi.string().regex(regexPatterns.uuidv4),
    slug: Joi.string().regex(regexPatterns.slug),
  })
  .oxor('id', 'webId', 'slug');
// object.oxor(...peers, [options]) : Defines an exclusive relationship between a set of keys
// where only one is allowed but none are required

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

module.exports = {
  objectId,
  id,
  password,
};
