const { Model, Op, QueryTypes } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ShippingMethod
   */
  class ShippingMethod extends Model {}

  ShippingMethod.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
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

  ShippingMethod.associate = (models) => {
    ShippingMethod.hasMany(models.CheckoutToken, {
      foreignKey: { name: 'shippingMethodId' },
      as: 'checkoutTokens',
      constraints: false,
    });
  };

  return ShippingMethod;
};
