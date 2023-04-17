const { sqlForPartialUpdate } = require('./sql.js');

const SQL_QUERY = `UPDATE users SET "first_name"=$1, "age"=$2`;
const dataToUpdate = {firstName: 'Aliya', age: 32};
const jsToSql = {firstName: 'first_name'};

test("Testing helper function sqlForPartialUpdate ", () => {
    let sql = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect('UPDATE users SET ' + sql.setCols).toEqual(SQL_QUERY);
    expect(sql.values).toEqual(["Aliya", 32]);
})