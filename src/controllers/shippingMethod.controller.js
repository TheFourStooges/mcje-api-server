const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { shippingMethodService } = require('../services');

const createShippingMethod = catchAsync(async (req, res) => {
  const shippingMethod = await shippingMethodService.createShippingMethod(req.body);
  res.status(httpStatus.CREATED).send(shippingMethod);
});

const getShippingMethods = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ['limit', 'page']);
  const result = await shippingMethodService.queryShippingMethods(filter, options);
  res.send(result);
});

const getShippingMethod = catchAsync(async (req, res) => {
  const category = await shippingMethodService.getShippingMethodById(req.params.shippingMethodId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

const updateShippingMethod = catchAsync(async (req, res) => {
  const category = await shippingMethodService.updateShippingMethodById(req.params.shippingMethodId, req.body);
  res.send(category);
});

const deleteShippingMethod = catchAsync(async (req, res) => {
  await shippingMethodService.deleteShippingMethodById(req.params.shippingMethodId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createShippingMethod,
  getShippingMethods,
  getShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
};
