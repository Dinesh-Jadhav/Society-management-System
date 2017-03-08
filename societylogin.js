exports.login = function(crypto, pool) {
    return function(req, res) {
        {
            sess = req.session;
            var manager_name = req.body.userName;
            var password = req.body.password;
            var queryString = 'SELECT sman.* FROM society_manager sman inner join block_master bm on bm.block_manager = sman.id inner join society_master sm on sm.id = bm.parent_id where email = "' + manager_name + '"';
            var result = {};
            pool.query(queryString, function(err, rows, fields) {
                if (err) {
                    result.error = err;
                } else {

                    if (rows.length == 0) {
                        result.error = "Manager not Exist.";
                    } else {
                        if (rows[0].status == 1) { //Creating hash with received password value for comparison : DR
                            var passwordn = crypto.createHash('md5').update(password).digest("hex");
                            if (passwordn == rows[0].password) {
                                sess.userID = rows[0].id;
                                sess.userPrivilege = 1;
                                sess.userLevel = "societyManager";
                                result.success = rows[0];
                            } else {
                                result.error = "Password didn't match.";
                            }
                        } else {
                            result.error = "User Not Varified.";
                        }
                    }
                }
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            });
        };
    };
};




exports.resetPasswordProcess = function(transporter, randomstring, pool) {
    return function(req, res) {
        var email = req.body.email;
        var result = {};
        var host = req.protocol + '://' + req.headers.host + '/';
        var queryString = 'select * from society_manager where email ="' + email + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log('1');
            } else {
                if (rows.length == 0) {
                    result.error = "Email Not Exist";
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));
                } else {
                    var id = rows[0].id;
                    var userObj = rows[0];
                    var randS = randomstring.generate();
                    queryString1 = 'UPDATE society_manager SET forget_token= "' + randS + '" where id = ' + id;
                    pool.query(queryString1, function(err, rows, fields) {
                        if (err) {
                            result.error = err;
                            result.success = "Please contact Administrator";
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(result));
                        } else {
                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: userObj.email,
                                subject: 'Reset Password',
                                html: 'Hey ' + userObj.manager_name + '!<br/> Please click <a href="' + host + '/dashboard/#/manager-new-password/' + randS + '/' + userObj.id + '">here</a> to Reset Password!'
                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Message sent');
                                }
                            });
                            result.success = "Please check mail to reset password";
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    };
};

exports.confirmToken = function(pool) {
    return function(req, res) {
        var token = req.body.token;
        var id = req.body.userid;
        var result = {};
        var queryString = 'select * from society_manager where  forget_token ="' + token + '" and id = "' + id + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            } else {
                if (rows.length == 0) {
                    result.error = "You are not authorize to change password for the user";
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));
                } else {
                    result.succes = "go";
                    result.id = id;
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));
                }
            }
        });
    };
};

exports.updatePassword = function(crypto, pool) {
    return function(req, res) {
        var id = req.body.id;
        var newpass = req.body.pass;
        var passwordn = crypto.createHash('md5').update(newpass).digest("hex");
        var result = {};
        var queryString = 'UPDATE society_manager SET  password ="' + passwordn + '",forget_token=""  where id = "' + id + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            } else {
                result.succes = "Your Password has been changed successfully.";
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            }
        });
    };
};
