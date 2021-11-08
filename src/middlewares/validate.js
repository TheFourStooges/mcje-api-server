const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * @typedef {Object} ValidationSchema
 * @property {JoiObject} params JoiObject, created from Joi.object().keys()
 * @property {JoiObject} query JoiObject, created from Joi.object().keys()
 * @property {JoiObject} body JoiObject, created from Joi.object().keys()
 */

/**
 * Returns a Router-level middleware that validates the request against
 * the provided schema.
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 * @param {ValidationSchema} schema A custom validation schema
 * @returns a router-level middleware intended for the route corresponding to the `schema`
 */
const validate = (schema) => (req, res, next) => {
  // Extract key-value pairs with key in (params, query, body)
  // into a Joi validation schema
  const validSchema = pick(schema, ['params', 'query', 'body']);
  // Extract (params, query, body) key-value pair from request
  // object into `object` variable
  const object = pick(req, Object.keys(validSchema));

  // https://viblo.asia/p/method-chaining-trong-javascript-OeVKB36rZkW

  // compile(schema) => schema : Converts literal schema definition to
  //    `joi` schema object (or returns the same back if already `joi`
  //    schema object)
  // prefs({}) : overrides global validate() options for the current
  //    key and subkey
  // validate() : Validate a vlaue using the current schema and options
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  // Object.assign() copies all enumerable own properties from one or more
  // source objects to a target object. Returns the modified target object.
  Object.assign(req, value);

  // Call next middleware in stack
  return next();
};

module.exports = validate;
