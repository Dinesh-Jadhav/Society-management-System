
exports.service_login = function(crypto,pool){
    return function(req,res){  
        sess=req.session;
        var userName = req.body.userName;
        var password = req.body.password;
        var queryString = 'SELECT * FROM man2help_handler where username = "'+userName+'"';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err)
            {
                result.error= err;
            }
            else
            {
                if(rows.length==0)
                {
                    result.error= "User not Exist.";
                }
                else
                {
                    if (rows[0].status==1) 
                    {   //Creating hash with received password value for comparison : DR

                        var passwordn = password;//crypto.createHash('md5').update(password).digest("hex");
                        if (passwordn == rows[0].password) 
                        {
                            sess.userID = rows[0].id;
                            sess.userPrivilege = 5;
                            sess.userLevel = "serviceadmin";
                            result.success = rows[0];
                         }
                        else
                        {
                            result.error = "Password didn't match.";
                         }
                    }
                    else
                    {
                        result.error = "User Not Varified.";
                     }
                }
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.service_authenticated = function(req,res){
    var userLevel = req.params.access;
    sess=req.session;
    console.log(sess);
    var result = {};
    if(typeof sess.userID !=='undefined' && sess.userID!='' && sess.userLevel==userLevel){
        result.status = 'success';
    }else{
        result.status = 'fail';
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result)); 
};

//Logout Route Handling
exports.service_logout = function(req,res){
    var result = {};
    sess = req.session;
    sess.userID ='';
    sess.userPrivilege = 0;
    sess.userLevel = '';
    console.log(sess);
    result.success = 'Logged out successfully';
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result)); 
}