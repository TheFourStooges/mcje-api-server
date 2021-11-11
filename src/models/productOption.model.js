const { Model } = require('sequelize');
// const slug = require('slug');
// const sequelize = require('../config/sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ProductOption
   */
  class ProductOption extends Model {}

  ProductOption.init(
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
      priceOffset: {
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

  ProductOption.associate = (models) => {
    ProductOption.belongsTo(models.ProductOptionGroup, {
      foreignKey: {
        name: 'optionGroupId',
        allowNull: false,
      },
    });

    ProductOption.belongsToMany(models.ProductVariant, { through: 'ProductVariant_ProductOption' });
  };

  return ProductOption;
};
