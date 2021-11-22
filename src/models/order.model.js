const { Model, Op, QueryTypes } = require('sequelize');
const regexPatterns = require('../config/regexPatterns');
const jsonbValidator = require('../utils/jsonbValidator');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Order
   */
  class Order extends Model {
    async getItemsCount() {
      const lineItems = await this.getOrderItems();

      const totalItemsCount = lineItems
        .map((lineItem) => Number.parseInt(lineItem.get('quantity'), 10))
        .reduce((accumulated, currentValue) => accumulated + currentValue, 0);

      return totalItemsCount;
    }

    async getUniqueItemsCount() {
      // return this.countCartItems();
      const orderId = this.get('id');

      // See: https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-method-query
      const [results, metadata] = await sequelize.query(
        'SELECT COUNT(*) FROM (SELECT DISTINCT "productId" FROM "OrderItem" WHERE "orderId" = :id AND "deletedAt" IS NULL) AS distinct_products',
        {
          replacements: { id: orderId },
          type: QueryTypes.SELECT,
        }
      );

      return Number.parseInt(results.count, 10);
    }

    async getSubtotal() {
      const lineItems = await this.getOrderItems();

      const subtotal = lineItems
        .map((lineItem) => Number.parseFloat(lineItem.get('lineTotal')))
        .reduce((accumulated, currentValue) => accumulated + currentValue, 0);

      return subtotal;
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      customerReference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: { name: 'userId' },
      as: 'user',
    });

    Order.belongsTo(models.Cart, {
      foreignKey: { name: 'cartId' },
      as: 'cart',
    });

    Order.belongsTo(models.CheckoutToken, {
      foreignKey: { name: 'checkoutTokenId' },
      as: 'checkoutToken',
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: { name: 'orderId', allowNull: false },
      as: 'orderItems',
    });
  };

  return Order;
};
