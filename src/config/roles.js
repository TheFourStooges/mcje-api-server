const allRoles = {
  user: ['customerCartAndCheckout'],
  admin: ['getUsers', 'manageUsers', 'manageCategories', 'manageProducts', 'manageAssets', 'getOrders', 'manageOrders'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
