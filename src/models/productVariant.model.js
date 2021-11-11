const { Model } = require('sequelize');
// const slug = require('slug');
// const sequelize = require('../config/sequelize');
// const ProductOption = require('./productOption.model');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ProductVariant
   */
  class ProductVariant extends Model {}

  ProductVariant.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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

  ProductVariant.associate = (models) => {
    ProductVariant.belongsToMany(models.ProductOption, { through: 'ProductVariant_ProductOption' });
  };

  return ProductVariant;
};
