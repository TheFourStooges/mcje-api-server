const sequelizeToJSON = (model) => {
  // eslint-disable-next-line no-param-reassign
  model.prototype.toJSON = function () {
    const values = { ...this.get() };

    delete values.createdAt;
    delete values.updatedAt;

    return values;
  };
};

module.exports = sequelizeToJSON;
