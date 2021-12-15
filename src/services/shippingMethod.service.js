const httpStatus = require('http-status');
const { ShippingMethod } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/**
 * Create a shippingMethod. Noted that the shippingMethod should have been validated by Joi.
 * @param {Object} categoryBody
 * @returns {Promise<ShippingMethod>}
 */
const createShippingMethod = async (categoryBody) => {
  // Build the new ShippingMethod instance without parentId
  const shippingMethod = ShippingMethod.build(categoryBody);
  return shippingMethod.save();
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
const queryShippingMethods = async (filter, options) => {
  const users = await paginate(ShippingMethod, filter, options);
  return users;
};

/**
 * Get shippingMethod by id
 * @param {ObjectId} id
 * @returns {Promise<ShippingMethod>}
 */
const getShippingMethodById = async (id) => {
  // return ShippingMethod.findByPk(id);
  // , include: [{ model: Product, as: 'products' }]
  return ShippingMethod.findOne({ where: { id } });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<ShippingMethod>}
 */
const updateShippingMethodById = async (shippingMethodId, updateBody) => {
  const shippingMethod = await getShippingMethodById(shippingMethodId);
  if (!shippingMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShippingMethod not found');
  }

  Object.assign(shippingMethod, updateBody);
  await shippingMethod.save();
  return shippingMethod;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<ShippingMethod>}
 */
const deleteShippingMethodById = async (shippingMethodId) => {
  const shippingMethod = await getShippingMethodById(shippingMethodId);
  if (!shippingMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShippingMethod not found');
  }
  await shippingMethod.destroy();
  return shippingMethod;
};

module.exports = {
  createShippingMethod,
  queryShippingMethods,
  getShippingMethodById,
  updateShippingMethodById,
  deleteShippingMethodById,
};
