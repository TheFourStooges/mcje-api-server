const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ProductAttribute
   */
  class ProductAttribute extends Model {
    static async isSlugTaken(slug, excludeAttributeId) {
      let attribute;
      if (excludeAttributeId) {
        attribute = await this.findOne({
          where: {
            slug,
            [Op.not]: [{ id: excludeAttributeId }],
          },
        });
      } else {
        attribute = await this.findOne({
          where: {
            slug,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!attribute;
    }
  }

  ProductAttribute.init(
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

  ProductAttribute.associate = (models) => {
    ProductAttribute.hasMany(models.ProductAttributeOption, {
      foreignKey: {
        name: 'attributeId',
        allowNull: false,
      },
      as: 'attributeOptions',
    });
  };

  return ProductAttribute;
};
