const { Model, Op, QueryTypes } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Cart
   */
  class Cart extends Model {
    async getItemsCount() {
      const lineItems = await this.getCartItems();

      const totalItemsCount = lineItems
        .map((lineItem) => Number.parseInt(lineItem.get('quantity'), 10))
        .reduce((accumulated, currentValue) => accumulated + currentValue, 0);

      return totalItemsCount;
    }

    async getUniqueItemsCount() {
      // return this.countCartItems();
      const cartId = this.get('id');

      // See: https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-method-query
      const [results, metadata] = await sequelize.query(
        'SELECT COUNT(*) FROM (SELECT DISTINCT "productId" FROM "CartItems" WHERE "cartId" = :id AND "deletedAt" IS NULL) AS distinct_products',
        {
          replacements: { id: cartId },
          type: QueryTypes.SELECT,
        }
      );

      return Number.parseInt(results.count, 10);
    }

    async getSubtotal() {
      const lineItems = await this.getCartItems();

      const subtotal = lineItems
        .map((lineItem) => Number.parseFloat(lineItem.get('lineTotal')))
        .reduce((accumulated, currentValue) => accumulated + currentValue, 0);

      return subtotal;
    }
  }

  Cart.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      totalItems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalUniqueItems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      cartCaptured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: { name: 'userId' },
      as: 'user',
    });

    Cart.hasMany(models.CartItem, {
      foreignKey: { name: 'cartId', allowNull: false },
      as: 'cartItems',
    });
  };

  return Cart;
};
