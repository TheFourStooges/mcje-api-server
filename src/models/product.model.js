const { DataTypes, Model, Op } = require('sequelize');
// const slug = require('slug');
const sequelize = require('../config/sequelize');
const regexPatterns = require('../config/regexPatterns');
const Category = require('./category.model');
const ProductVariant = require('./productVariant.model');

/**
 * @typedef Product
 */
class Product extends Model {
  static async isSlugTaken(slug, excludeProductId) {
    let product;
    if (excludeProductId) {
      product = await this.findOne({
        where: {
          slug,
          [Op.not]: [{ id: excludeProductId }],
        },
      });
    } else {
      product = await this.findOne({
        where: {
          slug,
        },
      });
    }

    // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
    return !!product;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: regexPatterns.slug,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    timestamps: true,
    paranoid: true,
  }
);

Product.belongsTo(Category, {
  foreignKey: {
    name: 'categoryId',
  },
});
Category.hasMany(Product, {
  foreignKey: {
    name: 'categoryId',
  },
});

// Product.hasMany(ProductVariant);
// ProductVariant.belongsTo(Product);

module.exports = Product;
