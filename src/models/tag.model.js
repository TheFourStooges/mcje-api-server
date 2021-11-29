const { Model } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Tag
   */
  class Tag extends Model {}

  Tag.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: regexPatterns.slug,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Product, {
      through: 'Tags_Products',
      foreignKey: {
        name: 'tagId',
      },
      otherKey: {
        name: 'productId',
      },
      as: 'products',
    });
  };

  return Tag;
};
