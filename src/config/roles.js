const allRoles = {
  user: ['getUsers', 'manageUsers', 'createCart'],
  admin: ['getUsers', 'manageUsers', 'manageCategories', 'manageProducts', 'getCarts', 'manageCarts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
