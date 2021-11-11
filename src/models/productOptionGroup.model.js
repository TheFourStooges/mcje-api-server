const { DataTypes, Model } = require('sequelize');
// const slug = require('slug');
const sequelize = require('../config/sequelize');
const ProductOption = require('./productOption.model');

/**
 * @typedef ProductOptionGroup
 */
class ProductOptionGroup extends Model {}

ProductOptionGroup.init(
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
  },
  {
    sequelize,
    timestamps: true,
    paranoid: true,
  }
);

ProductOptionGroup.hasMany(ProductOption, {
  foreignKey: {
    name: 'optionGroupId',
    allowNull: false,
    as: 'options',
  },
});
ProductOption.belongsTo(ProductOptionGroup, {
  foreignKey: {
    name: 'optionGroupId',
    allowNull: false,
  },
});

module.exports = ProductOptionGroup;
