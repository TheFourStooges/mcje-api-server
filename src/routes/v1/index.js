const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const categoryRoute = require('./category.route');
const productRoute = require('./product.route');
const cartRoute = require('./cart.route');
const checkoutRoute = require('./checkout.route');
const assetRoute = require('./asset.route');
const shippingMethodRoute = require('./shippingMethod.route');
const orderManageRoute = require('./orderManage.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/category',
    route: categoryRoute,
  },
  {
    path: '/product',
    route: productRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
  {
    path: '/checkout',
    route: checkoutRoute,
  },
  {
    path: '/asset',
    route: assetRoute,
  },
  {
    path: '/shipping-method',
    route: shippingMethodRoute,
  },
  {
    path: '/order',
    route: orderManageRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
