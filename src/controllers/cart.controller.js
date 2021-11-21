const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const createCart = catchAsync(async (req, res) => {
  console.log('---->', req.user.id);
  const cart = await cartService.createCart(req.user.id);
  res.status(httpStatus.CREATED).send(cart);
});

// const getCategories = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'parentId', 'webId', 'slug']);
//   const options = pick(req.query, ['limit', 'page']);
//   const result = await cartService.queryCategories(filter, options);
//   res.send(result);
// });

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartById(req.params.cartId, req.user.id);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  res.send(cart);
});

// const updateCategory = catchAsync(async (req, res) => {
//   const category = await cartService.updateCategoryById(req.params.categoryId, req.body);
//   res.send(category);
// });

const deleteCart = catchAsync(async (req, res) => {
  await cartService.deleteCartById(req.params.cartId, req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const emptyCart = catchAsync(async (req, res) => {
  const cart = await cartService.emptyCartById(req.params.cartId, req.user.id);
  res.send(cart);
});

const addItemToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addItemToCart(req.params.cartId, req.user.id, req.body);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  res.send(cart);
});

const updateItemInCart = catchAsync(async (req, res) => {
  const lineItem = await cartService.updateItemInCart(req.params.cartId, req.user.id, req.params.lineItemId, req.body);
  if (!lineItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart or line item combination not found');
  }
  res.send(lineItem);
});

const deleteItemInCart = catchAsync(async (req, res) => {
  const cart = await cartService.deleteItemInCart(req.params.cartId, req.user.id, req.params.lineItemId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart or line item combination not found');
  }
  res.send(cart);
});

module.exports = {
  createCart,
  // getCategories,
  getCart,
  // updateCategory,
  deleteCart,
  emptyCart,
  addItemToCart,
  updateItemInCart,
  deleteItemInCart,
};
