const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const user = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'categoryId', 'slug']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
  // console.log('---->', req.body);
  // const category = await productService.getProductById(req.params.productId);
  let category;

  if (req.body.type === 'slug') {
    category = await productService.getProductBySlug(req.params.productId);
  } else {
    category = await productService.getProductById(req.params.productId);
  }

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(category);
});

const updateProduct = catchAsync(async (req, res) => {
  const category = await productService.updateProductById(req.params.productId, req.body);
  res.send(category);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
