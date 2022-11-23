const mysql = require('mysql');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    port : 3306,
    database : 'node_api',
    multipleStatements : true
});

connection.connect((err) => {
if (err) throw err;
console.log('database connected');
});

module.exports = connection;