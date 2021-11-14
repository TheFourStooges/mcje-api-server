const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { idUnionSchema } = require('./schemas');
const regexPatterns = require('../config/regexPatterns');
const attributesEnum = require('../config/attributesEnum');

// const optionGroupSchema = Joi.object()
//   .keys({
//     name: Joi.string().required(),
//     // https://stackoverflow.com/questions/42656549/joi-validation-of-array
//     options: Joi.array().items(productOptionSchema).min(1).unique('name'),
//   })
//   .required();

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string(),
    isActive: Joi.boolean(),
    categoryId: idUnionSchema,
    basePrice: Joi.number().precision(2).positive().required(),
    // https://stackoverflow.com/questions/54483904/how-to-use-joi-to-validate-map-object-map-keys-and-map-values
    // attributes: Joi.object().pattern(Joi.string().regex(regexPatterns.uuidv4), Joi.string().regex(regexPatterns.uuidv4)),
    // optionGroups: Joi.array().items(optionGroupSchema),
    properties: Joi.object()
      .keys({
        product: Joi.object()
          .keys({
            productType: Joi.string()
              .valid(...attributesEnum.productType)
              .required(),
            claspType: Joi.string().valid(...attributesEnum.claspType),
            chainType: Joi.string().valid(...attributesEnum.chainType),
            backFinding: Joi.string().valid(...attributesEnum.backFinding),
            ringSize: Joi.string().valid(...attributesEnum.ringSize),
          })
          .required(),
        material: Joi.object()
          .keys({
            // Keys
            materialType: Joi.array()
              .items(Joi.string().valid(...attributesEnum.materialType))
              .min(1)
              .unique()
              .required(),
            // material may be automatically generated? no need to send
            gemType: Joi.string().valid(...attributesEnum.gemType),
            stoneCut: Joi.string().valid(...attributesEnum.stoneCut),
            stoneColor: Joi.string().valid(...attributesEnum.stoneColor),
            stoneClarity: Joi.string().valid(...attributesEnum.stoneClarity),
            stoneShape: Joi.string().valid(...attributesEnum.stoneShape),
            pearlType: Joi.string().valid(...attributesEnum.pearlType),
            pearlColor: Joi.string().valid(...attributesEnum.pearlColor),
            pearlLuster: Joi.string().valid(...attributesEnum.pearlLuster),
            pearlShape: Joi.string().valid(...attributesEnum.pearlShape),
            pearlUniformity: Joi.string().valid(...attributesEnum.pearlUniformity),
            surfaceMarking: Joi.string().valid(...attributesEnum.surfaceMarking),
            stringingMethod: Joi.string().valid(...attributesEnum.stringingMethod),
            sizePerPearl: Joi.string().valid(...attributesEnum.sizePerPearl),
            settingType: Joi.string().valid(...attributesEnum.settingType),
            metalType: Joi.string().valid(...attributesEnum.metalType),
            metalStamp: Joi.string().valid(...attributesEnum.metalStamp),
            inscription: Joi.string().valid(...attributesEnum.inscription),
          })
          .required(),
      })
      .required(),
    assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    // categorySlug: Joi.string().regex(regexPatterns.slug),
    categoryId: Joi.string().regex(regexPatterns.uuidv4),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    attributeOptions: Joi.array().items(idUnionSchema),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().valid('id', 'slug', 'sku'),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      slug: Joi.string(),
      description: Joi.string(),
      isActive: Joi.boolean(),
      categoryId: idUnionSchema,
      basePrice: Joi.number().precision(2).positive(),
      // https://stackoverflow.com/questions/54483904/how-to-use-joi-to-validate-map-object-map-keys-and-map-values
      // attributes: Joi.object().pattern(Joi.string().regex(regexPatterns.uuidv4), Joi.string().regex(regexPatterns.uuidv4)),
      // optionGroups: Joi.array().items(optionGroupSchema),
      properties: Joi.object().keys({
        product: Joi.object().keys({
          productType: Joi.string().valid(...attributesEnum.productType),
          claspType: Joi.string().valid(...attributesEnum.claspType),
          chainType: Joi.string().valid(...attributesEnum.chainType),
          backFinding: Joi.string().valid(...attributesEnum.backFinding),
          ringSize: Joi.string().valid(...attributesEnum.ringSize),
        }),
        material: Joi.object().keys({
          // Keys
          materialType: Joi.array()
            .items(Joi.string().valid(...attributesEnum.materialType))
            .unique(),
          // material may be automatically generated? no need to send
          gemType: Joi.string().valid(...attributesEnum.gemType),
          stoneCut: Joi.string().valid(...attributesEnum.stoneCut),
          stoneColor: Joi.string().valid(...attributesEnum.stoneColor),
          stoneClarity: Joi.string().valid(...attributesEnum.stoneClarity),
          stoneShape: Joi.string().valid(...attributesEnum.stoneShape),
          pearlType: Joi.string().valid(...attributesEnum.pearlType),
          pearlColor: Joi.string().valid(...attributesEnum.pearlColor),
          pearlLuster: Joi.string().valid(...attributesEnum.pearlLuster),
          pearlShape: Joi.string().valid(...attributesEnum.pearlShape),
          pearlUniformity: Joi.string().valid(...attributesEnum.pearlUniformity),
          surfaceMarking: Joi.string().valid(...attributesEnum.surfaceMarking),
          stringingMethod: Joi.string().valid(...attributesEnum.stringingMethod),
          sizePerPearl: Joi.string().valid(...attributesEnum.sizePerPearl),
          settingType: Joi.string().valid(...attributesEnum.settingType),
          metalType: Joi.string().valid(...attributesEnum.metalType),
          metalStamp: Joi.string().valid(...attributesEnum.metalStamp),
          inscription: Joi.string().valid(...attributesEnum.inscription),
        }),
      }),
      assets: Joi.array().items(Joi.string().custom(objectId)).has(Joi.string().custom(objectId)).min(0).max(16).unique(),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
