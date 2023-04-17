const { BadRequestError } = require("../expressError");

// Writes column values for UPDATE SQL statements.
//
//  dataToUpdate: Object values we'd like to change
//  jsToSql: Javascript variable names to sql variable names.
//
//  Ex: dataToUpdate = {firstName: 'Aliya', age: 32}
//      jsToSql = { "firstName": "first_name"}
//
//  returns: { setCols, values }
//  where setCols is the partial SQL QUERY and
//  set values are the values to update to.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
