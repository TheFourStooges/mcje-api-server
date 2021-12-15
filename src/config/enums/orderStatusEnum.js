const orderStatus = ['created', 'fulfilled', 'confirmed-satisfied', 'refunded'];

const orderFulfillmentStatus = ['await-confirmation', 'confirmed-and-prep', 'shipping', 'fulfilled'];

const orderFulfillmentType = ['confirm-order', 'hand-off-to-carrier', 'in-transit', 'delivered'];

const orderPaymentStatus = ['not-paid', 'paid-not-in-full', 'paid-in-full', 'refunded'];

const orderPaymentType = ['card', 'bank-transfer', 'cash-on-delivery', 'refund'];

const fulfillmentStatusToTransactionTypeMapping = {
  'await-confirmation': ['confirm-order'],
  'confirmed-and-prep': ['hand-off-to-carrier'],
  // eslint-disable-next-line prettier/prettier
  shipping: ['in-transit', 'delivered'],
  // eslint-disable-next-line prettier/prettier
  fulfilled: [],
};

module.exports = {
  orderStatus,
  orderFulfillmentStatus,
  orderFulfillmentType,
  orderPaymentStatus,
  orderPaymentType,
  fulfillmentStatusToTransactionTypeMapping,
};
