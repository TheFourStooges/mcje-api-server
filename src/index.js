const mongoose = require('mongoose');
const sequelize = require('./config/sequelize');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

const connectDb = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
  } catch (error) {
    throw Error('Error while establishing connection with MongoDB instance');
  }

  try {
    await sequelize.sync();
    logger.info('Sequelize models synchronized');
    await sequelize.authenticate();
    logger.info('Connected to SQL Database via Sequelize ORM');
  } catch (error) {
    throw Error('Error while establishing connection with SQL database');
  }
};

connectDb()
  .then(() => {
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => logger.error(error));

// mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
//   logger.info('Connected to MongoDB');
//   server = app.listen(config.port, () => {
//     logger.info(`Listening to port ${config.port}`);
//   });
// });

// sequelize.sync();
// sequelize
//   .authenticate()
//   .then(() => {
//     logger.info('Connected to SQL Database using Sequelize ORM');
//     server = app.listen(config.port, () => {
//       logger.info(`Listening to port ${config.port}`);
//     });
//   })
//   .catch((error) => {
//     logger.info('Error while connecting to the database: ', error);
//   });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
