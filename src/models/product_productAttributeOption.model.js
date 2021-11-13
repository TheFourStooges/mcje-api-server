/* eslint-disable camelcase */
const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Product_ProductAttributeOption
   */
  class Product_ProductAttributeOption extends Model {}

  Product_ProductAttributeOption.init(
    {},
    {
      sequelize,
      timestamps: true,
    }
  );

  Product_ProductAttributeOption.associate = (models) => {
    Product_ProductAttributeOption.belongsTo(models.Product);
    Product_ProductAttributeOption.belongsTo(models.Product_ProductAttributeOption);
  };

  return Product_ProductAttributeOption;
};
