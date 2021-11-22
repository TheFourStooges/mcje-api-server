const { object } = require('joi');
const { Model, Op, QueryTypes } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef CheckoutToken
   */
  class CheckoutToken extends Model {}

  CheckoutToken.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      totalItems: {
        // Use Cart.getStatistics()
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalUniqueItems: {
        // Use Cart.getStatistics()
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        // Use Cart.getStatistics()
        // Total worth of all line items
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      shipping: {
        // Shipping Cost, calculate in service
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax: {
        // Tax, calculate in service
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        // Subtotal + Shipping
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totalWithTax: {
        // Total + Tax
        type: DataTypes.DECIMAL(20, 2),
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

  CheckoutToken.associate = (models) => {
    CheckoutToken.belongsTo(models.User, {
      foreignKey: { name: 'userId' },
      as: 'user',
    });

    CheckoutToken.belongsTo(models.Cart, {
      foreignKey: { name: 'cartId' },
      as: 'cart',
    });

    CheckoutToken.belongsTo(models.ShippingMethod, {
      foreignKey: { name: 'shippingMethodId' },
      as: 'shippingMethod',
      constraints: false,
    });
  };

  return CheckoutToken;
};
