const httpStatus = require('http-status');
// const logger = require('../config/logger');
const { QueryTypes } = require('sequelize');
const { Product, Category, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const flattenObject = require('../utils/flattenObject');
// const hasDuplicates = require('../utils/hasDuplicates');

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
  const { categoryId, ...restOfBody } = productBody;

  const t = await sequelize.transaction();
  let product;
  try {
    // code here!
    // Create the new Product instance without categoryId
    // Product must be created here for the ID to be generated
    product = await Product.create(restOfBody);

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

  // const productId = product.get('id');
  return product;
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
  const users = await paginate(Product, filter, options);
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
  const { properties, categoryId, ...restOfBody } = updateBody;

  const t = await sequelize.transaction();
  try {
    // If categoryId object exists
    if (categoryId) {
      // Find the parent Category instance...
      const parentCategory = await Category.findOne({ where: categoryId });
      // And extracts its PRIMARY KEY...
      const parentSqlId = parentCategory.get('id');
      // Then sets it as the new Product categoryId.
      await product.update({ categoryId: parentSqlId });
    }

    // If properties object exists
    // merge old object and new object. Default behavior replaces it
    if (properties) {
      // // Get existing `properties` object
      // const existing = product.get('properties');
      // console.log(JSON.stringify(existing, null, 4));
      // Object.assign(existing.product, properties.product);
      // Object.assign(existing.material, properties.material);
      // console.log(JSON.stringify(existing, null, 4));
      // product.set('properties', existing);

      const flattenedProperties = flattenObject(properties);

      Promise.all(
        Object.entries(flattenedProperties).map(async ([key, value]) => {
          const tokens = key.split('.');

          // resulting string will be of format '"token",[...]"token",'
          let pathInner = '';

          // NO FOR EACH IN TRANSACTION!!!!!
          // tokens.forEach((token) => pathInner.concat(`"${token},"`));
          // eslint-disable-next-line no-restricted-syntax
          for (const i in tokens) {
            if (tokens[i]) {
              pathInner += `"${tokens[i]}",`;
            }
          }

          const path = `{${pathInner.substring(0, pathInner.length - 1)}}`;

          // therefore we need to trim the last character ',' before passing into raw query
          // https://stackoverflow.com/questions/24257726/could-not-determine-polymorphic-type-because-input-has-type-unknown
          await sequelize.query(
            'UPDATE "Products" SET properties = jsonb_set(properties, :path, to_jsonb(:value::text)) WHERE id = :productId',
            {
              replacements: {
                path,
                value: value.toString(),
                productId,
              },
              type: QueryTypes.UPDATE,
            }
          );
        })
      );

      // Object.entries(flattenedProperties).forEach(([key, value]) => {
      //   console.log(key, value);
      //   await product.update({ key: value });
      // });
    }

    Object.assign(product, restOfBody);

    await product.save();

    // =====
    // await product.update(restOfBody);

    // if (categoryId) {
    //   // Find the parent Category instance...
    //   const parentCategory = await Category.findOne({ where: categoryId });
    //   // And extracts its PRIMARY KEY...
    //   const parentSqlId = parentCategory.get('id');
    //   // Then sets it as the new Product categoryId.
    //   // product.set('categoryId', parentSqlId);
    //   await product.update({ categoryId: parentSqlId });
    // }

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
