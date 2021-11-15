const { Model } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef ItemType
   */
  class ItemType extends Model {}

  ItemType.init(
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

  ItemType.associate = (models) => {
    ItemType.hasMany(models.Product, {
      foreignKey: {
        name: 'itemTypeId',
        as: 'products',
      },
    });
  };

  return ItemType;
};
