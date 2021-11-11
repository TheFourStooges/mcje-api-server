const httpStatus = require('http-status');
// const sequelize = require('../config/sequelize');
const { sequelize, Product, ProductOptionGroup, ProductOption } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/**
 * Create a category. Noted that the category should have been validated by Joi.
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProductOptionGroup = async (productId, optionGroupBody) => {
  // if (await Product.isSlugTaken(productBody.slug)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  // }

  // Extract the `options` ProductOption array from body
  const { options, ...restOfBody } = optionGroupBody;

  // Declare new transaction
  const t = await sequelize.transaction();

  let optionGroupId;

  try {
    // create the ProductOptionGroup instance
    const optionGroupInstance = await ProductOptionGroup.create({ ...restOfBody, productId }, { transaction: t });
    // Extract its generated id
    optionGroupId = optionGroupInstance.get('id');

    // For each option in the `options` array, create a new ProductOption instance with the FK referring to
    // the `optionGroupId`

    // forEach and awaits DOES NOT WORK
    // See: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    // options.forEach(async (option) => {
    //   await ProductOption.create({ ...option, optionGroupId }, { transaction: t });
    // });

    // https://stackoverflow.com/questions/61369310/sequelize-transactions-inside-foreach-issue
    // eslint-disable-next-line no-restricted-syntax
    for (const option of options) {
      // eslint-disable-next-line no-await-in-loop
      await ProductOption.create({ ...option, optionGroupId }, { transaction: t });
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error: ${error}. Query: ${error.sql}. Transaction rolled back.`);
  }

  // Eager load the newly created ProductOptionGroup using the optionGroupId
  console.log('---->', JSON.stringify(await ProductOption.findAll({ where: { optionGroupId } }), null, 4));

  return ProductOptionGroup.findOne({ where: { id: optionGroupId } }, { include: { model: ProductOption, as: 'options' } });

  // return Product.create(productBody);

  // // Extract the categoryId from Body for pre-processing
  // const { categoryId, ...restOfBody } = productBody;

  // // Build the new Product instance without categoryId
  // const product = Product.build(restOfBody);

  // // If categoryId object exists
  // if (categoryId) {
  //   // Find the parent Category instance...
  //   const parentCategory = await Category.findOne({ where: categoryId });
  //   // And extracts its PRIMARY KEY...
  //   const parentSqlId = parentCategory.get('id');
  //   // Then sets it as the new Product categoryId.
  //   product.set('categoryId', parentSqlId);
  // }

  // // Save and commit to database
  // return product.save();
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
const queryProductOptionGroups = async (filter, options) => {
  const users = await paginate(ProductOptionGroup, filter, options);
  return users;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  return Product.findByPk(id);
};

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<Product>}
 */
const getProductBySlug = async (slug) => {
  return Product.findOne({ where: { slug } });
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
const updateProductById = async (productId, updateBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (updateBody.slug && (await Product.isSlugTaken(updateBody.slug, productId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  // Extract the categoryId from Body for pre-processing
  const { categoryId, ...restOfBody } = updateBody;

  // If categoryId object exists
  if (categoryId) {
    // Find the parent Category instance...
    const parentCategory = await Category.findOne({ where: categoryId });
    // And extracts its PRIMARY KEY...
    const parentSqlId = parentCategory.get('id');
    // Then sets it as the new Product categoryId.
    product.set('categoryId', parentSqlId);
  }

  Object.assign(product, restOfBody);
  await product.save();
  return product;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId) => {
  const category = await getProductById(productId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await category.destroy();
  return category;
};

module.exports = {
  createProductOptionGroup,
  queryProductOptionGroups,
  getProductById,
  getProductBySlug,
  // getCategoryByWebId,
  updateProductById,
  deleteProductById,
};
