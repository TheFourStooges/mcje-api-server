/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable security/detect-non-literal-require */
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const logger = require('../config/logger');
const config = require('../config/config');

const basename = path.basename(module.filename);
// const env = process.env.NODE_ENV || 'development';
const db = {};

// Folder structure based on https://github.com/williampruden/sequelize-associations

const sequelize = new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, {
  host: '192.168.1.200',
  dialect: 'postgres',
  logging: logger.debug.bind(logger),
});

// eslint-disable-next-line security/detect-non-literal-fs-filename
fs.readdirSync(__dirname)
  .filter(function (file) {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach(function (file) {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    logger.info(`${model.name} imported`);
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// module.exports.Token = require('./token.model');
// module.exports.User = require('./user.model');

// module.exports.Category = require('./category.model');
// module.exports.Product = require('./product.model');
// module.exports.ProductOptionGroup = require('./productOptionGroup.model');
// module.exports.ProductOption = require('./productOption.model');
