const { Model, QueryTypes } = require('sequelize');
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
      const [results] = await sequelize.query(
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
      referenceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customer: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          schema: jsonbValidator({
            type: 'object',
            required: true,
            allowEmpty: false,
            properties: {
              name: { type: 'string', allowEmpty: false },
              email: { type: 'string', format: 'email' },
              ipAddress: { type: 'string', format: ['ip-address', 'ipv6'] },
              country: { type: 'string' },
              region: { type: 'string' },
            },
          }),
        },
      },
      shippingAddress: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          schema: jsonbValidator({
            type: 'object',
            required: true,
            allowEmpty: false,
            properties: {
              name: { type: 'string', allowEmpty: false },
              phone: { type: 'string', allowEmpty: false, minLength: 10, maxLength: 10, pattern: regexPatterns.phoneNumber },
              streetLine1: { type: 'string', allowEmpty: false, maxLength: 100 },
              ward: { type: 'string', allowEmpty: false, maxLength: 100 },
              district: { type: 'string', allowEmpty: false, maxLength: 100 },
              city: { type: 'string', allowEmpty: false, maxLength: 100 },
              postalCode: { type: 'string', allowEmpty: false, maxLength: 6, pattern: regexPatterns.postalCode },
              country: { type: 'string', allowEmpty: false, maxLength: 100 },
            },
          }),
        },
      },
      fulfillmentStatus: {
        type: DataTypes.ENUM,
        values: ['await-confirmation', 'shipping', 'fulfilled'],
        allowNull: false,
        defaultValue: 'await-confirmation',
      },
      paymentStatus: {
        type: DataTypes.ENUM,
        values: ['not-paid', 'paid-not-in-full', 'paid-in-full'],
        allowNull: false,
        defaultValue: 'not-paid',
      },
      status: {
        type: DataTypes.ENUM,
        values: ['created', 'completed', 'refunded'],
        allowNull: false,
        defaultValue: 'created',
      },
      totalItems: {
        // Use Cart.getStatistics()
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalUniqueItems: {
        // Use Cart.getStatistics()
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        // Use Cart.getStatistics()
        // Total worth of all line items
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      shipping: {
        // Shipping Cost, calculate in service
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax: {
        // Tax, calculate in service
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        // Subtotal + Shipping
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totalWithTax: {
        // Total + Tax
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
    // Removed association with User, Cart, ShippingMethod in favor
    // of virtual fields
    // Order.belongsTo(models.User, {
    //   foreignKey: { name: 'userId' },
    //   as: 'user',
    // });

    // Order.belongsTo(models.Cart, {
    //   foreignKey: { name: 'cartId' },
    //   as: 'cart',
    // });

    // Order.belongsTo(models.ShippingMethod, {
    //   foreignKey: { name: 'shippingMethodId' },
    //   as: 'shippingMethod',
    // });

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
