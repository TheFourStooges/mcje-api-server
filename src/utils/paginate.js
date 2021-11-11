/**
 * Query for a set of tuples, paginate it and return
 * @param {Model}  [model] - A sequelize model
 * @param {Object} [whereClause] - Sequelize query WHERE clause. See https://sequelize.org/master/manual/model-querying-basics.html#applying-where-clauses
 * @param {Object} [options] - Query options
 * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Array<Object|Model|string>} [eagerLoadInclude] - Sequelize options.include clause. See https://sequelize.org/master/class/lib/model.js~Model.html#static-method-findAll
 * @returns
 */
const paginate = async (model, whereClause, options, eagerLoadInclude) => {
  // Split `options.sortBy` string into an array of items to pass into Sequelize's `order` option
  // See: https://sequelize.org/master/manual/model-querying-basics.html#ordering
  // The `order` option takes an array of items to order the query by.
  // These items are themselves arrays in the form `[column, direction]`
  // `direction` IN ('ASC', 'DESC', 'NULLS FIRST')

  // console.log('---->', model);
  // console.log('---->', whereClause);
  // console.log('---->', options);

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

  // console.log('---->', limit, page, skip);

  // const { totalResults, results } = await model.findAndCountAll({
  //   where: whereClause,
  //   order: sort,
  //   offset: skip,
  //   limit,
  // });

  // console.log('---->', await model.findAndCountAll());

  // Write populate logic here

  // const totalPages = Math.ceil(totalResults / limit);
  // const result = {
  //   results,
  //   page,
  //   limit,
  //   totalPages,
  //   totalResults,
  // };

  // return result;

  const { count, rows } = await model.findAndCountAll({
    where: whereClause,
    include: eagerLoadInclude,
    order: sort,
    offset: skip,
    limit,
  });

  return {
    data: rows,
    meta: {
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      totalResults: count,
    },
  };

  // return Promise.all([countPromise, rowsPromise]).then((values) => {
  //   const [totalResults, results] = values;
  //   const totalPages = Math.ceil(totalResults / limit);
  //   const result = {
  //     results,
  //     page,
  //     limit,
  //     totalPages,
  //     totalResults,
  //   };
  //   return Promise.resolve(result);
  // });
};

module.exports = paginate;
