const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef OrderItem
   */
  class OrderItem extends Model {}

  OrderItem.init(
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
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: { name: 'orderId', allowNull: false },
      as: 'order',
    });

    OrderItem.belongsTo(models.Product, {
      foreignKey: { name: 'productId' },
      as: 'product',
    });
  };

  return OrderItem;
};
