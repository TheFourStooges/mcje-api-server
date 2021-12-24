const httpStatus = require('http-status');
const { Cart, CartItem, Product, Asset, sequelize } = require('../models');
const { Op } = require('sequelize');
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
  console.log('---->', cartId, userId);
  return Cart.findOne({
    where: { id: cartId, userId, status: { [Op.ne]: 'captured' } },
    include: [
      {
        model: CartItem,
        as: 'cartItems',
        include: [{ model: Product, as: 'product', include: [{ model: Asset, as: 'assets' }] }],
      },
    ],
  });
};

const deleteCartById = async (cartId, userId) => {
  const cart = await getCartById(cartId, userId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  // const cartItems = await cart.getCartItems();
  const t = await sequelize.transaction();
  try {
    await CartItem.destroy({ where: { cartId }, transaction: t });
    await cart.destroy({ transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return cart;
};

const emptyCartById = async (cartId, userId) => {
  const cart = await getCartById(cartId, userId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const t = await sequelize.transaction();
  try {
    await cart.update({ totalItems: 0, totalUniqueItems: 0, subtotal: 0 }, { transaction: t });

    await CartItem.destroy({ where: { cartId }, transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return cart.reload();
};

const getCartItemById = async (cartId, userId, lineItemId) => {
  const cart = await getCartById(cartId, userId);

  const cartItem = await CartItem.findOne({
    where: { id: lineItemId, cartId },
    include: [
      { model: Product, as: 'product' },
      { model: Cart, as: 'cart' },
    ],
  });

  return cart && cartItem ? { cart, cartItem } : null;
};

const addItemToCart = async (cartId, userId, requestBody) => {
  // Find cart id
  const cart = await getCartById(cartId, userId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  // Destructure the requestBody into 2 fields
  const { productId, quantity } = requestBody;

  // Find the product with id
  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');
  }

  // Extract the product's price
  const productPrice = await product.get('basePrice');

  // Recalculate the cart's items count and unique items count PRIOR to new items addition
  const beforeItems = await cart.getItemsCount();
  const beforeUniqueItems = await cart.getUniqueItemsCount();
  const beforeSubtotal = await cart.getSubtotal();

  console.log('----> cart count before', beforeItems, beforeUniqueItems, beforeSubtotal);

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
    // Find existing cart item with the provided product id
    const existingCartItem = await CartItem.findOne({ where: { productId, cartId } }, { transaction: t });

    // If existing line item is found
    if (existingCartItem) {
      // Calculate the quantity after change
      const pricePerItem = existingCartItem.get('price');
      const discountPerItem = existingCartItem.get('discountPerItem');
      const finalPricePerItem = pricePerItem - discountPerItem;

      const previousQuantity = existingCartItem.get('quantity');
      const afterQuantity = previousQuantity + quantity;

      if (afterQuantity > 0) {
        // If the after quantity is valid (>0), update accordingly
        existingCartItem.update(
          { quantity: afterQuantity, lineTotal: afterQuantity * finalPricePerItem },
          { transaction: t }
        );

        // Update cart total items count
        cart.set('totalItems', beforeItems + quantity);
        // Update unique items just for kicks
        cart.set('totalUniqueItems', beforeUniqueItems);
        // Update cart subtotal. noted that only `quantity` is added vs `afterQuantity`
        cart.set('subtotal', beforeSubtotal + quantity * finalPricePerItem);
      } else {
        // else, remove the line item from cart
        existingCartItem.destroy({ transaction: t });

        // Deduct total items count by the previous quantity value
        cart.set('totalItems', beforeItems - previousQuantity);
        // Deduct the unique items count by 1;
        cart.set('totalUniqueItems', beforeUniqueItems - 1);
        // Deduct the subtotal
        cart.set('subtotal', beforeSubtotal - previousQuantity * finalPricePerItem);
      }
    } else {
      // If a line item of this cart with the provided product id is not found
      // Create a new line item
      const lineTotal = (productPrice - 0) * quantity;
      const cartItem = await CartItem.create(
        {
          price: productPrice,
          discountPerItem: 0,
          quantity,
          lineTotal,
          productId,
          cartId,
        },
        {
          transaction: t,
        }
      );

      // Recalculate the cart totalItems and totalUniqueItems count
      cart.set('totalItems', beforeItems + quantity);
      cart.set('totalUniqueItems', beforeUniqueItems + 1);
      cart.set('subtotal', beforeSubtotal + lineTotal);
    }

    await cart.save({ transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
  }

  return cart.reload();
};

const updateItemInCart = async (cartId, userId, lineItemId, requestBody) => {
  const { cart, cartItem } = await getCartItemById(cartId, userId, lineItemId);
  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart and item combination not found');
  }

  const linePricePerItem = cartItem.get('price') - cartItem.get('discountPerItem');
  const lineQuantityBefore = cartItem.get('quantity');
  const lineTotalBefore = cartItem.get('lineTotal');
  const { quantity, ...restOfBody } = requestBody;

  if (Number.isNaN(quantity)) {
    return cartItem;
  }

  // let isDelete = false;
  // if (quantity <= 0) {
  //   isDelete = true;
  // }

  const t = await sequelize.transaction();
  try {
    if (quantity > 0) {
      const deltaQuantity = quantity - lineQuantityBefore;
      const deltaPrice = quantity * linePricePerItem - lineTotalBefore;

      // Update the line item quantity and line total
      await cartItem.update(
        {
          quantity,
          lineTotal: quantity * linePricePerItem,
        },
        { transaction: t }
      );

      // Update the corresponding cart's totalItems and subtotal
      await Cart.increment(
        {
          totalItems: deltaQuantity,
          subtotal: deltaPrice,
        },
        { where: { id: cartId }, transaction: t }
      );
    } else {
      await cartItem.destroy({ transaction: t });
      await Cart.decrement(
        {
          totalItems: lineQuantityBefore,
          subtotal: lineTotalBefore,
        },
        { where: { id: cartId }, transaction: t }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return cart.reload();
};

const deleteItemInCart = async (cartId, userId, lineItemId) => {
  const { cart, cartItem } = await getCartItemById(cartId, userId, lineItemId);

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart Item not found');
  }

  const removeItemsCount = cartItem.get('quantity');
  const removeLineTotal = cartItem.get('lineTotal');

  const t = await sequelize.transaction();
  try {
    await cartItem.destroy({ transaction: t });
    await cart.decrement({
      totalItems: removeItemsCount,
      totalUniqueItems: 1,
      subtotal: removeLineTotal,
    });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }

  return cart.reload();
};

module.exports = {
  createCart,
  getCartById,
  deleteCartById,
  emptyCartById,
  addItemToCart,
  getCartItemById,
  updateItemInCart,
  deleteItemInCart,
};
