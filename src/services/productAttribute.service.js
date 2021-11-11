const httpStatus = require('http-status');
const { ProductAttribute, ProductAttributeOption, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/**
 * Create a attribute. Noted that the attribute should have been validated by Joi.
 * @param {Object} attributeBody
 * @returns {Promise<ProductAttribute>}
 */
const createProductAttribute = async (attributeBody) => {
  if (await ProductAttribute.isSlugTaken(attributeBody.slug)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  return ProductAttribute.create(attributeBody, { include: [{ model: ProductAttributeOption, as: 'attributeOptions' }] });
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
const queryProductAttribute = async (filter, options) => {
  const attributes = await paginate(ProductAttribute, filter, options, [
    { model: ProductAttributeOption, as: 'attributeOptions' },
  ]);
  return attributes;
};

/**
 * Get attribute by id
 * @param {ObjectId} id
 * @returns {Promise<ProductAttribute>}
 */
const getProductAttributeById = async (id) => {
  // return ProductAttribute.findByPk(id);
  return ProductAttribute.findOne({ where: { id }, include: [{ model: ProductAttributeOption, as: 'attributeOptions' }] });
};

/**
 * Get attribute by slug
 * @param {string} slug
 * @returns {Promise<ProductAttribute>}
 */
const getProductAttributeBySlug = async (slug) => {
  return ProductAttribute.findOne({ where: { slug }, include: [{ model: ProductAttributeOption, as: 'attributeOptions' }] });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<ProductAttribute>}
 */
const updateProductAttributeById = async (attributeId, updateBody) => {
  const attribute = await getProductAttributeById(attributeId);
  if (!attribute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductAttribute not found');
  }
  if (updateBody.slug && (await ProductAttribute.isSlugTaken(updateBody.slug, attributeId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const { attributeOptions, ...restOfBody } = updateBody;

  const t = sequelize.transaction();
  try {
    if (attributeOptions) {
      await ProductAttributeOption.destroy({ where: { attributeId } });

      await Promise.all(
        attributeOptions.map(async (attributeOption) => ProductAttributeOption.create({ ...attributeOption, attributeId }))
      );
    }

    Object.assign(attribute, restOfBody);
    await attribute.save();
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error: ${error}. Transaction rolled back`);
  }

  return attribute.reload();
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<ProductAttribute>}
 */
const deleteProductAttributeById = async (attributeId) => {
  const attribute = await getProductAttributeById(attributeId);
  if (!attribute) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductAttribute not found');
  }
  await attribute.destroy();
  return attribute;
};

module.exports = {
  createProductAttribute,
  queryProductAttribute,
  getProductAttributeById,
  getProductAttributeBySlug,
  updateProductAttributeById,
  deleteProductAttributeById,
};
