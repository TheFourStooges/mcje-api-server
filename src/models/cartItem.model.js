const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef CartItem
   */
  class CartItem extends Model {}

  CartItem.init(
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
      },
      price: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      discountPerItem: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      lineTotal: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
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

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, {
      foreignKey: { name: 'cartId' },
      as: 'cart',
    });

    CartItem.belongsTo(models.Product, {
      foreignKey: { name: 'productId' },
      as: 'product',
    });
  };

  return CartItem;
};
