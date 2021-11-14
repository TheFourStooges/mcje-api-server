const { Model, Op } = require('sequelize');
// const slug = require('slug');
// const sequelize = require('../config/sequelize');
const regexPatterns = require('../config/regexPatterns');
// const Category = require('./category.model');
// const ProductOptionGroup = require('./productOptionGroup.model');
// const ProductVariant = require('./productVariant.model');
const jsonbValidator = require('../utils/jsonbValidator');
const attributesEnum = require('../config/attributesEnum');

module.exports = (sequelize, DataTypes) => {
  /**
   * @typedef Product
   */
  class Product extends Model {
    static async isSlugTaken(slug, excludeProductId) {
      let product;
      if (excludeProductId) {
        product = await this.findOne({
          where: {
            slug,
            [Op.not]: [{ id: excludeProductId }],
          },
        });
      } else {
        product = await this.findOne({
          where: {
            slug,
          },
        });
      }

      // https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
      return !!product;
    }
  }

  Product.init(
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
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      properties: {
        type: DataTypes.JSONB,
        validate: {
          schema: jsonbValidator({
            type: 'object',
            properties: {
              product: {
                type: 'object',
                required: true,
                allowEmpty: false,
                properties: {
                  productType: { type: 'string', enum: attributesEnum.productType, allowEmpty: false, required: true },
                  claspType: { type: 'string', enum: attributesEnum.claspType },
                  chainType: { type: 'string', enum: attributesEnum.chainType },
                  backFinding: { type: 'string', enum: attributesEnum.backFinding },
                  ringSize: { type: 'string', enum: attributesEnum.ringSize },
                },
              },
              material: {
                type: 'object',
                required: true,
                allowEmpty: false,
                properties: {
                  materialType: {
                    type: 'array',
                    items: { type: 'string', enum: attributesEnum.materialType },
                    allowEmpty: false,
                    required: true,
                    uniqueItems: true,
                    minItems: 1,
                  },
                  material: {
                    type: 'array',
                    items: { type: 'string', enum: attributesEnum.material },
                    uniqueItems: true,
                    minItems: 1,
                  },
                  // 'gemstone'
                  gemType: { type: 'string', enum: attributesEnum.gemType },
                  stoneCut: { type: 'string', enum: attributesEnum.stoneCut },
                  stoneColor: { type: 'string', enum: attributesEnum.stoneColor },
                  stoneClarity: { type: 'string', enum: attributesEnum.stoneClarity },
                  stoneShape: { type: 'string', enum: attributesEnum.stoneShape },
                  // 'pearl'
                  pearlType: { type: 'string', enum: attributesEnum.pearlType },
                  pearlColor: { type: 'string', enum: attributesEnum.pearlColor },
                  pearlLuster: { type: 'string', enum: attributesEnum.pearlLuster },
                  pearlShape: { type: 'string', enum: attributesEnum.pearlShape },
                  pearlUniformity: { type: 'string', enum: attributesEnum.pearlUniformity },
                  surfaceMarking: { type: 'string', enum: attributesEnum.surfaceMarking },
                  stringingMethod: { type: 'string', enum: attributesEnum.stringingMethod },
                  sizePerPearl: { type: 'string', enum: attributesEnum.sizePerPearl },
                  // 'gemstone' OR 'pearl'
                  settingType: { type: 'string', enum: attributesEnum.settingType },
                  // 'metal'
                  metalType: { type: 'string', enum: attributesEnum.metalType },
                  metalStamp: { type: 'string', enum: attributesEnum.metalStamp },
                  inscription: { type: 'string', enum: attributesEnum.inscription },
                },
              },
            },
          }),
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: {
        name: 'categoryId',
      },
    });

    // Product.hasMany(models.ProductOptionGroup, {
    //   foreignKey: {
    //     name: 'productId',
    //   },
    //   as: 'optionGroups',
    // });

    // Product.belongsToMany(models.ProductAttributeOption, {
    //   through: models.Product_ProductAttributeOption,
    //   as: 'attributeOptions',
    // });
    // Product.hasMany(models.Product_ProductAttributeOption);

    // Product.hasMany(ProductVariant);
    // ProductVariant.belongsTo(Product);
  };

  return Product;
};
