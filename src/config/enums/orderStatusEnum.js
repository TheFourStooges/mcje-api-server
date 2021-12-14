const orderStatus = ['created', 'fulfilled', 'confirmed-satisfied', 'refunded'];

const orderFulfillmentStatus = ['await-confirmation', 'confirmed-and-prep', 'shipping', 'fulfilled'];

const orderPaymentStatus = ['not-paid', 'paid-not-in-full', 'paid-in-full', 'refunded'];

module.exports = {
  orderStatus,
  orderFulfillmentStatus,
  orderPaymentStatus,
};
