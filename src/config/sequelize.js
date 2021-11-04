const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${__dirname}/../../db.sqlite3`,
});

module.exports = sequelize;
