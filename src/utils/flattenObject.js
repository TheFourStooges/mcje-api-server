/* eslint-disable no-param-reassign */
// https://stackoverflow.com/questions/44134212/best-way-to-flatten-js-object-keys-and-values-to-a-single-depth-array/59787588

// const flattenObject = (obj) => {
//   const toReturn = {};

//   Object.keys(obj).forEach((key) => {
//     if (!Object.prototype.hasOwnProperty.call(obj, key)) {
//       return;
//     }

//     if (typeof obj[key] === 'object' && obj[key] !== null) {
//       const flatObject = flattenObject(obj[key]);
//       Object.keys(flatObject).forEach((x) => {
//         if (!Object.prototype.hasOwnProperty.call(flatObject, x)) {
//           return;
//         }
//         toReturn[`${key}.${x}`] = flatObject[x];
//       });
//     } else {
//       toReturn[key] = obj[key];
//     }
//   });

//   // for (const i in obj) {
//   //   if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;

//   //   if (typeof obj[i] === 'object' && obj[i] !== null) {
//   //     const flatObject = flattenObject(obj[i]);
//   //     for (const x in flatObject) {
//   //       if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;

//   //       toReturn[`${i}.${x}`] = flatObject[x];
//   //     }
//   //   } else {
//   //     toReturn[i] = obj[i];
//   //   }
//   // }

//   return toReturn;
// };

/**
 * Credit: https://stackoverflow.com/a/59787588
 * @param ob Object                 The object to flatten
 * @param prefix String (Optional)  The prefix to add before each key, also used for recursion
 */
const flattenObject = (ob, prefix = false, result = null) => {
  result = result || {};

  // Preserve empty objects and arrays, they are lost otherwise
  if (prefix && typeof ob === 'object' && ob !== null && Object.keys(ob).length === 0) {
    result[prefix] = Array.isArray(ob) ? [] : {};
    return result;
  }

  prefix = prefix ? `${prefix}.` : '';

  // eslint-disable-next-line no-restricted-syntax
  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      if (typeof ob[i] === 'object' && ob[i] !== null) {
        // Recursion on deeper objects
        flattenObject(ob[i], prefix + i, result);
      } else {
        result[prefix + i] = ob[i];
      }
    }
  }
  return result;
};

module.exports = flattenObject;
