const httpStatus = require('http-status');
// const sequelize = require('../config/sequelize');
const { sequelize, Product, ProductAttribute, ProductAttributeOption } = require('../models');
// const productService = require('./product.service');
const attributeService = require('./productAttribute.service');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/**
 * Create a category. Noted that the category should have been validated by Joi.
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProductAttributeOption = async (attributeId, attributeOptionBody) => {
  if (await ProductAttributeOption.isSlugTaken(attributeOptionBody.slug, attributeId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const attribute = await attributeService.getProductAttributeById(attributeId);

  if (!attribute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attribute not found');
  }

  const attributeOption = await ProductAttributeOption.create({
    ...attributeOptionBody,
    attributeId,
  });

  return attributeOption;
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
const queryProductAttributeOptions = async (filter, options, attributeId) => {
  const filterWithProductId = { ...filter, attributeId };
  // Also eager loads ProductOption as 'options'
  // https://sequelize.org/master/class/lib/model.js~Model.html#static-method-findAll
  const attributeOptions = await paginate(ProductAttributeOption, filterWithProductId, options);
  return attributeOptions;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductAttributeOptionById = async (id, attributeId) => {
  return ProductAttributeOption.findOne({ where: { id, attributeId } });
};

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<Product>}
 */
const getProductAttributeOptionBySlug = async (slug, attributeId) => {
  return ProductAttributeOption.findOne({ where: { slug, attributeId } });
};

// /**
//  * Get category by WebID
//  * @param {string} webId
//  * @returns {Promise<Product>}
//  */
// const getCategoryByWebId = async (webId) => {
//   return Product.findOne({ where: { webId } });
// };

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductAttributeOptionById = async (attributeId, attributeOptionId, updateBody) => {
  // const optionGroup = await ProductOptionGroup.findOne({ where: { id: attributeOptionId, attributeId } });
  const attributeOption = await getProductAttributeOptionById(attributeOptionId, attributeId);
  if (!attributeOption) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attribute Option not found for this ProductAttribute');
  }
  if (updateBody.slug && (await ProductAttributeOption.isSlugTaken(updateBody.slug, attributeId, attributeOptionId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const { options, ...restOfBody } = updateBody;

  const t = await sequelize.transaction();
  try {
    // // If options[] is provided with request, meaning the old ProductOption list must be deleted to be
    // // replace with the new list
    // if (options) {
    //   // Delete old ProductOptions that belongs to this attributeOptionId
    //   await ProductOption.destroy({ where: { attributeOptionId } });

    //   // Create new options (provided by user in parallel)
    //   await Promise.all(options.map(async (option) => ProductOption.create({ ...option, attributeOptionId })));
    // }

    // Assign modified fields to the existing instance
    Object.assign(attributeOption, restOfBody);
    await attributeOption.save();
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error: ${error}. Transaction rolled back`);
  }

  // Extract the categoryId from Body for pre-processing
  // const { categoryId, ...restOfBody } = updateBody;

  // // If categoryId object exists
  // if (categoryId) {
  //   // Find the parent Category instance...
  //   const parentCategory = await Category.findOne({ where: categoryId });
  //   // And extracts its PRIMARY KEY...
  //   const parentSqlId = parentCategory.get('id');
  //   // Then sets it as the new Product categoryId.
  //   attributeOption.set('categoryId', parentSqlId);
  // }

  // Object.assign(attributeOption, restOfBody);
  // await attributeOption.save();
  return attributeOption.reload();
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Product>}
 */
const deleteProductAttributeOptionById = async (attributeId, attributeOptionId) => {
  const attributeOption = await getProductAttributeOptionById(attributeOptionId, attributeId);
  if (!attributeOption) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Option Group not found for this Product');
  }
  if ((await attributeOption.countProducts()) > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Exists Product(s) associated with this AttributeOption');
  }

  const t = await sequelize.transaction();
  try {
    // await ProductOption.destroy({ where: { attributeOptionId } });
    await attributeOption.destroy();
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error: ${error}. Transaction rolled back`);
  }

  return attributeOption;
};

module.exports = {
  createProductAttributeOption,
  queryProductAttributeOptions,
  getProductAttributeOptionById,
  getProductAttributeOptionBySlug,
  // getCategoryByWebId,
  updateProductAttributeOptionById,
  deleteProductAttributeOptionById,
};
