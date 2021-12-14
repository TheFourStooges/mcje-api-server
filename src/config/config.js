const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    SQL_DIALECT: Joi.string().required().description('Sequlize: dialect, see documentation'),
    SQL_HOST: Joi.string().required().description('Sequelize: server hostname/address'),
    SQL_DATABASE: Joi.string().required().description('Sequelize: database name'),
    SQL_USERNAME: Joi.string().required().description('Sequelize: database login username'),
    SQL_PASSWORD: Joi.string().required().description('Sequelize: database login password'),
    CART_EXPIRATION_DAYS: Joi.number().default(30).description('days after which carts expire'),
    CHECKOUT_EXPIRATION_DAYS: Joi.number().default(7).description('days after which checkout tokens expire'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    UPLOAD_PATH: Joi.string()
      .description('Relative path to the process.cwd() to store images')
      .default('/public/data/uploads'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  sql: {
    dialect: envVars.SQL_DIALECT,
    host: envVars.SQL_HOST,
    database: envVars.SQL_DATABASE,
    username: envVars.SQL_USERNAME,
    password: envVars.SQL_PASSWORD,
  },
  cart: {
    expirationDays: envVars.CART_EXPIRATION_DAYS,
  },
  checkout: {
    expirationDays: envVars.CHECKOUT_EXPIRATION_DAYS,
  },
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  uploads: {
    path: envVars.UPLOAD_PATH,
  },
};
