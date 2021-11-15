const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/**
 * Create a category. Noted that the category should have been validated by Joi.
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  if (await Category.isSlugTaken(categoryBody.slug)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  // Extract the parentId from Body for pre-processing
  const { parentId, ...restOfBody } = categoryBody;

  // console.log('---->', parentId);
  // console.log('---->', restOfBody);

  // Build the new Category instance without parentId
  const category = Category.build(restOfBody);

  // If parentId object exists
  if (parentId) {
    // Find the parent Category instance...
    const parentCategory = await Category.findOne({ where: parentId });
    // And extracts its PRIMARY KEY...
    const parentSqlId = parentCategory.get('id');
    // Then sets it as the new Category parentId.
    category.set('parentId', parentSqlId);
  }

  // Save and commit to database
  return category.save();
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
const queryCategories = async (filter, options) => {
  const users = await paginate(Category, filter, options);
  return users;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  return Category.findByPk(id);
};

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<Category>}
 */
const getCategoryBySlug = async (slug) => {
  return Category.findOne({ where: { slug } });
};

/**
 * Get category by WebID
 * @param {string} webId
 * @returns {Promise<Category>}
 */
const getCategoryByWebId = async (webId) => {
  return Category.findOne({ where: { webId } });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  if (updateBody.slug && (await Category.isSlugTaken(updateBody.slug, categoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const { parentId, ...restOfBody } = updateBody;
  if (parentId) {
    const parentCategory = await Category.findOne({ where: parentId });
    const parentSqlId = parentCategory.get('id');
    category.set('parentId', parentSqlId);
  }

  Object.assign(category, restOfBody);
  await category.save();
  return category;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  await category.destroy();
  return category;
};

module.exports = {
  createCategory,
  queryCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoryByWebId,
  updateCategoryById,
  deleteCategoryById,
};
