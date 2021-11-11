const { Model, Op } = require('sequelize');
// const slug = require('slug');
// const sequelize = require('../config/sequelize');
// const ProductOption = require('./productOption.model');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ProductOptionGroup
   */
  class ProductOptionGroup extends Model {
    /**
     * Returns true if there exists same slug in the same productId!
     * @param {*} slug - slug string
     * @param {*} productId - productId as namespace to check against
     * @param {*} excludeOptionGroupId - exclude this id
     * @returns {Boolean} true if exists same slug in the same productId
     */
    static async isSlugTaken(slug, productId, excludeOptionGroupId) {
      let optionGroup;
      if (excludeOptionGroupId) {
        optionGroup = await this.findOne({
          where: {
            slug,
            productId,
            [Op.not]: [{ id: excludeOptionGroupId }],
          },
        });
      } else {
        optionGroup = await this.findOne({
          where: {
            slug,
            productId,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!optionGroup;
    }
  }

  ProductOptionGroup.init(
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
        unique: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  ProductOptionGroup.associate = (models) => {
    ProductOptionGroup.belongsTo(models.Product, {
      foreignKey: {
        name: 'productId',
      },
      as: 'product',
    });

    ProductOptionGroup.hasMany(models.ProductOption, {
      foreignKey: {
        name: 'optionGroupId',
        allowNull: false,
      },
      as: 'options',
    });
  };

  return ProductOptionGroup;
};
