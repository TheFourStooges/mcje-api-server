const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productOptionGroupService } = require('../services');

const createProductOptionGroup = catchAsync(async (req, res) => {
  const user = await productOptionGroupService.createProductOptionGroup(req.params.productId, req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getProductOptionGroups = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'slug']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productOptionGroupService.queryProductOptionGroups(filter, options);
  res.send(result);
});

const getProductOptionGroup = catchAsync(async (req, res) => {
  // console.log('---->', req.body);
  // const category = await productOptionGroupService.getProductById(req.params.productId);
  let category;

  if (req.body.type === 'slug') {
    category = await productOptionGroupService.getProductBySlug(req.params.productId);
  } else {
    category = await productOptionGroupService.getProductById(req.params.productId);
  }

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(category);
});

const updateProductOptionGroup = catchAsync(async (req, res) => {
  const category = await productOptionGroupService.updateProductById(req.params.productId, req.body);
  res.send(category);
});

const deleteProductOptionGroup = catchAsync(async (req, res) => {
  await productOptionGroupService.deleteProductById(req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProductOptionGroup,
  getProductOptionGroups,
  getProductOptionGroup,
  updateProductOptionGroup,
  deleteProductOptionGroup,
};
