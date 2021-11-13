const httpStatus = require('http-status');
const { Product, Category, sequelize, ProductAttributeOption, ProductAttribute } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const hasDuplicates = require('../utils/hasDuplicates');

/**
 * Create a category. Noted that the category should have been validated by Joi.
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {
  if (await Product.isSlugTaken(productBody.slug)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  // return Product.create(productBody);

  // Extract the categoryId from Body for pre-processing
  // Extract attributes key-value map as well
  const { attributes, categoryId, ...restOfBody } = productBody;

  const t = await sequelize.transaction();
  let product;
  try {
    // code here!
    // Create the new Product instance without categoryId
    // Product must be created here for the ID to be generated
    product = await Product.create(restOfBody);

    // If attributes key-value map exists
    // attributeId: attributeOptionId
    if (attributes) {
      // Extract keys and values seperately to check for duplicates
      const attributeKeys = Object.keys(attributes);
      const attributeValues = Object.values(attributes);
      if (hasDuplicates(attributeKeys)) {
        throw new Error('Exists duplicate keys in the `attributes` map');
      }
      if (hasDuplicates(attributeValues)) {
        throw new Error('Exists duplicate values in the `attributes` map');
      }

      const attributeEntries = Object.entries(attributes);
      await Promise.all(
        attributeEntries.map(async (entry) => {
          const attributeOption = await ProductAttributeOption.findOne({ where: { id: entry[1], attributeId: entry[0] } });
          if (!attributeOption) {
            throw new Error(`Attribute key-value pair { ${entry[0]}: ${entry[1]} } does not exist.`);
          }

          await product.addAttributeOption(attributeOption);
        })
      );
    }

    // If categoryId object exists
    if (categoryId) {
      // Find the parent Category instance...
      const parentCategory = await Category.findOne({ where: categoryId });
      // And extracts its PRIMARY KEY...
      const parentSqlId = parentCategory.get('id');
      // Then sets it as the new Product categoryId.
      product.set('categoryId', parentSqlId);
    }

    // Save and commit transaction to database
    product.save();
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `${error}. Transaction rolled back`);
  }

  const productId = product.get('id');
  return Product.findOne({ where: { id: productId }, include: [{ model: ProductAttributeOption, as: 'attributeOptions' }] });
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
const queryProducts = async (filter, options) => {
  const users = await paginate(Product, filter, options, [
    {
      model: ProductAttributeOption,
      as: 'attributeOptions',
      include: [{ model: ProductAttribute, as: 'attributeParent' }],
    },
  ]);
  return users;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  // return Product.findByPk(id);
  return Product.findOne({
    where: { id },
    include: [
      {
        model: ProductAttributeOption,
        as: 'attributeOptions',
        include: [{ model: ProductAttribute, as: 'attributeParent' }],
      },
    ],
  });
};

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<Product>}
 */
const getProductBySlug = async (slug) => {
  return Product.findOne({
    where: { slug },
    include: [
      {
        model: ProductAttributeOption,
        as: 'attributeOptions',
        include: [{ model: ProductAttribute, as: 'attributeParent' }],
      },
    ],
  });
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
  const { attributes, categoryId, ...restOfBody } = updateBody;

  const t = await sequelize.transaction();
  try {
    // If attributes key-value map exists
    // attributeId: attributeOptionId
    if (attributes) {
      // Extract keys and values seperately to check for duplicates
      const attributeKeys = Object.keys(attributes);
      const attributeValues = Object.values(attributes);
      if (hasDuplicates(attributeKeys)) {
        throw new Error('Exists duplicate keys in the `attributes` map');
      }
      if (hasDuplicates(attributeValues)) {
        throw new Error('Exists duplicate values in the `attributes` map');
      }

      // Removes old associations
      const oldAttributes = await product.getAttributeOptions();
      await product.removeAttributeOptions(oldAttributes);

      const attributeEntries = Object.entries(attributes);
      await Promise.all(
        attributeEntries.map(async (entry) => {
          const attributeOption = await ProductAttributeOption.findOne({ where: { id: entry[1], attributeId: entry[0] } });
          if (!attributeOption) {
            throw new Error(`Attribute key-value pair { ${entry[0]}: ${entry[1]} } does not exist.`);
          }

          await product.addAttributeOption(attributeOption);
        })
      );
    }

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
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return product.reload();
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
  createProduct,
  queryProducts,
  getProductById,
  getProductBySlug,
  // getCategoryByWebId,
  updateProductById,
  deleteProductById,
};
