/**
 * Similar to express-async-handler
 * Handles exception inside of async express routes and passing them
 * to your express error handlers
 * See: https://www.npmjs.com/package/express-async-handler
 * See: https://stackoverflow.com/questions/56973265/what-does-express-async-handler-do
 * @param {*} fn async handler
 * @returns synchronous equivalent to the async function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
