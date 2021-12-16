const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { assetService } = require('../services');

const createAsset = catchAsync(async (req, res) => {
  const asset = await assetService.createAsset(req.body, req.file);
  res.status(httpStatus.CREATED).send(asset);
});

const getAssets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['productId']);
  const options = pick(req.query, ['limit', 'page']);
  const result = await assetService.queryAssets(filter, options);
  res.send(result);
});

const getAsset = catchAsync(async (req, res) => {
  const asset = await assetService.getCategoryById(req.params.assetId);
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
  }
  res.send(asset);
});

const updateAsset = catchAsync(async (req, res) => {
  const asset = await assetService.updateCategoryById(req.params.assetId, req.body);
  res.send(asset);
});

const deleteAsset = catchAsync(async (req, res) => {
  await assetService.deleteCategoryById(req.params.assetId);
  res.status(httpStatus.OK).send({ id: req.params.assetId, deleted: true });
});

module.exports = {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
};
