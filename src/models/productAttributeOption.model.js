const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ProductAttributeOption
   */
  class ProductAttributeOption extends Model {
    /**
     * Returns true if there exists same slug in the same attributeId!
     * @param {*} slug - slug string
     * @param {*} attributeId - attributeId as namespace to check against
     * @param {*} excludeAttributeOptionId - exclude this id
     * @returns {Boolean} true if exists same slug in the same attributeId
     */
    static async isSlugTaken(slug, attributeId, excludeAttributeOptionId) {
      let optionGroup;
      if (excludeAttributeOptionId) {
        optionGroup = await this.findOne({
          where: {
            slug,
            attributeId,
            [Op.not]: [{ id: excludeAttributeOptionId }],
          },
        });
      } else {
        optionGroup = await this.findOne({
          where: {
            slug,
            attributeId,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!optionGroup;
    }
  }

  ProductAttributeOption.init(
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
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  ProductAttributeOption.associate = (models) => {
    ProductAttributeOption.belongsTo(models.ProductAttribute, {
      foreignKey: {
        name: 'attributeId',
        allowNull: false,
      },
      as: 'attributeParent',
    });

    ProductAttributeOption.belongsToMany(models.Product, { through: 'Product_ProductAttributeOption', as: 'products' });
  };

  return ProductAttributeOption;
};
