const Joi = require('joi');
// const id = require('./id.schema');
const uuid = require('./uuid.schema');
const regexPatterns = require('../../config/regexPatterns');

const idUnion = Joi.object()
  .keys({
    id: uuid,
    slug: Joi.string().regex(regexPatterns.slug),
  })
  .oxor('id', 'slug');
// object.oxor(...peers, [options]) : Defines an exclusive relationship between a set of keys
// where only one is allowed but none are required

module.exports = idUnion;
