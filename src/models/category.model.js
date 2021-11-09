const { DataTypes, Model } = require('sequelize');
// const slug = require('slug');
const sequelize = require('../config/sequelize');

/**
 * @typedef Category
 */
class Category extends Model {}

Category.init(
  {
    webId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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
        is: /^[^\s!?/.*#|]+$/i,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
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

Category.hasMany(Category, {
  foreignKey: 'parentId',
});
Category.belongsTo(Category, {
  foreignKey: 'parentId',
});

module.exports = Category;
