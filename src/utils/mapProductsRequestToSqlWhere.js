const { Op } = require('sequelize');
const flatten, { unflatten } = require('flat');

const mapProductsReqToSqlWhere = (requestBody) => {
  const flattenedBody = flatten(requestBody, { safe: true });

  
}

// const mapProductsRequestToSqlWhere = (requestBody) => {
//   const { name, description, properties, basePrice, assets, ...restOfBody } = requestBody;

//   const determineOpInOrOpEqual = (bodyIn) => {
//     const bodyOut = {};

//     Object.entries(bodyIn).forEach(([key, value]) => {
//       if (typeof value === 'object' && Array.isArray(value)) {
//         bodyOut[key] = { [Op.in]: value };
//       } else {
//         bodyOut[key] = value;
//       }
//     });

//     return bodyOut;
//   };

//   const nameAttribute =
//     typeof requestBody.name === 'object' ? { [Op.like]: { [Op.any]: [...name] } } : { [Op.substring]: name };
//   const descriptionAttribute =
//     typeof requestBody.description === 'object'
//       ? { [Op.like]: { [Op.any]: [...description] } }
//       : { [Op.substring]: description };

//   const rootLevelAttributes = restOfBody && determineOpInOrOpEqual(restOfBody);

//   const propertiesAttributes = properties && {
//     product: properties.product && determineOpInOrOpEqual(properties.product),
//     material: properties.material && determineOpInOrOpEqual(properties.material),
//   };

//   const basePriceAttribute =
//     basePrice &&
//     ((numberComparision) => {
//       let returnObject;

//       if (numberComparision.from && !numberComparision.to) {
//         returnObject = numberComparision.from.inclusive
//           ? { [Op.gte]: numberComparision.from.value }
//           : { [Op.gt]: numberComparision.from.value };
//       } else if (!numberComparision.from && numberComparision.to) {
//         returnObject = numberComparision.to.inclusive
//           ? { [Op.lte]: numberComparision.to.value }
//           : { [Op.lt]: numberComparision.to.value };
//       } else if (numberComparision.from && numberComparision.to) {
//         returnObject = { [Op.between]: [numberComparision.from.value, numberComparision.to.value] };
//       }

//       return returnObject;
//     })(basePrice);

//   return {
//     name: nameAttribute,
//     description: descriptionAttribute,
//     ...rootLevelAttributes,
//     ...propertiesAttributes,
//     basePrice: basePriceAttribute,
//   };
// };

module.exports = mapProductsRequestToSqlWhere;
