const { Model } = require('sequelize');
const orderStatusEnum = require('../config/enums/orderStatusEnum');

module.exports = (sequelize, DataTypes) => {
  class OrderFulfillment extends Model {}

  OrderFulfillment.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      carrier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: [...orderStatusEnum.orderFulfillmentType],
        defaultValue: 'hand-off-to-carrier',
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  OrderFulfillment.associate = (models) => {
    // OrderFulfillment.belongsTo(models.Order, {
    //   // foreignKey: { name: 'orderId' },
    //   as: 'order',
    // });
  };
  return OrderFulfillment;
};
