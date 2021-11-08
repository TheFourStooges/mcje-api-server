/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object, keys) => {
  // The `reduce()` method executes a user-supplied "reducer" callback
  // function on each element of the array (here: `keys`),
  // passing in the return value from the calculation on the preceding
  // element.
  // The final result of running the reducer across all elements of
  // the array is a single value.
  //
  // reduce((prevValue, currValue) => { ... }, initialValue)
  // Here `initialValue` is an empty object
  return keys.reduce((obj, key) => {
    // Wtf is the deal with hasOwnProperty.call()?
    // https://dev.to/aman_singh/what-s-the-deal-with-object-prototype-hasownproperty-call-4mbj
    // > "If your function makes use of hasOwnProperty directly on the
    // > object being passed from outside, it could break your code if
    // > someone passes an object with null as its prototype.
    // > Consequently, to guard this problem we can use function
    // > borrowing technique we previously learned. The passed-in
    // > object argument can borrow hasOwnProperty available on
    // > Object.prototype as we previously learned via call method. "
    //
    // Basically object.hasOwnProperty(key)
    // If `object` not null and has property `key`
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
      // Add the key-value pair to the "accumulated" object
    }
    // Return the "accumulated" object to the next value.
    return obj;
  }, {});
};

module.exports = pick;
