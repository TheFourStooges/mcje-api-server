const httpStatus = require('http-status');
const { Op } = require('sequelize');
const {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderPayment,
  Product,
  CheckoutToken,
  ShippingMethod,
  sequelize,
} = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { cartService } = require('.');

const cardPayment = (cardNumber, cardCvv, cardHolder, cardExpiration, receiptTotal) => {
  const sampleCards = [
    {
      cardNumber: '4111111111111111',
      cardCvv: '123',
      cardHolder: 'BIGGUS DICCUS',
      cardExpiration: {
        month: '10',
        year: '22',
      },
      balance: 10000000000,
    },
    {
      cardNumber: '5555555555554444',
      cardCvv: '456',
      cardHolder: 'AREOLA GRANOLA',
      cardExpiration: {
        month: '10',
        year: '22',
      },
      balance: 0,
    },
  ];

  const found = sampleCards.find(
    (card) =>
      card.cardNumber === cardNumber &&
      card.cardCvv === cardCvv &&
      card.cardHolder === String.prototype.toUpperCase.apply(cardHolder) &&
      card.cardExpiration.month === cardExpiration.month &&
      card.cardExpiration.year === cardExpiration.year
  );

  if (!found) {
    return { message: 'NOT_FOUND' };
  }
  if (parseFloat(receiptTotal) > found.balance) {
    return { message: 'INSUFFICIENT_BALANCE' };
  }

  found.balance -= parseFloat(receiptTotal);
  const response = {
    message: 'SUCCESS',
    transactionType: 'BILL',
    referenceNumber: Math.random() * 1000000000000,
    total: parseFloat(receiptTotal),
  };

  return response;
};

const calculateTax = (subtotal) => {
  return Number.isNaN(subtotal) ? null : subtotal * 0.1;
};

const calculateReferenceNumber = (orderDate) => {
  const year = Date.prototype.getFullYear.apply(orderDate);
  const month = Date.prototype.getMonth.apply(orderDate);
  const day = Date.prototype.getDay.apply(orderDate);
  const hour = Date.prototype.getHours.apply(orderDate);
  const minute = Date.prototype.getMinutes.apply(orderDate);
  const second = Date.prototype.getSeconds.apply(orderDate);

  return `OR${year}${month}${day}${hour}${minute}${second}`;
};

const generateCheckoutToken = async (userId, cartId) => {
  // console.log('----> generateCheckoutToken');
  const now = new Date();

  const expiresAt = new Date(now.valueOf());
  expiresAt.setDate(expiresAt.getDate() + config.checkout.expirationDays);

  // console.log('----> generateCheckoutToken 1');
  const cart = await cartService.getCartById(cartId, userId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  // console.log('----> generateCheckoutToken 2');

  const cartItemsCount = await cart.countCartItems();
  const { totalItems, totalUniqueItems, subtotal } = await cart.getStatistics();
  const cartStatus = cart.get('status');

  if (cartStatus === 'checkout') {
    return CheckoutToken.findOne({ where: { cartId, userId } });
  }
  if (cartStatus === 'captured') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart already captured (converted to order)');
  }

  if (cartItemsCount <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Empty cart can not be proceeded to checkout!');
  }
  // let checkoutToken = await CheckoutToken.findOne({ where: { cartId, userId } });
  // if (checkoutToken) {
  //   return checkoutToken;
  // }

  // console.log('----> generateCheckoutToken 3');
  let checkoutToken;
  const t = await sequelize.transaction();
  try {
    checkoutToken = await CheckoutToken.create(
      {
        expiresAt,
        cartId,
        userId,
        totalItems,
        totalUniqueItems,
        subtotal,
        shipping: 0.0,
        tax: calculateTax(subtotal),
        total: subtotal + 0.0,
        totalWithTax: subtotal + 0.0 + calculateTax(subtotal),
      },
      {
        transaction: t,
      }
    );

    await cart.update({ status: 'checkout' }, { transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return checkoutToken;
};

const getCheckoutTokenById = async (userId, checkoutTokenId) => {
  const checkoutToken = await CheckoutToken.findOne({
    where: { id: checkoutTokenId, userId, status: { [Op.ne]: 'captured' } },
    include: [
      {
        model: Cart,
        as: 'cart',
        include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
      },
      { model: ShippingMethod, as: 'shippingMethod' },
    ],
  });

  const cart = await checkoutToken.getCart();
  const cartStatistics = await cart.getStatistics();

  return checkoutToken.update({ ...cartStatistics });
};

const updateCheckoutTokenById = async (userId, checkoutTokenId, updateBody) => {
  const checkoutToken = await getCheckoutTokenById(userId, checkoutTokenId);
  if (!checkoutToken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Checkout token not found');
  }

  const cart = await checkoutToken.getCart();
  const cartStatistics = await cart.getStatistics();
  const { totalItems, totalUniqueItems, subtotal } = cartStatistics;

  const { shippingMethodId, ...restOfBody } = updateBody;

  const t = await sequelize.transaction();
  try {
    if (shippingMethodId) {
      const shippingMethod = await ShippingMethod.findOne({ where: shippingMethodId });

      if (!shippingMethod) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Shipping Method not found');
      }

      const legitId = shippingMethod.get('id');
        checkoutToken.set('shippingMethodId', legitId);

        const shippingCost = Number.parseFloat(shippingMethod.get('price'));
        const tax = Number.parseFloat(checkoutToken.get('tax'));
        Object.assign(checkoutToken, {
          shipping: shippingCost,
          total: subtotal + shippingCost,
          totalWithTax: subtotal + tax + shippingCost,
        });
    }

    Object.assign(checkoutToken, restOfBody);
    Object.assign(checkoutToken, cartStatistics);
    await checkoutToken.save();
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return checkoutToken.reload();
};

const captureOrder = async (userId, checkoutTokenId, orderPayload) => {
  // Find and refresh status of checkout token
  const checkoutToken = await updateCheckoutTokenById(userId, checkoutTokenId, {});
  if (!checkoutToken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Checkout Token not found');
  }
  const checkoutTokenStatus = checkoutToken.get('status');
  const checkoutTokenItems = checkoutToken.get('totalItems') * checkoutToken.get('totalUniqueItems');
  if (checkoutTokenStatus !== 'created') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Checkout Token not suitable for conversion. Already converted');
  }
  if (checkoutTokenItems <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Checkout Token not suitable for conversion. Items count <= 0');
  }

  const captureTime = new Date();

  const cart = await checkoutToken.getCart();
  const cartStatistics = await cart.getStatistics();
  const { totalItems, totalUniqueItems, subtotal } = cartStatistics;
  const { customer, shippingAddress, paymentInformation } = orderPayload;

  const shippingMethod = await checkoutToken.getShippingMethod();
  if (!shippingMethod) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Checkout Token must have shippingMethodId defined before conversion to order'
    );
  }
  const shippingCost = Number.parseFloat(shippingMethod.get('price'));

  const tax = Number.parseFloat(checkoutToken.get('tax'));

  const total = subtotal + shippingCost;
  const totalWithTax = total + tax;

  // Get CartItems
  const cartItems = await cart.getCartItems();
  // Remove attributes and map to new array for order creation
  const orderItemObjects = cartItems.map((cartItem) => {
    const { id, cartId, isActive, createdAt, updatedAt, ...orderItem } = cartItem.get();

    return orderItem;
  });
  console.log('----> > ', JSON.stringify(orderItemObjects, null, 4));

  const referenceNumber = calculateReferenceNumber(captureTime);

  let order;
  const t = await sequelize.transaction();
  try {
    const { paymentMethod, cardNumber, cardCvv, cardHolder, cardExpiration } = paymentInformation;

    order = await Order.create(
      {
        referenceNumber,
        customer: { ...customer },
        shippingAddress: { ...shippingAddress },
        totalItems,
        totalUniqueItems,
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        totalWithTax,
        paymentMethod,
        orderItems: [...orderItemObjects],
        checkoutTokenId,
        userId,
      },
      {
        include: [{ model: OrderItem, as: 'orderItems' }],
        transaction: t,
      }
    );
    const orderId = order.get('id');

    if (paymentMethod === 'card') {
      const cardPayResponse = cardPayment(cardNumber, cardCvv, cardHolder, cardExpiration, totalWithTax);
      console.log('----> cardPayResponse = ', cardPayResponse);

      if (cardPayResponse.message !== 'SUCCESS') {
        throw Error(`Card Payment unsuccessful: ${cardPayResponse.message}. Order not created`);
      }
      const orderPayment = await OrderPayment.create(
        {
          transactionId: cardPayResponse.referenceNumber,
          type: 'card',
          amount: cardPayResponse.total,
          orderId,
        },
        { transaction: t }
      );
      // await orderPayment.setOrder(order);
      await order.update({ paymentStatus: 'paid-in-full' }, { transaction: t });
    }

    await checkoutToken.update({ status: 'captured' }, { transaction: t });
    await cart.update({ status: 'captured' }, { transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return order.reload();
};

module.exports = {
  generateCheckoutToken,
  getCheckoutTokenById,
  updateCheckoutTokenById,
  captureOrder,
};
