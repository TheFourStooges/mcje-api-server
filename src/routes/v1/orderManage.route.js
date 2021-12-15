const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderManageValidation = require('../../validations/orderManage.validation');
const orderManageController = require('../../controllers/orderManage.controller');

const router = express.Router();

router
  .route('/:orderId/add-payment')
  .post(auth('manageOrders'), validate(orderManageValidation.addOrderPayment), orderManageController.addOrderPayment);

router
  .route('/:orderId/add-fulfillment')
  .post(
    auth('manageOrders'),
    validate(orderManageValidation.addOrderFulfillment),
    orderManageController.addOrderFulfillment
  );

router.route('/').get(auth('getOrders'), validate(orderManageValidation.getOrders), orderManageController.getOrders);

// /product/{productId}
router
  .route('/:orderId')
  .get(auth('getOrders'), validate(orderManageValidation.getOrder), orderManageController.getOrder)
  .patch(auth('manageOrders'), validate(orderManageValidation.updateOrder), orderManageController.updateOrder);

module.exports = router;
