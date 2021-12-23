const { Model } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
// const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Asset
   */
  class Asset extends Model {}

  Asset.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      url: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      path: {
        type: DataTypes.STRING,
        validate: {
          is: regexPatterns.path,
        },
      },
      description: {
        type: DataTypes.STRING,
      },
      filename: {
        type: DataTypes.STRING,
        // validate: {
        //   is: regexPatterns.filename,
        // },
      },
      fileSize: {
        type: DataTypes.INTEGER,
      },
      imageWidth: {
        type: DataTypes.INTEGER,
      },
      imageHeight: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Asset.associate = (models) => {
    Asset.belongsTo(models.Product, {
      foreignKey: {
        name: 'productId',
      },
      as: 'product',
    });
  };

  return Asset;
};
