const { DataTypes, Model } = require('sequelize');
// const slug = require('slug');
const sequelize = require('../config/sequelize');

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

module.exports = ProductOption;
