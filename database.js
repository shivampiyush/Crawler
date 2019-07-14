var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database: 'webScrapper'

});

connection.connect();

module.exports = connection;
