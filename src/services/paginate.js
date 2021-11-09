/**
 * Query for a set of tuples, paginate it and return
 * @param {Object} [where_clause] Sequelize query WHERE clause. See https://sequelize.org/master/manual/model-querying-basics.html#applying-where-clauses
 * @param {Object} [options] Query options
 * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
 * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns
 */
const sequelizePaginate = (whereClause, options) => {
  // Split `options.sortBy` string into an array of items to pass into Sequelize's `order` option
  // See: https://sequelize.org/master/manual/model-querying-basics.html#ordering
  // The `order` option takes an array of items to order the query by.
  // These items are themselves arrays in the form `[column, direction]`
  // `direction` IN ('ASC', 'DESC', 'NULLS FIRST')
  const sort = [];
  if (options.sortBy) {
    options.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort.push([key, order === 'desc' ? 'DESC' : 'ASC']);
    });
  } else {
    // Default sort: createdAt ASC
    sort.push(['createdAt', 'ASC']);
  }

  // Check the supplied `options` parameters: limit and page.
  // limit: default = 10
  // page: default = 1
  // Note: parseInt(number, radix): radix == number base
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  const { countPromise, rowsPromise } = this.findAndCountAll({
    where: whereClause,
    order: sort,
    offset: skip,
    limit,
  });

  // Write populate logic here

  return Promise.all([countPromise, rowsPromise]).then((values) => {
    const [totalResults, results] = values;
    const totalPages = Math.ceil(totalResults / limit);
    const result = {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
    return Promise.resolve(result);
  });
};

module.exports = sequelizePaginate;
