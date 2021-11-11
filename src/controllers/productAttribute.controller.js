const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productAttributeService } = require('../services');

const createProductAttribute = catchAsync(async (req, res) => {
  const user = await productAttributeService.createProductAttribute(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getProductAttributes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'slug']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productAttributeService.queryProductAttribute(filter, options);
  res.send(result);
});

const getProductAttribute = catchAsync(async (req, res) => {
  const category = await productAttributeService.getCategoryById(req.params.attributeId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

const updateProductAttribute = catchAsync(async (req, res) => {
  const category = await productAttributeService.updateCategoryById(req.params.attributeId, req.body);
  res.send(category);
});

const deleteProductAttribute = catchAsync(async (req, res) => {
  await productAttributeService.deleteCategoryById(req.params.attributeId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProductAttribute,
  getProductAttributes,
  getProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
};
