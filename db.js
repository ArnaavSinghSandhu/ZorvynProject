const {Pool} = require('pg');

const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:'finance_dashboard',
    port:5432,
})

module.exports = pool;
