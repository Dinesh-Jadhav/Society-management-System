var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');

app.set('views', __dirname + '/vehicle-admin');
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

var path = require('path');
// view engine setup

app.set('views', __dirname + '/vehicle-admin');
app.set('view engine', 'ejs');

app.get('/',function(req,res){
    sess = req.session;
    var username = req.body.username;
    var password = req.body.password;
    
 res.render("index.html");

    var con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'vehicle_admin'
    });
        
    con.connect(function(err){
var result = con.query("SELECT * FROM `user_master` WHERE `username`='" + req.body.username + "'");
       

if(err){
    console.log('Database connection error');
  }else{
    console.log('Database connection successful');
   
              
  }
  console.log(result);

});



});


app.listen(3000,function(){
console.log("App Started on PORT 3000");
});