const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ProductAttributeOption
   */
  class ProductAttributeOption extends Model {
    static async isSlugTaken(slug, excludeAttrOptionId) {
      let attrOption;
      if (excludeAttrOptionId) {
        attrOption = await this.findOne({
          where: {
            slug,
            [Op.not]: [{ id: excludeAttrOptionId }],
          },
        });
      } else {
        attrOption = await this.findOne({
          where: {
            slug,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!attrOption;
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
  };

  return ProductAttributeOption;
};
