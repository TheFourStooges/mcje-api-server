const allRoles = {
  user: ['getUsers', 'manageUsers', 'customerCartAndCheckout'],
  admin: ['getUsers', 'manageUsers', 'manageCategories', 'manageProducts', 'getCarts', 'manageCarts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
