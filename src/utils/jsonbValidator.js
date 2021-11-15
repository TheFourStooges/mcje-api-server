const revalidator = require('revalidator');

/**
 * Returns a validator to pass into the `validator` field.
 * Credits: https://github.com/sequelize/sequelize/issues/3698#issuecomment-105703204
 * @param {Object} schema RevalidatorSchema
 * @returns null, throws Error if invalid value
 */
const jsonbValidator = (schema) => (value) => {
  const results = revalidator.validate(value, schema);
  if (!results.valid) {
    throw new Error(JSON.stringify(results.errors));
  }
};

module.exports = jsonbValidator;
