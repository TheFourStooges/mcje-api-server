const httpStatus = require('http-status');
const { Cart, CartItem, Product, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { productService } = require('.');

/**
 *
 */
const createCart = async (userId) => {
  const now = new Date();

  const expiresAt = new Date(now.valueOf());
  expiresAt.setDate(expiresAt.getDate() + config.cart.expirationDays);

  try {
    const result = await sequelize.transaction(async (t) => {
      const cart = await Cart.create(
        {
          userId: userId || null,
          totalItems: 0,
          totalUniqueItems: 0,
          subtotal: 0.0,
          cartCaptured: false,
          expiresAt,
        },
        { transaction: t }
      );

      return cart;
    });

    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `TRANSACTION: ${error}`);
  }
};

const getCartById = async (cartId, userId) => {
  return Cart.findOne({
    where: { id: cartId, userId },
    include: [{ model: CartItem, as: 'cartItems', include: [{ model: Product, as: 'product' }] }],
  });
};

const addItemToCart = async (cartId, userId, requestBody) => {
  const cart = await getCartById(cartId, userId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const { productId, quantity } = requestBody;

  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');
  }

  const productPrice = await product.get('basePrice');

  const cartTotalItems = await cart.get('totalItems');
  const cartTotalUniqueItems = await cart.get('totalUniqueItems');

  // console.log('---->', JSON.stringify(cart, null, 4));
  // console.log('---->', JSON.stringify(product, null, 4));
  // console.log('---->', cartId, userId, productId);
  // console.log('---->', JSON.stringify(cart, null, 4));

  // console.log(
  //   JSON.stringify({
  //     price: productPrice,
  //     discountPerItem: 0,
  //     quantity,
  //     lineTotal: (productPrice - 0) * quantity,
  //     productId,
  //     cartId,
  //   }, null, 4)
  // );

  const t = await sequelize.transaction();
  try {
    const cartItem = await CartItem.create({
      price: productPrice,
      discountPerItem: 0,
      quantity,
      lineTotal: (productPrice - 0) * quantity,
      productId,
      cartId,
    });

    cart.set('totalItems', cart.get('totalItems') + )

    await t.commit();
  } catch (error) {
    await t.rollback();
  }

  return cart.reload();
};

module.exports = {
  createCart,
  getCartById,
  addItemToCart,
};
