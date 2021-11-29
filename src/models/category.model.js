const { Model, Op } = require('sequelize');
// const slug = require('slug');
// const sequelize = require('../config/sequelize');
const regexPatterns = require('../config/regexPatterns');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Category
   */
  class Category extends Model {
    static async isSlugTaken(slug, excludeCategoryId) {
      let category;
      if (excludeCategoryId) {
        category = await this.findOne({
          where: {
            slug,
            [Op.not]: [{ id: excludeCategoryId }],
          },
        });
      } else {
        category = await this.findOne({
          where: {
            slug,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!category;
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: regexPatterns.slug,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Category.associate = (models) => {
    // Category ||--|{ Category -- A category has many child category, belongs to one parent
    Category.hasMany(models.Category, {
      foreignKey: { name: 'parentId' },
      as: 'children',
    });
    Category.belongsTo(models.Category, {
      foreignKey: { name: 'parentId' },
      as: 'parent',
    });

    Category.hasMany(models.Product, {
      foreignKey: {
        name: 'categoryId',
      },
      as: 'products',
    });
  };

  return Category;
};
