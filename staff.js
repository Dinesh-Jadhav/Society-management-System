exports.getStaffTypes = function(pool) {
    return function(req, res) {
        var result = {};
        res.setHeader('Content-Type', 'application/json');
        var queryString = "select * from staff_type where status=1"
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.status = '200';
                result.data = rows;
            }
            res.send(JSON.stringify(result));
        });
    };
};

exports.addStaff = function(pool, transporter, randomstring) {
    return function(req, res) {
        var result = {};
        res.setHeader('Content-Type', 'application/json');
        var request = req.body;
        var description = request.description;
        var availiable_for = request.availiable_for;
        var contact = request.contact;
        var email = request.email;
        var id_image = request.id_image;
        var name = request.name;
        var staff_for = request.staff_for;
        var staff_type = request.staff_type;
        var block_id = request.block_id;
        var qu = 'select * from staff_master where email="' + email + '"';
        pool.query(qu, function(err, rows, fields) {
            if (err) {
                result.error = err;
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    result.error = "Email Already Exist assigned with " + rows[0].name;
                    res.send(JSON.stringify(result));
                    return;
                } else {
                    var text = "";
                    var randS = randomstring.generate();
                    for (var i = 0; i < 10; i++) {
                        text += randS.charAt(Math.floor(Math.random() * randS.length));
                    }
                    if (staff_for == 1) {
                        transporter.sendMail({
                            from: 'man2helpsm@gmail.com',
                            to: email,
                            subject: 'Welcome to Man2Help',
                            html: 'Hello Staff Memeber !<br/>Your username is: ' + email + '<br/>Your password is: ' + text + '<br>'

                        }, function(error, response) {
                            if (error) {
                                console.log(error);
                            } else {

                            }
                        });
                    }

                    var queryString = "select * from image_temp where id='" + id_image + "'";
                    pool.query(queryString, function(err, rows, fields) {
                        if (err) {
                            result.error = err;
                            res.send(JSON.stringify(result));
                        } else {
                            if (rows.length > 0) {
                                var id_imageName = rows[0].imgName;
                                var Q = 'insert into staff_master(name, staff_for, contact_number, id_file, staff_type, availible_for,email,password, block_id,description, status) values("' + name + '", "' + staff_for + '", "' + contact + '", "' + id_imageName + '", "' + staff_type + '", "' + availiable_for + '", "' + email + '","' + text + '","' + block_id + '","' + description + '", 1 )';
                                pool.query(Q, function(err, rows, fields) {
                                    var query = "delete from image_temp where id='" + id_image + "'";
                                    pool.query(query, function(err, rows, fields) {
                                        result.status = 200;
                                        res.send(JSON.stringify(result));
                                    });
                                });
                            } else {
                                result.error = "Select ID Image."
                                res.send(JSON.stringify(result));
                            }
                        }
                    });
                }
            }
        })
    };
};

exports.staffListByBlock = function(pool) {
    return function(req, res) {
        var draw = req.query.draw;
        var start = req.query.start;
        var length = req.query.length;
        var search_key = req.query.search.value;
        var end = parseInt(start) + parseInt(length);
        var pageSize = length != null ? parseInt(length) : 0;
        var skip = start != null ? parseInt(start) : 0;
        var recordsTotal = 0;
        var block_id = req.query.blockID;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.*, st.staff_type as type from staff_master sm inner join staff_type st on st.id=sm.staff_for where sm.block_id = '" + block_id + "'";
        if (search_key != '') {
            query += ' and (sm.name like "%' + search_key + '%" or sm.contact_number like  "%' + search_key + '%" or sm.email like  "%' + search_key + '%" or sm.id like  "%' + search_key + '%")';
        }
        query += " order by sm.id desc";
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

exports.staffListByBlockSimple = function(pool) {
    return function(req, res) {
        var block_id = req.body.blockID;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.*, st.staff_type as type from staff_master sm inner join staff_type st on st.id=sm.staff_for where sm.block_id = '" + block_id + "'";
        query += " order by sm.id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.deleteStaff = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "delete from staff_master where id = '" + id + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = "Success !";
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};
exports.getStaffDetails = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.*, st.staff_type as type from staff_master sm inner join staff_type st on st.id=sm.staff_for where sm.id = '" + id + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length > 0) {
                    result.success = rows[0];
                } else {
                    result.error = "No Data Found";
                }
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};
exports.staffLogin = function(crypto, pool) {
    return function(req, res) {
        sess = req.session;
        var user_name = req.body.userName;
        var password = req.body.password;
        var queryString = 'SELECT sm.* FROM staff_master sm INNER join block_master bm on bm.id = sm.block_id INNER join society_master sMas on sMas.id = bm.parent_id where email = "' + user_name + '"';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                if (rows.length == 0) {
                    result.error = "Memeber not Exist.";
                } else {
                    if (rows[0].status == 1) {
                        var passwordn = password;
                        if (passwordn != rows[0].password) {

                            result.error = "Password didn't match.";
                        } else {
                            if (rows[0].staff_for == 1) {
                                sess.userID = rows[0].id;
                                sess.userPrivilege = 1;
                                sess.userLevel = "Staff";
                                result.success = rows[0];
                            } else {
                                result.error = "You Are Not A Security Staff.";
                            }
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

exports.servantsList = function(pool) {
    return function(req, res) {
        var $result = {};
        var staff_type = 2;
        var resident_id = req.body.id;
        var QueryString = 'SELECT stMast.* FROM residents as res INNER JOIN flat_master flatm ON res.flat_id = flatm.id INNER JOIN staff_master stMast ON flatM.block_id = stMast.block_id  WHERE res.id = "' + resident_id + '" and stMast.staff_for = "' + staff_type + '" and FIND_IN_SET(res.flat_id, availible_for)';
        pool.query(QueryString, function(err, rows) {
            if (err) {
                $result.error = err;
            } else {
                $result.success = "Staff Displayed Successfully";
                $result.data = rows;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify($result));
        });
    }
}

exports.sendDetailstoManager = function(pool, transporter) {
    return function(req, res) {
        var host = req.protocol + '://' + req.headers.host + '/';
        var result;
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var staff_type = 2; //req.body.staff_type;
        var staff_id = req.body.staff_id;
        var result = {};
        var querystring = 'select * from staff_request where resident_id="' + resident_id + '" and staff_id="' + staff_id + '" and (status=0 or status=1)';
        pool.query(querystring, function(err, resp, fields) {
            if (err) {
                result.error = err;
            } else {
                if (resp.length > 0) {
                    result.error = "You have already sent request for this person.";
                    res.send(JSON.stringify(result));
                    return;
                }
                var QueryString = "select * from staff_master where staff_for ='" + staff_type + "'and id='" + staff_id + "'";
                pool.query(QueryString, function(err, row, fields) {
                    if (err) {
                        result.error = err;
                        res.send(JSON.stringify(result));
                        return;
                    } else {
                        var staff_name = row[0].name;
                        var staff_contact_number = row[0].contact_number;
                        var staff_email = row[0].email;
                        var queryString = 'SELECT distinct SM.manager_name, SM.email as manager_email, concat(res.first_name, " ", res.last_name) as resident_name, flatm.flat_number  FROM residents as res INNER JOIN flat_master flatm ON res.flat_id = flatm.id INNER JOIN staff_master stMast ON flatM.block_id = stMast.block_id INNER JOIN block_master BM ON BM.block_manager = flatm.block_id INNER JOIN society_manager SM ON SM.id = BM.block_manager  WHERE res.id = "' + resident_id + '"'
                        pool.query(queryString, function(err, rows, fields) {
                            if (err) {
                                result.error = err;
                                console.log(err);
                                res.send(JSON.stringify(result));
                                return;
                            } else {
                                var m_email = rows[0].manager_email;
                                var resident_name = rows[0].resident_name;
                                var manager_name = rows[0].manager_name;
                                var flat_number = rows[0].flat_number;
                                var Q = 'insert into staff_request(resident_id, staff_id, request_date) values("' + resident_id + '", "' + staff_id + '", now())';
                                pool.query(Q, function(err, rows, fields) {
                                    if (err) {
                                        result.error = err;
                                        console.log(err);
                                        res.send(JSON.stringify(result));
                                        return;
                                    }
                                    transporter.sendMail({
                                        from: 'man2helpsm@gmail.com',
                                        to: m_email,
                                        subject: 'Check approve the servent',
                                        html: 'Hello ' + manager_name + ' !<br/>I am ' + resident_name + ', owner of ' + flat_number + '  need a servant. I  select ' + staff_name + ' for my convenience. Please approve my request, if you find it right.<br/><a href="' + host + '#/approve-request-for-staff/' + rows.insertId + '">Click To Approve Request</a><br/>Thank you'
                                    }, function(error, response) {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Message sent');
                                        }
                                    });
                                    result.success = "Request Sent Successfully !";
                                    res.send(JSON.stringify(result));
                                })
                            }
                        });
                    }
                });
            }
        });
    }
}

exports.sendApproveDetails = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var $result = {}
        var staff_req_id = req.body.id;
        var manager_comment = req.body.manager_comment;
        var querystring = 'select concat(r.first_name, " ", r.last_name) as resident_name, r.email as resident_email, sm.name as staff_name, sm.email as staff_email from staff_request sr INNER join residents r on r.id=sr.resident_id INNER join staff_master sm ON sm.id = sr.staff_id where sr.id="' + staff_req_id + '"';

        pool.query(querystring, function(err, result) {
            if (err) {
                $result.error = err;
                console.log(err);
            } else {
                var resident_name = '';
                var resident_email = '';
                var staff_name = '';
                var staff_email = '';
                if (result.length > 0) {
                    resident_name = result[0].resident_name;
                    resident_email = result[0].resident_email;
                    staff_name = result[0].staff_name;
                    staff_email = result[0].staff_email;
                }
                transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: resident_email,
                        subject: 'Your request is approved',
                        html: 'Hello ' + resident_name + ' !<br/><br/>You request for ' + staff_name + ' as servant has been approved by your block manager.<br/><br/> Thank you '
                    },
                    function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent');
                        }
                    });

                transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: staff_email,
                        subject: 'New Work Assign',
                        html: 'Hello ' + staff_name + ' !<br/><br/>' + resident_name + ' aproached you and block manager approved thier request to join you. <br/><br/> Thank you '

                    },
                    function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent');
                        }
                    });

                var queryString = 'update staff_request SET manager_comment="' + manager_comment + '", status=1, response_date = now() where id="' + staff_req_id + '"';

                pool.query(queryString, function(err, row) {
                    if (err) {
                        $result.error = err;
                        console.log(err);
                    } else {
                        $result.success = "Your mails send successfully.";
                        res.send(JSON.stringify($result));
                    }
                });
            }
        });
    }
}

exports.staffListForResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var resident_id = 1; //req.body.id;
        var querystring = 'select sm.name, sm.contact_number, sm.email, sr.manager_comment, DATE_FORMAT(sr.request_date, "%d %M, %Y") as request_date, DATE_FORMAT(sr.response_date, "%d %M, %Y") as response_date, sr.status from staff_request as sr INNER JOIN staff_master sm ON sr.staff_id = sm.id where sr.resident_id="' + resident_id + '"';
        pool.query(querystring, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "details displayed successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}



exports.ManagerLoginForArroveServent = function(pool, crypto) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var username = req.body.userName;
        var password = req.body.password;
        var staff_req_id = req.body.staff_req_id;
        var querystring = 'select sMang.password, sMang.status from society_manager sMang INNER join block_master bm on sMang.id = bm.block_manager INNER join staff_master sMas on sMas.block_id = bm.id INNER join staff_request sr on sr.staff_id = sMas.id where sr.id="' + staff_req_id + '" and sMang.email="' + username + '"';
        pool.query(querystring, function(err, row) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                if (row.length == 0) {
                    result.error = "You Are not authorized to approve request";
                    res.send(JSON.stringify(result));
                    return;
                }
                var passwordn = crypto.createHash('md5').update(password).digest("hex");
                if (passwordn == row[0].password) {
                    result.success = "Password Match !";
                    res.send(JSON.stringify(result));
                    return;
                } else {
                    result.error = "Your Password Didn't Match";
                    res.send(JSON.stringify(result));
                    return;
                }
            }
        });
    }
}

exports.ManagerLoginForArroveFacility = function(pool, crypto) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var username = req.body.userName;
        var password = req.body.password;
        var staff_req_id = req.body.facility_req_id;

        var querystring = 'select sMang.password, sMang.status from society_manager sMang INNER join block_master bm on sMang.id = bm.block_manager INNER join facility_master sMas on sMas.block_id = bm.id INNER join facility_request sr on sr.facility_id = sMas.id where sr.id="' + staff_req_id + '" and sMang.email="' + username + '"';
        pool.query(querystring, function(err, row) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                if (row.length == 0) {
                    result.error = "You Are not authorized to approve request";
                    res.send(JSON.stringify(result));
                    return;
                }
                var passwordn = crypto.createHash('md5').update(password).digest("hex");
                if (passwordn == row[0].password) {
                    result.success = "Password Match !";
                    res.send(JSON.stringify(result));
                    return;
                } else {
                    result.error = "Your Password Didn't Match";
                    res.send(JSON.stringify(result));
                    return;
                }
            }
        });
    }
}

exports.staffAttendance = function(pool) {
    return function(req, res) {
        var result = {};
        var staff_id = req.body.staff_id;
        var time = req.body.time_inout;
        var entry = req.body.entry;
        var inout_ip = req.connection.remoteAddress;
        res.setHeader('Content-Type', 'application/json');
        var query_string = 'select * from staff_attandance where staff_id="' + staff_id + '" and curr_date = CURDATE()';
        pool.query(query_string, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                if (rows.length > 0) {
                    var Query = 'UPDATE staff_attandance SET out_time = "' + time + '",out_ip = "' + inout_ip + '",out_entry = "' + entry + '",status = 0 WHERE id ="' + rows[0].id + '"';
                    result.success = "Staff Exits Details Saved !";
                    pool.query(Query, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.send(JSON.stringify(result));
                    return;
                } else {
                    var Query = 'INSERT INTO staff_attandance (`staff_id`, `curr_date`,`in_time`,`in_ip` ,`in_entry`,`status`) VALUES ("' + staff_id + '", CURDATE(),"' + time + '","' + inout_ip + '","' + entry + '",1)';
                    pool.query(Query, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    result.success = "Staff Entery Details Saved !";
                    res.send(JSON.stringify(result));
                    return;
                }
            }
        });
    }
}


exports.attandanceForManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var staff_id = req.body.staff_id;
        var block_id = req.body.block_id;
        var up_date = req.body.start_date;
        var to_date = req.body.end_date;
        var where = 'where sm.block_id = "' + block_id + '"';
        if (staff_id != 0 && staff_id != '' && typeof staff_id != 'undefined') {
            where += ' and sa.staff_id = "' + staff_id + '"';
        }
        if (typeof up_date != 'undefined' && typeof to_date != 'undefined' && up_date != '' && to_date != '') {
            where += ' and sa.curr_date between "' + up_date + '" and "' + to_date + '"';
        }
        var querystring = 'select sm.name as staff_name, smEn.name as entry_security, smEx.name as exist_security, sa.* from staff_attandance sa INNER JOIN staff_master sm ON sa.staff_id = sm.id INNER join staff_master smEn on sa.in_entry = smEn.id INNER join staff_master smEx on smEx.id = sa.out_entry ' + where;
        pool.query(querystring, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.success = "";
                result.data = rows;
            }
            res.send(JSON.stringify(result));
            return;
        });
    }
}

exports.staffRequestesForManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var block_id = req.body.block_id;
        var querystring = 'select sm.*, sr.request_date, sr.id as request_id, concat(r.first_name," ",r.last_name) as resident_name, r.contact_no as resident_contact_number, sr.status as status, fm.flat_number from staff_master sm INNER JOIN staff_request sr ON sm.id = sr.staff_id INNER JOIN residents r ON sr.resident_id = r.id INNER JOIN flat_master fm ON r.flat_id = fm.id where fm.block_id = "' + block_id + '"';
        pool.query(querystring, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.success = "displayed requested staff";
                result.data = rows;
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.addStaffMemberFor = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var staff_for = req.body.staff_for;
        
        var result = {}
        var querystring = 'INSERT INTO staff_type (`staff_type`, `status`) VALUES ("' + staff_for + '","1")';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.success = "Manager added facility successfully";
                res.send(JSON.stringify(result));
            };
        });
    };
};
