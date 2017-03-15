
exports.addResident = function(pool, randomstring, crypto, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var email = req.body.email;
        var id = req.body.id;

        var result = {};
        var queryString = 'select * from residents where email ="' + email + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
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

                    var query = "SELECT LCASE(concat(sm.slug, '-', bm.slug, '-', fm.flat_number)) as user_name FROM society_master as sm INNER JOIN block_master as bm on sm.id=bm.parent_id INNER JOIN flat_master as fm on bm.id=fm.block_id WHERE fm.id=" + id;

                    pool.query(query, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                            result.error = err;
                            res.send(JSON.stringify(result));
                            return;
                        } else {
                            var user_name = rows[0].user_name;
                            var text = "";
                            var randS = randomstring.generate();
                            for (var i = 0; i < 10; i++) {
                                text += randS.charAt(Math.floor(Math.random() * randS.length));
                            }

                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: email,
                                subject: 'Welcome to Man2Help',
                                html: 'Hello Resident !<br/>Your username is: ' + user_name + '<br/>Your password is: ' + text + ' '

                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    var query = "INSERT INTO residents (`flat_id`,`user_name`,`password`,`email`, `resident_no`,`status`) VALUES(" + id + ",'" + user_name + "','" + text + "','" + email + "','1', '1') ON DUPLICATE KEY UPDATE email='" + email + "', password='" + text + "', resident_no=resident_no+1,first_name='', last_name='', ownership='', contact_no='', registory_no='', loan=''";
                                    pool.query(query, function(err, rows, fields) {
                                        if (err) {
                                            console.log(err);
                                            result.error = err;
                                            res.send(JSON.stringify(result));
                                        } else {
                                            var queryString = "update flat_master set is_updated=1 where id='" + id + "'";
                                            pool.query(queryString, function(err, rows, fields) {});

                                            result.success = "Resident Registered Successfully";
                                            res.send(JSON.stringify(result));
                                            return;
                                        }
                                    });
                                };
                            });
                        };
                    });
                };
            };
        });
    };
};


/*exports.addResident = function(pool, randomstring, crypto, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var email = req.body.email;
        var id = req.body.id;

        var result = {};
        /*var queryString = 'select * from residents where email ="' + email + '"';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
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

                    var query = "SELECT LCASE(concat(sm.slug, '-', bm.slug, '-', fm.flat_number)) as user_name FROM society_master as sm INNER JOIN block_master as bm on sm.id=bm.parent_id INNER JOIN flat_master as fm on bm.id=fm.block_id WHERE fm.id=" + id;

                    pool.query(query, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                            result.error = err;
                            res.send(JSON.stringify(result));
                            return;
                        } else {
                            var user_name = rows[0].user_name;
                            var text = "";
                            var randS = randomstring.generate();
                            for (var i = 0; i < 10; i++) {
                                text += randS.charAt(Math.floor(Math.random() * randS.length));
                            }

                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: email,
                                subject: 'Welcome to Man2Help',
                                html: 'Hello Resident !<br/>Your username is: ' + user_name + '<br/>Your password is: ' + text + ' '

                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    var query = "INSERT INTO residents (`flat_id`,`user_name`,`password`,`email`, `resident_no`,`status`) VALUES(" + id + ",'" + user_name + "','" + text + "','" + email + "','1', '1') ON DUPLICATE KEY UPDATE email='" + email + "', password='" + text + "', resident_no=resident_no+1,first_name='', last_name='', ownership='', contact_no='', registory_no='', loan=''";
                                    pool.query(query, function(err, rows, fields) {
                                        if (err) {
                                            console.log(err);
                                            result.error = err;
                                            res.send(JSON.stringify(result));
                                        } else {
                                            var queryString = "update flat_master set is_updated=1 where id='" + id + "'";
                                            pool.query(queryString, function(err, rows, fields) {});

                                            result.success = "Resident Registered Successfully";
                                            res.send(JSON.stringify(result));
                                            return;
                                        }
                                    });
                                };
                            });
                        };
                    });
                /*};
            };
        });
    };
};
*/

exports.login = function(crypto, pool) {
    return function(req, res) {
        sess = req.session;
        var user_name = req.body.userName;
        var password = req.body.password;
        var queryString = 'SELECT r.*,fm.flat_number FROM residents r INNER join flat_master fm on fm.id = r.flat_id INNER join block_master bm on bm.id = fm.block_id INNER join society_master sm on sm.id = bm.parent_id where r.user_name = "' + user_name + '"';

        var result = {};

        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                if (rows.length == 0) {
                    result.error = "Resident not Exist.";
                } else {
                    if (rows[0].status == 1) { //Creating hash with received password value for comparison : DR
                        var passwordn = password;
                        if (passwordn != rows[0].password) {
                            result.error = "Password didn't match.";
                        } else {
                            sess.userID = rows[0].id;
                            sess.userPrivilege = 1;
                            sess.userLevel = "Resident";
                            result.success = rows[0];
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

exports.resetPasswordProcess = function(transporter, randomstring, pool) {
    return function(req, res) {
        var email = req.body.email;
        var result = {};
        var host = req.protocol + '://' + req.headers.host + '/';
        var queryString = 'select * from residents where email ="' + email + '"';
        res.setHeader('Content-Type', 'application/json');
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                if (rows.length == 0) {
                    result.error = "Email Not Exist";
                    res.send(JSON.stringify(result));
                } else {
                    var text = "";
                    var randS = randomstring.generate();
                    for (var i = 0; i < 10; i++) {
                      text += randS.charAt(Math.floor(Math.random() * randS.length));
                            }
                    //var emailid = "dinesh.jadhav@deltabee.com";
                    transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: email,
                        subject: 'Reset Password',
                        html: 'Hey Resident!<br/> Your Login Details For Man2Help Resident Login are: <br>Username: <b>' + rows[0].user_name + '</b> <br> Passsword: <b>' + text + '</b>'
                    }, function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            var q = 'update residents set password = "'+text+'" where email ="' + email + '"';
                            pool.query(q,function(err,rows){
                                if(err){
                                    console.log(err);
                                      }else{
                                       console.log('Message sent');            
                                      }
                            })
                            
                        }
                    });
                }
                result.success = "Your Password Has been sent to your Email";
                res.send(JSON.stringify(result));
            };
        });
    };
};
    
exports.confirmToken = function(pool) {
    return function(req, res) {
        var token = req.body.token;
        var id = req.body.userid;
        var result = {};

        var queryString = 'select * from residents where  forget_token ="' + token + '" and id = "' + id + '"';
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
        var queryString = 'UPDATE residents SET  password ="' + passwordn + '",forget_token=""  where id = "' + id + '"';
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

exports.getresidentList = function(pool) {
    return function(req, res) {

        var draw = req.query.draw;
        var start = req.query.start;
        var length = req.query.length;
        var search_key = req.query.search.value;
        var end = parseInt(start) + parseInt(length);

        var pageSize = length != null ? parseInt(length) : 0;
        var skip = start != null ? parseInt(start) : 0;
        var recordsTotal = 0;
        var block_id = req.query.id;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select r.*, fm.flat_number from  `residents` r INNER join flat_master fm on fm.id=r.flat_id where fm.block_id = '" + block_id + "'";
        if (search_key != '') {
            query += ' and (r.first_name like "%' + search_key + '%" or r.last_name like  "%' + search_key + '%" or r.email like  "%' + search_key + '%" or r.id like  "%' + search_key + '%" or fm.flat_number like  "%' + search_key + '%")';
        }

        query += " order by r.id desc";
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

exports.getSimpleResidentListOfBlock = function(pool) {
    return function(req, res) {
        var block_id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select r.*, fm.flat_number from  `residents` r INNER join flat_master fm on fm.id=r.flat_id where fm.block_id = '" + block_id + "'";
        query += " order by r.id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.status = 200;
                result.success = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.getresidentInfo = function(pool) {
    return function(req, res) {
        var residentID = req.query.id;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select rm.*, rs.*,pm.name as parking_name ,bm.id as block_id, fm.flat_number, fm.storey_number, fm.type_of_flat, fm.area, fm.location, bm.name as block_name, bm.block_manager, sm.name as society_name, sm.society_manager from flat_master as fm inner join residents as rs on rs.flat_id=fm.id left join resident_meta as rm on rs.id=rm.resident_id inner join block_master as bm on fm.block_id=bm.id inner join society_master as sm on bm.parent_id=sm.id left join flat_parking_association fpa ON fpa.flat_id=fm.id LEFT JOIN parking_master pm ON pm.id = fpa.parking_id where rs.id='" + residentID + "'";
        //console.log(query);
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = JSON.stringify(rows[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.tenantList = function(pool) {
    return function(req, res) {
        var draw = req.query.draw;
        var start = req.query.start;
        var length = req.query.length;
        var search_key = req.query.search.value;
        var end = parseInt(start) + parseInt(length);

        var pageSize = length != null ? parseInt(length) : 0;
        var skip = start != null ? parseInt(start) : 0;
        var recordsTotal = 0;
        var block_id = req.query.id;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select t.*,tm.*,concat(r.first_name, ' ', r.last_name) as owner, fm.flat_number from  `tenant_master` t INNER join tenant_master_meta tm on tm.tenant_id=t.id INNER join residents r on r.id=t.resident_id INNER join flat_master fm on fm.id=r.flat_id where fm.block_id = '" + block_id + "'";
        if (search_key != '') {
            query += ' and (r.first_name like "%' + search_key + '%" or r.last_name like  "%' + search_key + '%" or r.email like  "%' + search_key + '%" or r.id like  "%' + search_key + '%" or fm.flat_number like  "%' + search_key + '%" or t.name like  "%' + search_key + '%")';
        }

        query += " order by r.id desc";
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

exports.getFlatResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var flat_id = req.body.id;
        var result = {};
        console.log(req.body);
        if (flat_id == '') {
            result.error = 'Please Pass Flat Id to Get Details';
            res.send(JSON.stringify(result));
            return;
        }
        var query = 'select * from residents where flat_id = "' + flat_id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                result.error = err;
                res.send(JSON.stringify(result));
                return;
            }
            console.log(rows);
            if (rows.length == 0) {
                result.error = "Details Not Found.";
                res.send(JSON.stringify(result));
                return;
            }
            result.success = rows[0];
            res.send(JSON.stringify(result));
            return;
        });
    }
};

exports.residentProfile = function(pool) {
    return function(req, res) {
        var residentID = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = 'SELECT ((((CASE WHEN LENGTH(r.id)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.first_name)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.last_name)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.ownership)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.email)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.contact_no)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.registory_no)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(r.loan)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.blood_group)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.date_of_birth)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.signature_file)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.aadhar_number)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.voter_id_number)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.pan_number)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.have_pet)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.have_vehicle)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.vehicle_type)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.no_of_vehicle)>0 THEN 1 ELSE 0 END)+(CASE WHEN LENGTH(rm.no_of_pets)>0 THEN 1 ELSE 0 END))*100)/19) as profile_percent from residents r LEFT JOIN resident_meta rm ON r.id = rm.resident_id where r.id="' + residentID + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = JSON.stringify(rows[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};
exports.updateresidentProfile = function(pool) {
    return function(req, res) {

        $data = req.body;
        var residentID = $data.id;
        var fName = $data.first_name;
        var lName = $data.last_name;
        var contact_no = $data.contact_no;
        var reg_no = $data.registory_no;
        var loan = $data.loan;
        var owner = $data.ownership;
        var result = {};
        var query = "UPDATE residents SET first_name='" + fName + "', last_name='" + lName + "', contact_no='" + contact_no + "', registory_no='" + reg_no + "',ownership='" + owner + "', loan='" + loan + "' WHERE id='" + residentID + "' ";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.success = "Details Updated Successfully";
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    }
};

exports.addTenant = function(pool, step) {
    return function(req, res) {
        var id = req.body.id;
        var name = req.body.name;
        var contact_no = req.body.contact_no;
        var email = req.body.email;
        var resident_id = req.body.resident_id;
        var status = req.body.status;
        var moveInDate = req.body.move_in_date;

        var datetimestamp = Date.now();
        var proof_id = req.body.id_proof;
        var agreement_id = req.body.agreement;
        var type = req.body.type;
        var result = {};

        var id_proof = '';
        var agreementImg = '';

        if (name == '' || contact_no == '' || email == '' || req.body.moveDate == '' || proof_id == '' || agreement_id == '') {
            result.error = 'Parameter Missing';
            res.send(JSON.stringify(result));
            return;
        }
        step(
            function getuploaded() {
                pool.query("select imgName from image_temp where id='" + proof_id + "'", this);
            },
            function idProof(err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    if (rows.length > 0) {
                        id_proof = rows[0].imgName;
                    }
                    pool.query("select imgName from image_temp where id='" + agreement_id + "'", this);
                }
            },
            function agreement(err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    if (rows.length > 0) {
                        agreementImg = rows[0].imgName;
                    }
                    pool.query("insert into tenant_master(name, contact_no, email, resident_id, id_proof, agreement, move_in_date,type, status) values('" + name + "', '" + contact_no + "', '" + email + "', '" + resident_id + "', '" + id_proof + "', '" + agreementImg + "', '" + moveInDate + "', '" + type + "', 1)", this);
                }
            },
            function insertResponse(err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    result.lastInsertId = rows.insertId;
                    result.success = 'true';
                    pool.query("delete from image_temp where id='" + proof_id + "' or id='" + agreement_id + "'", this);
                }
            },
            function successHandler(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    result.success = 'success';
                    res.send(JSON.stringify(result));
                }
            }
        );
    };
};

exports.getTenantList = function(pool) {
    return function(req, res) {
        var id = req.query.resident_id;
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
        var query = 'select t.*, tm.status as resident_status, tm.move_out_date from  `tenant_master` t inner join tenant_master_meta tm on tm.tenant_id = t.id where t.resident_id="' + id + '"';
        if (search_key != '') {
            query += ' and(t.name like "%' + search_key + '%" or t.email like  "%' + search_key + '%")';
        }

        query += ' order by id desc';
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

exports.updateTenantMeta = function(pool) {
    return function(req, res) {
        var request = req.body; /*In post method*/
        var tenantId = request.tenant_id;
        var advance = request.advance;
        var advance_des = request.advance_des;
        var brokerage = request.brokerage;
        var rent = request.rent;
        var start_date = request.date;
        var due_days = request.due_days;
        var electricity_reading = request.ele_red;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        if (tenantId == '' || advance == '' || advance_des == '' || brokerage == '' || rent == '' || start_date == '' || due_days == '' || electricity_reading == '' || tenantId === 'undefined' || advance === 'undefined' || advance_des === 'undefined' || brokerage === 'undefined' || rent === 'undefined' || start_date === 'undefined' || due_days === 'undefined' || electricity_reading === 'undefined') {
            result.error = "Parameter Missing";
            res.send(JSON.stringify(result));
            return;
        }
        var query = 'insert into tenant_master_meta(tenant_id, advance, advance_description, brokerage, rent, start_date, due_days, electricity_reading) values("' + tenantId + '", "' + advance + '", "' + advance_des + '", "' + brokerage + '", "' + rent + '", "' + start_date + '", "' + due_days + '", "' + electricity_reading + '")';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.err = err;
                res.send(JSON.stringify(result));
                return;
            } else {
                result.success = "Details Updated Successfully";
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.tenantDetail = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select t.*,tm.*, concat(r.first_name, ' ', r.last_name) as owner_name,r.contact_no as owner_contact, r.email as owner_email, fm.flat_number from tenant_master as t inner join tenant_master_meta as tm on t.id=tm.tenant_id INNER join residents r ON t.resident_id=r.id INNER join flat_master fm on fm.id=r.flat_id where t.id='" + id + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.err = err;
            } else {
                result.success = JSON.stringify(rows[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.neighbourList = function(pool) {
    return function(req, res) {
        var id = req.query.id;
        var storey_number = req.query.storey_number;
        var block_id = req.query.block_id;

        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = "select concat(r.first_name, ' ',r.last_name) as name,r.id, r.ownership,r.email,r.contact_no,fm.flat_number,fm.storey_number,bm.name as block_name from residents as r inner join flat_master as fm on r.flat_id=fm.id inner join block_master as bm on fm.block_id=bm.id where fm.storey_number='" + storey_number + "' and bm.id='" + block_id + "' and r.id!='" + id + "'";
        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
                result.err = err;
                res.send(JSON.stringify(result));
                return;
            } else {
                result.success = JSON.stringify(rows);
                res.send(JSON.stringify(result));
                return;
            }
        });
    };
};
/*
exports.updateresidentProfileAllDetails = function(pool) {
    return function(req, res) {
        var request = req.body;
        //console.log(JSON.stringify(req.body));    
        var resident_id = request.resident_id;
        
        var name = request.name;
        var ownership = request.ownership;
        var contact_no = request.contact_no;
        var str = name.split(' ');
        var first_name = str[0];
        var last_name = str[1];
        if (typeof(str[2]) != "undefined" && str[2] !== null) {
            last_name = last_name + " " + str[2];
        }
        var vehicle_type
        if(request.vehicle_type==true){
            vehicle_type= 1;
        }else if(request.vehicle_type1==true){
            vehicle_type= 2;
        }else if((request.vehicle_type1==true) && (request.vehicle_type==true)){
            vehicle_type= 3;
        }else{
            vehicle_type= 0;
        }


        
        var blood_group = request.blood_group;
        var date_of_birth = request.date_of_birth;
        var aadhar_number = request.aadhar_number;
        var voter_id_number = request.voter_id_number;
        var pan_number = request.pan_number;
        var have_pet = request.have_pet;
        var have_vehicle = request.have_vehicle;
         
        var no_of_vehicle = request.no_of_vehicle;
        var no_of_pets = request.no_of_pets;
        var contact_no = request.contact_no;
        var signature_file = request.signature_file;

                var signatureId = request.signature;
        var signatureImg = '';

        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = "select imgName from image_temp where id='" + signatureId + "'";

        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
                result.err = err;
                res.send(JSON.stringify(result));
                return;
            } else {
                if (rows.length > 0) {
                    signatureImg = rows[0].imgName;
                } else {
                    signatureImg = signature_file;
                }

                var UpdateMasterQuery = 'update residents set first_name="' + first_name + '", last_name="' + last_name + '", contact_no="' + contact_no + '", ownership="' + ownership + '" where id="' + resident_id + '"';

                pool.query(UpdateMasterQuery, function(err, rows) {
                    if (err) {
                        console.log(err);
                        result.err = err;
                        res.send(JSON.stringify(result));
                        return;
                    } else {
                        var InsertOrUpdateMetaQuery = 'insert into resident_meta(resident_id, blood_group, date_of_birth, signature_file, aadhar_number, voter_id_number, pan_number, have_pet, have_vehicle, vehicle_type, no_of_vehicle, no_of_pets, status) values("' + resident_id + '", "' + blood_group + '", "' + date_of_birth + '", "' + signatureImg + '", "' + aadhar_number + '", "' + voter_id_number + '", "' + pan_number + '", "' + have_pet + '","' + have_vehicle + '", "' + vehicle_type + '", "' + no_of_vehicle + '", "' + no_of_pets + '","1") ON DUPLICATE KEY update blood_group="' + blood_group + '", date_of_birth="' + date_of_birth + '", signature_file="' + signatureImg + '", aadhar_number="' + aadhar_number + '", voter_id_number="' + voter_id_number + '", pan_number="' + pan_number + '", have_pet="' + have_pet + '", have_vehicle="' + have_vehicle + '", vehicle_type="' + vehicle_type + '", no_of_vehicle="' + no_of_vehicle + '", no_of_pets="' + no_of_pets + '"';
                        pool.query(InsertOrUpdateMetaQuery, function(err, rows) {
                            if (err) {
                                console.log(err);
                                result.err = err;
                                res.send(JSON.stringify(result));
                                return;
                            } else {
                                result.success = "Details Updated Successfully !"
                                res.send(JSON.stringify(result));
                                return;
                            }
                        });
                    }
                });
            }
        });
    };
};*/
exports.updateresidentProfileAllDetails = function(pool) {
    return function(req, res) {
        var request = req.body;
        //console.log(JSON.stringify(req.body));    
        var resident_id = request.resident_id;
        /*For Master*/
        var name = request.name;
        var ownership = request.ownership;
        var contact_no = request.contact_no;
        var str = name.split(' ');
        var first_name = str[0];
        var last_name = str[1];
        if (typeof(str[2]) != "undefined" && str[2] !== null) {
            last_name = last_name + " " + str[2];
        }
       
        /*For Meta*/
        var blood_group = request.blood_group;
        var date_of_birth = request.date_of_birth;
        var aadhar_number = request.aadhar_number;
        var voter_id_number = request.voter_id_number;
        var pan_number = request.pan_number;
        var vehicle_type=request.vehicle_type;
        var vehicle_type1=request.vehicle_type1;
        var have_pet = request.have_pet;
        var have_vehicle = request.have_vehicle;
        var four_wheeler = request.four_wc; 
        var no_of_vehicle = request.no_of_vehicle;
        var no_of_pets = request.no_of_pets;
        var contact_no = request.contact_no;
        var signature_file = request.signature_file;
        var id_image = request.id_image;
        /*To Get Uploaded File Id*/
        var signatureId = request.signature;
        var signatureImg = '';
        var profileId = request.idProof;
        var profileImg = '';


        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = "select imgName from image_temp where id='" + signatureId + "'";

        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
                result.err = err;
                res.send(JSON.stringify(result));
                return;
            } else {
                if (rows.length > 0) {
                    signatureImg = rows[0].imgName;
                } else {
                    signatureImg = signature_file;
                }

                var UpdateMasterQuery = 'update residents set first_name="' + first_name + '", last_name="' + last_name + '", contact_no="' + contact_no + '", ownership="' + ownership + '" where id="' + resident_id + '"';

                pool.query(UpdateMasterQuery, function(err, rows) {
                    if (err) {
                        console.log(err);
                        result.err = err;
                        res.send(JSON.stringify(result));
                        return;
                    } else {
                        
        var query1 = "select imgName from image_temp where id='" + profileId + "'";

        pool.query(query1, function(err, rows) {
            if (err) {
                console.log(err);
                result.err = err;
                res.send(JSON.stringify(result));
                return;
            } else {
                if (rows.length > 0) {
                    profileImg = rows[0].imgName;
                     var InsertOrUpdateMetaQuery = 'insert into resident_meta(resident_id, blood_group, date_of_birth, signature_file,id_image, aadhar_number, voter_id_number, pan_number, have_pet, have_vehicle, vehicle_type, no_of_vehicle, no_of_pets, status,vehicle_type1,four_wc) values("' + resident_id + '", "' + blood_group + '", "' + date_of_birth + '", "' + signatureImg + '","'+profileImg+'", "' + aadhar_number + '", "' + voter_id_number + '", "' + pan_number + '", "' + have_pet + '","' + have_vehicle + '", "' + vehicle_type + '", "' + no_of_vehicle + '", "' + no_of_pets + '","1","' + vehicle_type1 + '","' + four_wheeler + '") ON DUPLICATE KEY update blood_group="' + blood_group + '", date_of_birth="' + date_of_birth + '", signature_file="' + signatureImg + '",id_image="' + profileImg + '", aadhar_number="' + aadhar_number + '", voter_id_number="' + voter_id_number + '", pan_number="' + pan_number + '", have_pet="' + have_pet + '", have_vehicle="' + have_vehicle + '", vehicle_type="' + vehicle_type + '", no_of_vehicle="' + no_of_vehicle + '", no_of_pets="' + no_of_pets + '", vehicle_type1="' + vehicle_type1 + '",four_wc="' + four_wheeler + '"';
                        pool.query(InsertOrUpdateMetaQuery, function(err, rows) {
                            if (err) {
                                console.log(err);
                                result.err = err;
                                res.send(JSON.stringify(result));
                                return;
                            }else{
                                result.success='Result Displayed Successfully';
                                res.send(JSON.stringify(result));
                            }
                        });
                } 
                else {
                    profileImg = id_image;
                    var InsertOrUpdateMetaQuery = 'insert into resident_meta(resident_id, blood_group, date_of_birth, signature_file,id_image, aadhar_number, voter_id_number, pan_number, have_pet, have_vehicle, vehicle_type, no_of_vehicle, no_of_pets, status,vehicle_type1,four_wc) values("' + resident_id + '", "' + blood_group + '", "' + date_of_birth + '", "' + signatureImg + '","'+profileImg+'", "' + aadhar_number + '", "' + voter_id_number + '", "' + pan_number + '", "' + have_pet + '","' + have_vehicle + '", "' + vehicle_type + '", "' + no_of_vehicle + '", "' + no_of_pets + '","1","' + vehicle_type1 + '","' + four_wheeler + '") ON DUPLICATE KEY update blood_group="' + blood_group + '", date_of_birth="' + date_of_birth + '", signature_file="' + signatureImg + '",id_image="' + profileImg + '", aadhar_number="' + aadhar_number + '", voter_id_number="' + voter_id_number + '", pan_number="' + pan_number + '", have_pet="' + have_pet + '", have_vehicle="' + have_vehicle + '", vehicle_type="' + vehicle_type + '", no_of_vehicle="' + no_of_vehicle + '", no_of_pets="' + no_of_pets + '", vehicle_type1="' + vehicle_type1 + '",four_wc="' + four_wheeler + '"';
                        pool.query(InsertOrUpdateMetaQuery, function(err, rows) {
                            if (err) {
                                console.log(err);
                                result.err = err;
                                res.send(JSON.stringify(result));
                                return;
                            }
                            else{
                                result.success='Result Displayed Successfully';
                                res.send(JSON.stringify(result));
                            }
                        });
                }
            }
        });
                   

                    }
                });
            }
        });
    };
};
exports.tenantMoveOut = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var move_out_date = req.body.move_out_date;

        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = 'update tenant_master_meta set status=1, move_out_date="' + move_out_date + '" where id="' + id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.err = err;
            } else {
                result.success = "Updated Successfully!";
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.knowTenantAssignment = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = 'select t.id, tm.id as meta_id from tenant_master t INNER join tenant_master_meta tm on t.id=tm.tenant_id where t.resident_id="' + id + '" and tm.status=0';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.err = err;
            } else {
                if (rows.length > 0) {
                    result.success = false;
                } else {
                    result.success = true;
                }
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.residentsBlockId = function(pool) {
    return function(req, res) {
        var resident_id = req.body.resident_id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = 'select bm.id from residents r INNER JOIN flat_master fm ON r.flat_id = fm.id INNER JOIN block_master bm On bm.id = fm.block_id where r.id="' + resident_id + '"';
        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
                result.err = err;
            } else {
                result.success = rows[0];
                res.send(JSON.stringify(result));
            }
        });
    }
};

exports.getBlockId = function(pool) {
    return function(req, res) {
        var resident_id = req.body.id;
        var result = {};
        var Q = 'select fm.block_id from flat_master fm inner join residents r On r.flat_id = fm.id where r.id = "' + resident_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows[0];
                res.send(JSON.stringify(result));
            }
        })
    }
}

exports.totalResident=function(pool){
    return function(req,res){
    var block_id = req.body.id;
    var result = {};
             
    var Q = 'select count(r.id) as res from residents r INNER JOIN flat_master fm ON fm.id = r.flat_id WHERE fm.block_id = "'+block_id+'"'
    pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows[0];
                res.send(JSON.stringify(result));
            }
        });   
    }
}

