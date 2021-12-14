const httpStatus = require('http-status');
const { Asset, Product, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const config = require('../config/config');

/**
 * Create a category. Noted that the category should have been validated by Joi.
 * @param {Object} assetBody
 * @returns {Promise<Category>}
 */
const createAsset = async (assetBody, assetFile) => {
  if (!assetFile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image not included');
  }

  // Extract the parentId from Body for pre-processing
  const { productId, ...restOfBody } = assetBody;
  const tempPath = assetFile.path;

  // {
  //   fieldname: 'image',
  //   originalname: 'Untitled.png',
  //   encoding: '7bit',
  //   mimetype: 'image/png',
  //   destination: '/home/pcminh/mcje-api-server/public/data/uploads',
  //   filename: 'image-1639473119880-893005986',
  //   path: '/home/pcminh/mcje-api-server/public/data/uploads/image-1639473119880-893005986',
  //   size: 1733
  // }
  console.log(assetFile);
  console.log(assetBody);
  console.log(tempPath);

  // console.log('---->', parentId);
  // console.log('---->', restOfBody);

  const t = await sequelize.transaction();

  try {
    // Build the new Category instance without parentId
    const asset = Asset.build({
      path: `${config.uploads.path}/${assetFile.filename}`,
      filename: assetFile.filename,
      fileSize: assetFile.size,
      ...restOfBody,
    });

    // If productId object exists
    if (productId) {
      // Find the parent Category instance...
      const parentProduct = await Product.findOne({ where: { id: productId } });
      if (!parentProduct) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Product id not found');
      }
      // And extracts its PRIMARY KEY...
      const parentSqlId = parentProduct.get('id');
      // Then sets it as the new Category productId.
      asset.set('productId', parentSqlId);
    }

    await t.commit();

    // Save and commit to database
    return asset.save();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `TRANSACTION_ERROR ${error}`);
  }
};

/**
 * Query for categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAssets = async (filter, options) => {
  const assets = await paginate(Asset, filter, options);
  return assets;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getAssetById = async (id) => {
  // return Category.findByPk(id);
  // , include: [{ model: Product, as: 'products' }]
  return Asset.findOne({ where: { id } });
};

// /**
//  * Get category by slug
//  * @param {string} slug
//  * @returns {Promise<Category>}
//  */
// const getCategoryBySlug = async (slug) => {
//   return Category.findOne({ where: { slug } });
// };

// /**
//  * Get category by WebID
//  * @param {string} webId
//  * @returns {Promise<Category>}
//  */
// const getCategoryByWebId = async (webId) => {
//   return Category.findOne({ where: { webId } });
// };

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateAssetById = async (assetId, updateBody) => {
  const asset = await getAssetById(assetId);
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
  }

  const { productId, ...restOfBody } = updateBody;
  if (productId) {
    const parentProduct = await Product.findOne({ where: productId });
    const parentSqlId = parentProduct.get('id');
    asset.set('productId', parentSqlId);
  }

  Object.assign(asset, restOfBody);
  await asset.save();
  return asset;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Category>}
 */
const deleteAssetById = async (assetId) => {
  const asset = await getAssetById(assetId);
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  await asset.destroy();
  return asset;
};

module.exports = {
  createAsset,
  queryAssets,
  getAssetById,
  updateAssetById,
  deleteAssetById,
};
