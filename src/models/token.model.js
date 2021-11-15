const { Model } = require('sequelize');
// const sequelize = require('../config/sequelize');
const { tokenTypes } = require('../config/tokens');
// const User = require('./user.model');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Token
   */
  class Token extends Model {}

  Token.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL],
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      blacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Token.associate = (models) => {
    Token.belongsTo(models.User, {
      foreignKey: 'user',
    });
  };

  return Token;
};
