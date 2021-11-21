/* eslint-disable no-unused-vars */
const { Product, Category, User, Cart } = require('../models');
const { categoryService } = require('../services');
const faker = require('faker');

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

const generateSampleData = () => {};

module.exports = generateSampleData;
