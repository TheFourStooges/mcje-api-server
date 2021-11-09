const { DataTypes, Model, Op } = require('sequelize');
// const slug = require('slug');
const sequelize = require('../config/sequelize');
const regexPatterns = require('../config/regexPatterns');

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
    webId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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

Category.hasMany(Category, {
  foreignKey: 'parentId',
  as: 'children',
});
Category.belongsTo(Category, {
  foreignKey: 'parentId',
  as: 'parent',
});

module.exports = Category;
