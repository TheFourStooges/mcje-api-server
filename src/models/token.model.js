const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const { tokenTypes } = require('../config/tokens');
const User = require('./user.model');

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

User.hasMany(Token, {
  foreignKey: 'user',
});
Token.belongsTo(User);

module.exports = Token;
