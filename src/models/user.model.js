// const validator = require('validator');
const bcrypt = require('bcryptjs');
const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/sequelize');
// const { sequelizeToJSON, sequelizePaginate } = require('./plugins');
const { roles } = require('../config/roles');

/**
 * @typedef User
 */
class User extends Model {
  static async isEmailTaken(email, excludeUserId) {
    const user = await this.findOne({
      where: {
        email,
        id: {
          [Op.not]: excludeUserId,
        },
      },
    });

    // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
    return !!user;
  }

  /**
   * Used in login service, checks password match
   * @param {string} password unhashed password from request
   * @returns true or false whether the password matches the hashed password in DB
   */
  async isPasswordMatch(password) {
    const user = this;
    return bcrypt.compare(password, user.password);
  }

  // @override
  /**
   * Override of default toJSON(), does not include the password field
   * @returns {Object} with password removed
   */
  toJSON() {
    const values = { ...this.get() };

    delete values.password;
    return values;
  }
}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        // Trim string prior to SQL INSERT
        this.setDataValue('name', String.prototype.trim.call(value));
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        // Trim string and transform to lowercase
        this.setDataValue('email', String.prototype.toLowerCase.call(value));
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 128],
        isValidPassword(value) {
          if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            throw new Error('Password must contain at least one letter and one number');
          }
        },
      },
    },
    role: {
      type: DataTypes.ENUM,
      values: roles,
      defaultValue: 'user',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    // Other options
    sequelize,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    timestamps: true,
    paranoid: true,
  }
);

User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const hashedPassword = await bcrypt.hash(user.password, 8);
    user.setDataValue('password', hashedPassword);
  }
});

module.exports = User;
