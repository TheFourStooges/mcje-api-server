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
  const result = await productOptionGroupService.queryProductOptionGroups(filter, options, req.params.productId);
  res.send(result);
});

const getProductOptionGroup = catchAsync(async (req, res) => {
  // console.log('---->', req.body);
  // const category = await productOptionGroupService.getProductById(req.params.productId);
  let optionGroup;

  if (req.body.type === 'slug') {
    optionGroup = await productOptionGroupService.getProductOptionGroupBySlug(
      req.params.optionGroupId,
      req.params.productId
    );
  } else {
    optionGroup = await productOptionGroupService.getProductOptionGroupById(req.params.optionGroupId, req.params.productId);
  }

  if (!optionGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Option Group not found for this Product');
  }
  res.send(optionGroup);
});

const updateProductOptionGroup = catchAsync(async (req, res) => {
  const optionGroup = await productOptionGroupService.updateProductOptionGroupById(
    req.params.productId,
    req.params.optionGroupId,
    req.body
  );
  res.send(optionGroup);
});

const deleteProductOptionGroup = catchAsync(async (req, res) => {
  await productOptionGroupService.deleteProductOptionGroup(req.params.productId, req.params.optionGroupId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProductOptionGroup,
  getProductOptionGroups,
  getProductOptionGroup,
  updateProductOptionGroup,
  deleteProductOptionGroup,
};
