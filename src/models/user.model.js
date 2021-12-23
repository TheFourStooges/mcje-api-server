// const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Model, Op } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
// const sequelize = require('../config/sequelize');
// const { sequelizeToJSON, sequelizePaginate } = require('./plugins');
const { roles } = require('../config/roles');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef User
   */
  class User extends Model {
    static async isEmailTaken(email, excludeUserId) {
      let user;
      if (excludeUserId) {
        user = await this.findOne({
          where: {
            email,
            [Op.not]: [{ id: excludeUserId }],
          },
        });
      } else {
        user = await this.findOne({
          where: {
            email,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!user;
    }

    /**
     * Used in login service, checks password match
     * @param {string} password unhashed password from request
     * @returns true or false whether the password matches the hashed password in DB
     */
    async isPasswordMatch(password) {
      // console.log(this.getDataValue('password'));
      // console.log(this.scope('withPassword').getDataValue('password'));
      // console.log(password, this.get('password'));
      return bcrypt.compare(password, this.get('password'));
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
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: regexPatterns.phoneNumber,
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
      // ! BUG ! Find solution ! can't get password from instance level method (isPasswordMatch())
      // defaultScope: {
      //   attributes: { exclude: ['password'] },
      // },
      // scopes: {
      //   withPassword: {
      //     attributes: {},
      //   },
      // },
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

  User.associate = (models) => {
    User.hasMany(models.Token, {
      foreignKey: 'user',
    });

    User.hasMany(models.Cart, {
      foreignKey: { name: 'userId' },
      as: 'carts',
    });

    User.hasMany(models.CheckoutToken, {
      foreignKey: { name: 'userId' },
      as: 'checkoutTokens',
    });

    User.hasMany(models.Order, {
      foreignKey: { name: 'userId' },
      as: 'orders',
    });
  };

  return User;
};
