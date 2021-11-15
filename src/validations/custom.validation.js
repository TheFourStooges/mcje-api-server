const regexPatterns = require('../config/regexPatterns');

const objectId = (value, helpers) => {
  // const pattern = /^[0-9a-fA-F]{24}$/;
  const pattern1 = regexPatterns.uuidv4;
  const pattern2 = regexPatterns.slug;

  if (value.match(pattern1) || value.match(pattern2)) {
    return value;
  }
  return helpers.message('"{{#label}}" must be a valid uuid or a valid slug');

  // if (!value.match(pattern)) {
  //   return helpers.message('"{{#label}}" must be a valid uuid');
  // }
  // return value;
};

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
  password,
};
