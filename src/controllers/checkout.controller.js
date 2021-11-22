const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { checkoutService } = require('../services');

const generateCheckoutToken = catchAsync(async (req, res) => {
  const checkoutToken = await checkoutService.generateCheckoutToken(req.user.id, req.body.cartId);
  res.status(httpStatus.CREATED).send(checkoutToken);
});

const getCheckoutToken = catchAsync(async (req, res) => {
  const checkoutToken = await checkoutService.getCheckoutTokenById(req.user.id, req.params.checkoutTokenId);
  if (!checkoutToken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Checkout token not found');
  }
  res.send(checkoutToken);
});

const updateCheckoutToken = catchAsync(async (req, res) => {
  const checkoutToken = await checkoutService.updateCheckoutTokenById(req.user.id, req.params.checkoutTokenId, req.body);
  res.send(checkoutToken);
});

const captureOrder = catchAsync(async (req, res) => {});

module.exports = {
  generateCheckoutToken,
  getCheckoutToken,
  updateCheckoutToken,
};
