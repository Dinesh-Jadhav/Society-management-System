var mySQL = require('mysql');
var pool = mySQL.createPool({
   /* host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b1f4a2eb60ab02',
    password: 'f7192840',
    database: 'heroku_e1d0568a4f3b257'*/
    host:  'localhost',
	user:'root',
	password:'',
	database:'society_management'
});

module.exports = pool;
