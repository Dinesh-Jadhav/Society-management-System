exports.getmanagerList = function(pool) {
    return function(req, res) {

        var draw = req.query.draw;
        var start = req.query.start;
        var length = req.query.length;
        var search_key = req.query.search.value;
        var end = parseInt(start) + parseInt(length);

        var pageSize = length != null ? parseInt(length) : 0;
        var skip = start != null ? parseInt(start) : 0;
        var recordsTotal = 0;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select *,DATE_FORMAT(added_date, '%d %M, %Y %h:%m') as added_date from  `society_manager`";
        if (search_key != '') {
            query += ' WHERE manager_name like "%' + search_key + '%" or email like "%' + search_key + '%"';
        }

        query += " order by id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.draw = draw;
                recordsTotal = rows.length;
                result.recordsTotal = recordsTotal;

                var resultData = []
                resultData.push(rows.slice(skip, parseInt(skip) + parseInt(pageSize)));

                result.recordsFiltered = recordsTotal;
                result.success = JSON.stringify(resultData[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.ActiveManagersList = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select * from  `society_manager` where status=1 order by id desc";

        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = JSON.stringify(rows);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.ActiveManagersListCount = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select count(id) as M_count from  `society_manager` where status=1 order by id desc";

        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = rows[0];
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.addManager = function(pool, randomstring, crypto, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var email = req.body.email;
        var result = {};
        var queryString = 'select * from society_manager where email ="' + email + '"';
        pool.query(queryString, function(err, rows, fields) {
        if (err) {
                console.log(err);
                result.error = err;
                res.send(JSON.stringify(result));
                return;
            } else {
                if (rows.length > 0) {
                result.error = "Email Already Exist";
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
                return;
            } else {
                $data = req.body;
                var idType = $data.idType;
                var idNumber = $data.idNumber;
                var manager_name = $data.manager_name;
                var email = $data.email;
                var image = $data.image;
                var description = $data.description;
                var merchant_key = $data.merchant_key;
                var merchant_id = $data.merchant_id;
                var merchant_salt = $data.merchant_salt;
                var phoneNumber = $data.phonenumber;
                var text = "";
                var randS = randomstring.generate();
                for (var i = 0; i < 8; i++) {
                    text += randS.charAt(Math.floor(Math.random() * randS.length));
                }
                var password = crypto.createHash('md5').update(text).digest("hex");
                var queryString = "select * from image_temp where id='" + image + "'";
                pool.query(queryString, function(err, rows, fields) {
                    if (err) {
                    result.error = err;
                    res.send(JSON.stringify(result));
                    }else{
            if(rows.length>0){
            var image1 = rows[0].imgName;
            var query = "INSERT INTO society_manager (`idType`,`idNumber`, `manager_name`,  `email`,`password`,`description`,`status`,`added_date`,`idImage`,`Phone_Number`) VALUES ('" + idType + "','" + idNumber + "','" + manager_name + "','" + email + "','" + password + "','" + description + "','1',now(),'"+image1+"','"+phoneNumber+"')";
            pool.query(query, function(err, rows, fields) {
            if (err) {
            console.log(err);
            result.error = err;
            res.send(JSON.stringify(result));
            return;
            } else {
            transporter.sendMail({
            from: 'man2helpsm@gmail.com',
            to: email,
            subject: 'Check  Id & Password',
            html: 'Hey ' + manager_name + '<br/>Your id is: ' + email + '<br/>Your password is: ' + text + ' '

            }, function(error, response) {
            if (error) {
            console.log(error);
            } else {
            console.log('Message sent');
            }

            });
            if (rows.insertId > 0) {
            var manager_id = rows.insertId;
            var merchant_id = req.body.merchant_id;
            var marchant_key = req.body.marchant_key;
            var marchant_salt = req.body.marchant_salt;
            var Q = 'INSERT INTO society_manager_meta(`merchant_id`, `marchant_key`, `marchant_salt`, `manager_id`, `status`) VALUES ("' + merchant_id + '","' + marchant_key + '","' + marchant_salt + '","' + manager_id + '","1")';
            pool.query(Q, function(err, rows, fields) {
            if (err) {
            console.log(err);
            result.error = err;
            } else {
            result.success = "Manager Registered Successfully";
            res.send(JSON.stringify(result));
            return;
            }
            });
            };
            }
            });
            }; 
            };
            });
            }
        }
       }); 
    };
    };

exports.societyBlockList = function(pool) {
    return function(req, res) {
        sess = req.session;
        var id = sess.userID;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "SELECT sm.name as society_name, bm.name as block_name, bm.id FROM block_master as bm INNER JOIN society_master as sm on sm.id=bm.parent_id where bm.block_manager='" + id + "' and bm.status= 1 ";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    };
};

exports.checkForSocietyManager = function(pool) {
    return function(req, res) {
        var managerId = req.body.managerId;
        var blockId = req.body.block_id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.*, bm.id as block_id from  society_master sm INNER JOIN block_master bm on bm.parent_id=sm.id where sm.society_manager = '" + managerId + "' and bm.id = '" + blockId + "' and sm.status =1 ";

        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                if (rows.length > 0) {
                    result.is_societymanager = 1;
                } else {
                    result.is_societymanager = 0;
                }
                res.send(JSON.stringify(result));
                return;
            }
        });
    };
};

exports.deleteManager = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var result = {}
        pool.query("DELETE FROM society_manager WHERE id=?", [id], function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.success = "Manager deleted successfully";
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.updatePassword = function(crypto, pool) {
    return function(req, res) {
        sess = req.session;
        var id = sess.userID;
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

exports.paymentDuesFromManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {};
        var queryString = 'select vm.vendor_name,vm.email,vm.contact,vm.merchant_id,vm.merchant_key,vm.merchant_salt,vm.payuavailable,jm.id ,jm.contract_type,jm.job_card_type,jm.start_date,jm.charge,mm.category from vendor_master vm INNER JOIN job_card_master jm ON vm.id = jm.vendor_id INNER JOIN maintainace_category_master mm ON mm.id = jm.category_id where jm.block_id = "' + block_id + '" and jm.status="-1"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.succes = "Display Due data to manager successfully.";
                res.send(JSON.stringify(result));
            }
        });
    };
};



exports.paymentDuesFromManagerForUpdate = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var job_id = req.body.id;
        var result = {};
        var queryString = 'select vm.email as vendor_email,vm.contact as contact,vm.merchant_key as merchant_key,vm.merchant_salt as merchant_salt,vm.id as vendor_id,jm.id as jobcard_id,vm.vendor_name,vm.email,vm.contact,vm.merchant_id,vm.merchant_key,vm.merchant_salt,vm.payuavailable,jm.id ,jm.contract_type,jm.job_card_type,jm.pay_type,jm.start_date,jm.charge,mm.category from vendor_master vm INNER JOIN job_card_master jm ON vm.id = jm.vendor_id INNER JOIN maintainace_category_master mm ON mm.id = jm.category_id where jm.id = "' + job_id + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows[0];
                var Q = 'update job_card_master set status ="' + rows[0].pay_type + '" where id="' + rows[0].jobcard_id + '"';
                pool.query(Q, function(err, rows) {
                    if (err) {
                        console.log(err);
                    }
                })
                result.success = " successfully.";
                res.send(JSON.stringify(result));
            }
        });
    };
};

exports.paymentDuesFromManagerForSinglePay = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var job_id = req.body.id;
        var block_id = req.body.block_id;
        var result = {};
        var queryString = 'select vm.email as vendor_email,vm.contact as contact,vm.merchant_key as merchant_key,vm.merchant_salt as merchant_salt,vm.id as vendor_id,jm.id as jobcard_id,vm.vendor_name,vm.email,vm.contact,vm.merchant_id,vm.merchant_key,vm.merchant_salt,vm.payuavailable,jm.id ,jm.contract_type,jm.job_card_type,jm.pay_type,jm.start_date,jm.charge,mm.category from vendor_master vm INNER JOIN job_card_master jm ON vm.id = jm.vendor_id INNER JOIN maintainace_category_master mm ON mm.id = jm.category_id where jm.id = "' + job_id + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                
                var Q = 'insert into expenses_history (`jobcard_id`,`payment_type`,`date`,`status`) values("' + job_id + '","1",now(),"1")';
                pool.query(Q, function(err, rows) {
                    if (err) {
                        console.log(err);
                    }
                });
                result.data = rows[0];
                console.log(rows);
                result.success = " successfully.";
                res.send(JSON.stringify(result));
            }
        });
    };
};

exports.getSingleManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.mgr_id;
        var result = {}
        var querystring = 'select * from society_manager where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "Manager Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.viewManagerDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.mgr_id;
        var result = {}
        var querystring = 'select * from society_manager where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "Manager Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.updateManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var mgr_id = req.body.id;
        var manager_name = req.body.manager_name;
        var email = req.body.email;
        var idType = req.body.idType;
        var idNumber = req.body.idNumber;
        var Phone_Number = req.body.Phone_Number;
        var image=req.body.image;
        var result = {};

        var Q = "select * from image_temp where id='" + image + "'";
        pool.query(Q,function(err, rows, fields) {
            if (err) {
                    result.error = err;
                    res.send(JSON.stringify(result));
                    }else{
                    if(rows.length>0){
            var image1 = rows[0].imgName;
        var querystring = 'update society_manager SET manager_name = "' + manager_name + '", email = "' + email + '",idType ="' + idType + '",idNumber ="' + idNumber + '",idImage="'+image1+'" where id="' + mgr_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Manager updated successfully";
                res.send(JSON.stringify(result));
            };
          });
        }else{
       var querystring = 'update society_manager SET manager_name = "' + manager_name + '", email = "' + email + '",idType ="' + idType + '",idNumber ="' + idNumber + '" ,Phone_Number = "'+Phone_Number +'" where id="' + mgr_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Manager updated successfully";
                res.send(JSON.stringify(result));
            };
        });
      }
    }
   });
  }
}

exports.managerDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {};
        var queryString = 'select * from society_manager';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.succes = "Display Due data to manager successfully.";
                res.send(JSON.stringify(result));
            }
        });
    };
};            