const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

/**
 * Returns a custom callback for passport.authenticate()
 * See: http://www.passportjs.org/docs/authenticate/
 * @param {Object} req Request object
 * @param {Function} resolve from Promise()
 * @param {Function} reject from Promise()
 * @param {...string} requiredRights Required rights
 * @returns a custom passport.authenticate() callback
 */
const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // console.log("---->", err);
  // console.log("---->", info);
  // console.log("---->", user);
  if (err || info || !user) {
    // console.log('----> 401 ERROR');
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    // Get the rights corresponding to the role of the requesting user
    const userRights = roleRights.get(user.role);
    // For every requiredRight, check if the user has *all* the rights required.
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    // If the user doesn't have all the rights and if the user requests the profile of another user
    // Logged in users can fetch only their own user information. Only admins can fetch other users.
    // Due to changes in the model schema (from `mongoose` to `sequelize`), the typeof id has been changed from
    // string to number, therefore the !== expression will always evaluates to true
    if (!hasRequiredRights && req.params.userId !== user.id.toString(10)) {
      // Reject the promise
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

/**
 * Returns a router-level middleware that checks the user's privelege against the requiredRights
 * string array.
 * Privelege strings defined in /src/config/roles
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 * @param  {...string} requiredRights Required rights
 * @returns a router-level middleware
 */
const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    // console.log("----> ", JSON.stringify(req.headers));
    return new Promise((resolve, reject) => {
      // Authenticate user with strategy 'jwt', session disabled, and with custom callback
      // http://www.passportjs.org/docs/authenticate/
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
