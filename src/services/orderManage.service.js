const httpStatus = require('http-status');
const { QueryTypes } = require('sequelize');
const { Order, OrderPayment, OrderFulfillment, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const flattenObject = require('../utils/flattenObject');
const paginate = require('../utils/paginate');

/**
 * Query for orders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryOrders = async (filter, options) => {
  const users = await paginate(Order, filter, options);
  return users;
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrderById = async (id) => {
  // return Order.findByPk(id);
  // , include: [{ model: Product, as: 'products' }]
  return Order.findOne({
    where: { id },
    include: [
      { model: OrderPayment, as: 'orderPayments' },
      { model: OrderFulfillment, as: 'orderFulfillments' },
    ],
  });
};

/**
 * Get order by slug
 * @param {string} slug
 * @returns {Promise<Order>}
 */
const getOrderByReference = async (referenceNumber) => {
  return Order.findOne({
    where: { referenceNumber },
    include: [
      { model: OrderPayment, as: 'orderPayments' },
      { model: OrderFulfillment, as: 'orderFulfillments' },
    ],
  });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const { customer, shippingAddress, ...restOfBody } = updateBody;
  // if (parentId) {
  //   const parentCategory = await Order.findOne({ where: parentId });
  //   const parentSqlId = parentCategory.get('id');
  //   order.set('parentId', parentSqlId);
  // }

  const t = await sequelize.transaction();
  try {
    if (customer) {
      const flattened = flattenObject(customer);
      await Promise.all(
        Object.entries(flattened).map(async ([key, value]) => {
          // For each properties flattened

          // Split the key into tokens
          // I.e.: properties.material.materialType => properties, material, materialType
          const tokens = key.split('.');

          // Initialize empty string
          // resulting string will be of format '"token",[...]"token",'
          let pathInner = '';

          // NO FOR EACH IN TRANSACTION!!!!!
          // tokens.forEach((token) => pathInner.concat(`"${token},"`));
          // Generate valid PostgreSQL JSONB path
          // I.e. properties.material.materialType --> '"properties","material","materialType",'
          // eslint-disable-next-line no-restricted-syntax
          for (const i in tokens) {
            if (tokens[i]) {
              pathInner += `"${tokens[i]}",`;
            }
          }

          // Remove the trailing comma seperator before passing into raw SQL query
          const path = `{${pathInner.substring(0, pathInner.length - 1)}}`;

          // https://stackoverflow.com/questions/24257726/could-not-determine-polymorphic-type-because-input-has-type-unknown
          await sequelize.query(
            'UPDATE "Orders" SET "customer" = jsonb_set("customer", :path, to_jsonb(:value::text)) WHERE "id" = :orderId',
            {
              replacements: {
                path,
                value: value.toString(),
                orderId,
              },
              type: QueryTypes.UPDATE,
            }
          );
        })
      );
    }

    if (shippingAddress) {
      const flattened = flattenObject(shippingAddress);
      await Promise.all(
        Object.entries(flattened).map(async ([key, value]) => {
          // For each properties flattened

          // Split the key into tokens
          // I.e.: properties.material.materialType => properties, material, materialType
          const tokens = key.split('.');

          // Initialize empty string
          // resulting string will be of format '"token",[...]"token",'
          let pathInner = '';

          // NO FOR EACH IN TRANSACTION!!!!!
          // tokens.forEach((token) => pathInner.concat(`"${token},"`));
          // Generate valid PostgreSQL JSONB path
          // I.e. properties.material.materialType --> '"properties","material","materialType",'
          // eslint-disable-next-line no-restricted-syntax
          for (const i in tokens) {
            if (tokens[i]) {
              pathInner += `"${tokens[i]}",`;
            }
          }

          // Remove the trailing comma seperator before passing into raw SQL query
          const path = `{${pathInner.substring(0, pathInner.length - 1)}}`;

          // https://stackoverflow.com/questions/24257726/could-not-determine-polymorphic-type-because-input-has-type-unknown
          await sequelize.query(
            'UPDATE "Orders" SET "shippingAddress" = jsonb_set("shippingAddress", :path, to_jsonb(:value::text)) WHERE "id" = :orderId',
            {
              replacements: {
                path,
                value: value.toString(),
                orderId,
              },
              type: QueryTypes.UPDATE,
            }
          );
        })
      );
    }

    Object.assign(order, restOfBody);
    await order.save();

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  await order.reload();
  return order;
};

const addOrderPayment = async (orderId, addPaymentBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const t = await sequelize.transaction();
  try {
    const payment = await OrderPayment.create({ ...addPaymentBody, orderId });

    const [result, metadata] = await sequelize.query(
      `
      SELECT
        (SELECT "totalWithTax" FROM "Orders" WHERE "id" = :orderId)
        - (SELECT COALESCE(SUM("amount"), 0) FROM "OrderPayments" WHERE "orderId" = :orderId) AS "remainingBalance"
      `,
      {
        replacements: {
          orderId,
        },
        type: QueryTypes.SELECT,
        transaction: t,
      }
    );

    const { remainingBalance } = result;

    if (remainingBalance <= 0) {
      await order.update({ paymentStatus: 'paid-in-full' }, { transaction: t });
    } else {
      await order.update({ paymentStatus: 'paid-not-in-full' }, { transaction: t });
    }

    await t.commit();
    return payment;
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
  // const orderTotalWithTax = order.get('totalWithTax');

  // const [result, metadata] = await sequelize.query(
  //   'SELECT SUM("amount") AS "payments_sum" FROM "OrderPayments" WHERE "orderId" = :orderId',
  //   {
  //     replacements: {
  //       orderId,
  //     },
  //     type: QueryTypes.SELECT,
  //   }
  // );
  // const paymentsSum = result.payments_sum;

  // const orderBalance = orderTotalWithTax - paymentsSum;
};

module.exports = {
  queryOrders,
  getOrderById,
  getOrderByReference,
  updateOrderById,
  addOrderPayment,
};
