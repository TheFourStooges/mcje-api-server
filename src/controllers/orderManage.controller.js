const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderManageService } = require('../services');

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ['limit', 'page', 'sortBy']);
  const result = await orderManageService.queryOrders(filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderManageService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(order);
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await orderManageService.updateOrderById(req.params.orderId, req.body);
  res.send(order);
});

const addOrderPayment = catchAsync(async (req, res) => {
  const payment = await orderManageService.addOrderPayment(req.params.orderId, req.body);
  res.send(payment);
});

module.exports = {
  getOrders,
  getOrder,
  updateOrder,
  addOrderPayment,
};
