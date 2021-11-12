const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productAttributeOptionService } = require('../services');

const createProductAttributeOption = catchAsync(async (req, res) => {
  const attributeOption = await productAttributeOptionService.createProductAttributeOption(req.params.attributeId, req.body);
  res.status(httpStatus.CREATED).send(attributeOption);
});

const getProductAttributeOptions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'slug']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productAttributeOptionService.queryProductAttributeOptions(filter, options, req.params.attributeId);
  res.send(result);
});

const getProductAttributeOption = catchAsync(async (req, res) => {
  // console.log('---->', req.body);
  // const category = await productAttributeOptionService.getProductById(req.params.productId);
  let optionGroup;

  if (req.body.type === 'slug') {
    optionGroup = await productAttributeOptionService.getProductAttributeOptionBySlug(
      req.params.attributeOptionId,
      req.params.attributeId
    );
  } else {
    optionGroup = await productAttributeOptionService.getProductAttributeOptionById(
      req.params.attributeOptionId,
      req.params.attributeId
    );
  }

  if (!optionGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attribute Option not found for this ProductAttribute');
  }
  res.send(optionGroup);
});

const updateProductAttributeOption = catchAsync(async (req, res) => {
  const optionGroup = await productAttributeOptionService.updateProductAttributeOptionById(
    req.params.attributeId,
    req.params.attributeOptionId,
    req.body
  );
  res.send(optionGroup);
});

const deleteProductAttributeOption = catchAsync(async (req, res) => {
  await productAttributeOptionService.deleteProductAttributeOptionById(req.params.attributeId, req.params.attributeOptionId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProductAttributeOption,
  getProductAttributeOptions,
  getProductAttributeOption,
  updateProductAttributeOption,
  deleteProductAttributeOption,
};
