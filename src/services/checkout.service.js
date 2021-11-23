const httpStatus = require('http-status');
const { Cart, CartItem, Order, OrderItem, Product, CheckoutToken, ShippingMethod, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { cartService } = require('.');

const calculateTax = (subtotal) => {
  return Number.isNaN(subtotal) ? null : subtotal * 0.1;
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
  return CheckoutToken.findOne({
    where: { id: checkoutTokenId, userId },
    include: [
      {
        model: Cart,
        as: 'cart',
        include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
      },
      { model: ShippingMethod, as: 'shippingMethod' },
    ],
  });
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

      if (shippingMethod) {
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

  const cart = await checkoutToken.getCart();
  const cartStatistics = await cart.getStatistics();
  const { totalItems, totalUniqueItems, subtotal } = cartStatistics;

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
  const orderItems = cartItems.map((cartItem) => {
    const { id, cartId, isActive, createdAt, updatedAt, ...orderItem } = cartItem;

    return orderItem;
  });

  const referenceNumber = "";

  let order;
  const t = await sequelize.transaction();
  try {
    order = await Order.create({
      referenceNumber: 
    })

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  generateCheckoutToken,
  getCheckoutTokenById,
  updateCheckoutTokenById,
};
