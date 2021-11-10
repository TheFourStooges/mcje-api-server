const Joi = require('joi');
const id = require('./id.schema');
const webId = require('./webId.schema');
const slug = require('./slug.schema');

const idUnion = Joi.object()
  .keys({
    id,
    webId,
    slug,
  })
  .oxor('id', 'webId', 'slug');
// object.oxor(...peers, [options]) : Defines an exclusive relationship between a set of keys
// where only one is allowed but none are required

module.exports = idUnion;
