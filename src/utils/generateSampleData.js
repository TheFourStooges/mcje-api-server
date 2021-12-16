/* eslint-disable no-unused-vars */
const slugify = require('slugify');
const faker = require('faker');
const attributesEnum = require('../config/enums/attributesEnum');
const { Product, Category, User, Cart, ShippingMethod, sequelize } = require('../models');
const { categoryService, productService } = require('../services');

const generateUsers = async () => {
  const users = [
    {
      email: 'admin@example.com',
      password: 'password1',
      name: 'admin',
      role: 'admin',
    },
    {
      email: 'user@example.com',
      password: 'password1',
      name: 'user',
      role: 'user',
    },
  ];

  await Promise.all(users.map((user) => User.create(user)));
};

const generateCategories = async () => {
  const jewelry = await categoryService.createCategory({
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'All things jewelry',
  });

  const necklaces = await categoryService.createCategory({
    name: 'Necklaces and Pendants',
    slug: 'necklaces-pendants',
    description: 'Necklaces & Pendants',
    parentId: { slug: 'jewelry' },
  });

  const bracelets = await categoryService.createCategory({
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Bracelets',
    parentId: { slug: 'jewelry' },
  });

  const earrings = await categoryService.createCategory({
    name: 'Earrings',
    slug: 'earrings',
    description: 'Earrings',
    parentId: { slug: 'jewelry' },
  });

  const rings = await categoryService.createCategory({
    name: 'Rings',
    slug: 'rings',
    description: 'rings',
    parentId: { slug: 'jewelry' },
  });

  const brooches = await categoryService.createCategory({
    name: 'Brooches',
    slug: 'brooches',
    description: 'Brooches',
    parentId: { slug: 'jewelry' },
  });

  const charms = await categoryService.createCategory({
    name: 'Charms',
    slug: 'charms',
    description: 'Charms',
    parentId: { slug: 'jewelry' },
  });

  const engagement = await categoryService.createCategory({
    name: 'Love and Engagement',
    slug: 'engagement',
    description: 'Love and Engagement',
  });

  const menEngagementRings = await categoryService.createCategory({
    name: "Men's Engagement Rings",
    slug: 'mens-engagement-rings',
    description: "Men's Engagement Rings",
    parentId: { slug: 'engagement' },
  });

  const womenEngagementRings = await categoryService.createCategory({
    name: "Women's Engagement Rings",
    slug: 'womens-engagement-rings',
    description: "Women's Engagement Rings",
    parentId: { slug: 'engagement' },
  });

  const menWeddingBands = await categoryService.createCategory({
    name: "Men's Wedding Bands",
    slug: 'mens-wedding-bands',
    description: "Men's Wedding Bands",
    parentId: { slug: 'engagement' },
  });

  const womenWeddingBands = await categoryService.createCategory({
    name: "Women's Wedding Bands",
    slug: 'womens-wedding-bands',
    description: "Women's Wedding Bands",
    parentId: { slug: 'engagement' },
  });
};

const generateProducts = async () => {
  // const categoryIds = [
  //   'jewelry',
  //   'necklaces-pendants',
  //   'bracelets',
  //   'earrings',
  //   'rings',
  //   'brooches',
  //   'charms',
  //   'engagement',
  //   'mens-engagement-rings',
  //   'womens-engagement-rings',
  //   'mens-wedding-bands',
  //   'womens-wedding-bands',
  // ];

  const categories = await Category.findAll({ attributes: ['id'] });
  const categoryIds = categories.map((instance) => instance.dataValues.id);
  console.log(JSON.stringify(categoryIds, null, 4));

  const generateFromCategory = (categoryId, count) => {
    const productsData = [];
    for (let i = 0; i < count; i += 1) {
      const name = faker.commerce.productName();
      const slug = `${slugify(name.toLowerCase())}-${Math.floor(Math.random() * 10000)}`;
      const productType = attributesEnum.productType[Math.floor(Math.random() * attributesEnum.productType.length)];
      const claspType = attributesEnum.claspType[Math.floor(Math.random() * attributesEnum.claspType.length)];
      const chainType = attributesEnum.chainType[Math.floor(Math.random() * attributesEnum.chainType.length)];
      const backFinding = attributesEnum.backFinding[Math.floor(Math.random() * attributesEnum.backFinding.length)];
      const ringSize = attributesEnum.ringSize[Math.floor(Math.random() * attributesEnum.ringSize.length)];
      const gemType = attributesEnum.gemType[Math.floor(Math.random() * attributesEnum.gemType.length)];
      const stoneCut = attributesEnum.stoneCut[Math.floor(Math.random() * attributesEnum.stoneCut.length)];
      const stoneColor = attributesEnum.stoneColor[Math.floor(Math.random() * attributesEnum.stoneColor.length)];
      const stoneClarity = attributesEnum.stoneClarity[Math.floor(Math.random() * attributesEnum.stoneClarity.length)];
      const stoneShape = attributesEnum.stoneShape[Math.floor(Math.random() * attributesEnum.stoneShape.length)];
      const pearlType = attributesEnum.pearlType[Math.floor(Math.random() * attributesEnum.pearlType.length)];
      const pearlColor = attributesEnum.pearlColor[Math.floor(Math.random() * attributesEnum.pearlColor.length)];
      const pearlLuster = attributesEnum.pearlLuster[Math.floor(Math.random() * attributesEnum.pearlLuster.length)];
      const pearlShape = attributesEnum.pearlShape[Math.floor(Math.random() * attributesEnum.pearlShape.length)];
      const pearlUniformity =
        attributesEnum.pearlUniformity[Math.floor(Math.random() * attributesEnum.pearlUniformity.length)];
      const surfaceMarking = attributesEnum.surfaceMarking[Math.floor(Math.random() * attributesEnum.surfaceMarking.length)];
      const stringingMethod =
        attributesEnum.stringingMethod[Math.floor(Math.random() * attributesEnum.stringingMethod.length)];
      const sizePerPearl = attributesEnum.sizePerPearl[Math.floor(Math.random() * attributesEnum.sizePerPearl.length)];
      const settingType = attributesEnum.settingType[Math.floor(Math.random() * attributesEnum.settingType.length)];
      const metalType = attributesEnum.metalType[Math.floor(Math.random() * attributesEnum.metalType.length)];
      const metalStamp = attributesEnum.metalStamp[Math.floor(Math.random() * attributesEnum.metalStamp.length)];
      const inscription = attributesEnum.inscription[Math.floor(Math.random() * attributesEnum.inscription.length)];
      productsData.push({
        name,
        slug,
        description: faker.commerce.productDescription(),
        basePrice: faker.commerce.price(),
        categoryId,
        properties: {
          productType,
          claspType,
          chainType,
          backFinding,
          ringSize,
          materialType: ['metal', 'gemstone', 'pearl'],
          gemType,
          stoneCut,
          stoneColor,
          stoneClarity,
          stoneShape,
          pearlType,
          pearlColor,
          pearlLuster,
          pearlShape,
          pearlUniformity,
          surfaceMarking,
          stringingMethod,
          sizePerPearl,
          settingType,
          metalType,
          metalStamp,
          inscription,
        },
      });
    }

    return productsData;
  };

  const products = categoryIds.reduce((accumulated, currentCategory) => {
    return [...accumulated, ...generateFromCategory(currentCategory, 10)];
  }, []);

  console.log(products);

  Product.bulkCreate(products, { validate: true, benchmark: true });

  // Promise.all(products.map((product) => productService.createProduct(product)));
};

const generateShippingMethods = async () => {
  const methods = [
    {
      description: 'Giao hang tiet kiem',
      provider: 'GHTK',
      price: 0.99,
    },
    {
      description: 'Giao hang dat tien',
      provider: 'GHDT',
      price: 690.99,
    },
  ];

  await Promise.all(methods.map((method) => ShippingMethod.create(method)));
};

const generateSampleData = async () => {
  await generateUsers();
  await generateCategories();
  await generateProducts();
  await generateShippingMethods();
};

module.exports = generateSampleData;
