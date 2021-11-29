const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderPayment extends Model {}

  OrderPayment.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: ['card', 'bank-transfer', 'cash-on-delivery', 'refund'],
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 3],
        },
        defaultValue: 'VND',
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  OrderPayment.associate = (models) => {
    OrderPayment.belongsTo(models.Order, {
      foreignKey: { name: 'orderId' },
      as: 'order',
    });
  };

  return OrderPayment;
};
