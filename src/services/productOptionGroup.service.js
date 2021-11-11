const httpStatus = require('http-status');
// const sequelize = require('../config/sequelize');
const { sequelize, Product, ProductOptionGroup, ProductOption } = require('../models');
const productService = require('./product.service');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/**
 * Create a category. Noted that the category should have been validated by Joi.
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProductOptionGroup = async (productId, optionGroupBody) => {
  if (await ProductOptionGroup.isSlugTaken(optionGroupBody.slug, productId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const product = await productService.getProductById(productId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const optionGroup = await ProductOptionGroup.create(
    {
      ...optionGroupBody,
      productId,
    },
    {
      include: [{ model: ProductOption, as: 'options' }],
    }
  );

  return optionGroup;

  // // ============= Manual implementation of 'Creating with Association' ============ DEPRECATED
  // // Extract the `options` ProductOption array from body
  // const { options, ...restOfBody } = optionGroupBody;

  // // Declare new transaction
  // const t = await sequelize.transaction();

  // let optionGroupInstance;
  // let optionGroupId;

  // try {
  //   // create the ProductOptionGroup instance
  //   optionGroupInstance = await ProductOptionGroup.create({ ...restOfBody, productId }, { transaction: t });
  //   // Extract its generated id
  //   optionGroupId = optionGroupInstance.get('id');

  //   // For each option in the `options` array, create a new ProductOption instance with the FK referring to
  //   // the `optionGroupId`

  //   // forEach and awaits DOES NOT WORK
  //   // See: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
  //   // options.forEach(async (option) => {
  //   //   await ProductOption.create({ ...option, optionGroupId }, { transaction: t });
  //   // });

  //   // https://stackoverflow.com/questions/61369310/sequelize-transactions-inside-foreach-issue
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const option of options) {
  //     // eslint-disable-next-line no-await-in-loop
  //     await ProductOption.create({ ...option, optionGroupId }, { transaction: t });
  //   }

  //   await t.commit();
  // } catch (error) {
  //   await t.rollback();
  //   throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error: ${error}. Query: ${error.sql}. Transaction rolled back.`);
  // }
  // // ====================================================================

  // SHITTY EAGER LOADING IMPLEMENTATION
  // const optionInstances = await ProductOption.findAll({ where: { optionGroupId } });
  // optionGroupInstance.dataValues.options = optionInstances;
  // // console.log(optionGroupInstance);

  // return optionGroupInstance;

  // Eager load the newly created ProductOptionGroup using the optionGroupId
  // console.log('---->', JSON.stringify(await ProductOption.findAll({ where: { optionGroupId } }), null, 4));
  // console.log('----> !!!', await optionGroupInstance.getOption());

  // return ProductOptionGroup.findOne({ where: { id: optionGroupId }, include: { model: ProductOption, as: 'options' } });

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
const queryProductOptionGroups = async (filter, options, productId) => {
  const filterWithProductId = { ...filter, productId };
  // Also eager loads ProductOption as 'options'
  // https://sequelize.org/master/class/lib/model.js~Model.html#static-method-findAll
  const optionGroups = await paginate(ProductOptionGroup, filterWithProductId, options, [
    { model: ProductOption, as: 'options' },
  ]);
  return optionGroups;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductOptionGroupById = async (id, productId) => {
  return ProductOptionGroup.findOne({ where: { id, productId }, include: { model: ProductOption, as: 'options' } });
};

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<Product>}
 */
const getProductOptionGroupBySlug = async (slug, productId) => {
  return ProductOptionGroup.findOne({ where: { slug, productId }, include: { model: ProductOption, as: 'options' } });
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
const updateProductOptionGroupById = async (productId, optionGroupId, updateBody) => {
  // const optionGroup = await ProductOptionGroup.findOne({ where: { id: optionGroupId, productId } });
  const optionGroup = await getProductOptionGroupById(optionGroupId, productId);
  if (!optionGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Option Group not found for this Product');
  }
  if (updateBody.slug && (await Product.isSlugTaken(updateBody.slug, productId, optionGroupId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const { options, ...restOfBody } = updateBody;

  const t = await sequelize.transaction();
  try {
    // If options[] is provided with request, meaning the old ProductOption list must be deleted to be
    // replace with the new list
    if (options) {
      // Delete old ProductOptions that belongs to this optionGroupId
      await ProductOption.destroy({ where: { optionGroupId } });

      // Create new options (provided by user in parallel)
      await Promise.all(options.map(async (option) => ProductOption.create({ ...option, optionGroupId })));
    }

    // Assign modified fields to the existing instance
    Object.assign(optionGroup, restOfBody);
    await optionGroup.save();
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
  //   optionGroup.set('categoryId', parentSqlId);
  // }

  // Object.assign(optionGroup, restOfBody);
  // await optionGroup.save();
  return optionGroup.reload();
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Product>}
 */
const deleteProductOptionGroup = async (productId, optionGroupId) => {
  const optionGroup = await getProductOptionGroupById(optionGroupId, productId);
  if (!optionGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Option Group not found for this Product');
  }

  const t = await sequelize.transaction();
  try {
    await ProductOption.destroy({ where: { optionGroupId } });
    await optionGroup.destroy();
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error: ${error}. Transaction rolled back`);
  }

  await optionGroup.destroy();
  return optionGroup;
};

module.exports = {
  createProductOptionGroup,
  queryProductOptionGroups,
  getProductOptionGroupById,
  getProductOptionGroupBySlug,
  // getCategoryByWebId,
  updateProductOptionGroupById,
  deleteProductOptionGroup,
};
