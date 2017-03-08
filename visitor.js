exports.getVisitorsForStaff = function(pool) {
    return function(req, res) {
        var result = {};
        var blockID = req.body.block_id;
        res.setHeader('Content-Type', 'application/json');

        var queryString = "SELECT vm.*, concat(r.first_name, ' ', r.last_name) as resident_name, fm.flat_number FROM visitor_master vm INNER JOIN residents r on r.id=vm.resident_id INNER JOIN flat_master fm on fm.id=r.flat_id INNER JOIN block_master bm on bm.id=fm.block_id INNER JOIN staff_master sm on sm.block_id = bm.id WHERE sm.block_id='" + blockID + "' GROUP by vm.id"
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

exports.getVisitorsForResident = function(pool) {
    return function(req, res) {
        var result = {};
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');

        var queryString = "SELECT vm.*, concat(r.first_name, ' ', r.last_name) as resident_name FROM visitor_master vm INNER JOIN residents r on r.id=vm.resident_id WHERE vm.resident_id='" + id + "'"
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

exports.addVisitorsByResident = function(pool, transporter) {
    return function(req, res) {
        var result = {};
        var data = req.body;
        var contact_no = data.contact_no;
        var email = data.email;
        var move_in_date = data.move_in_date;
        var name = data.name;
        var no_of_person = data.no_of_person;
        var resident_id = data.resident_id;
        var type = data.type;
        var date = new Date(move_in_date);
        var month = parseInt(date.getMonth());
        var count = parseInt('1');
        var newMonth = month + count;
        var newDate = date.getDate() + '-' + newMonth + '-' + date.getFullYear();
        var datForDb = date.getFullYear() + '-' + newMonth + '-' + date.getDate() + ' 00:00:00';
        res.setHeader('Content-Type', 'application/json');
        var queryString = "SELECT sm.*, bm.name as block_name, fm.flat_number, concat(r.first_name, ' ', r.last_name) as resident_name from residents r INNER JOIN flat_master fm on r.flat_id = fm.id INNER JOIN block_master bm on bm.id = fm.block_id inner JOIN society_manager sm on sm.id = bm.block_manager WHERE r.id = '" + resident_id + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    var manager_email = rows[0].email;

                    transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: manager_email,
                        subject: 'New Visitor is Visiting Soon',
                        html: 'Hello ' + rows[0].manager_name + ' !<br/>A new visitor is going to visit at ' + rows[0].block_name + ' with ' + no_of_person + ' Person(s) in flat number ' + rows[0].flat_number + ' which is owned by ' + rows[0].resident_name + ' on ' + newDate + '<br>Thank You'

                    }, function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {}
                    });
                    var query = 'insert into visitor_master(name, contact_no, email, type, no_of_persons, resident_id, estimate_arival_date_time, status) values("' + name + '", "' + contact_no + '", "' + email + '","' + type + '", "' + no_of_person + '", "' + resident_id + '", "' + datForDb + '", "1")';
                    pool.query(query, function(err, resp) {
                        if (err) {
                            console.log(err);
                            result.error = error;
                            res.send(JSON.stringify(result));
                        } else {
                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: email,
                                subject: 'Welcome To Man2Help',
                                html: 'Hello ' + name + ' !<br/>' + rows[0].resident_name + ' has added you as a Visitor, and shown that you are comming with ' + no_of_person + ' Person(s) on your responsibility. Your Visitor ID is <b>' + resp.insertId + '</b>. Please remember this id and show it to Security Officer on visit day, which is estimated by ' + rows[0].resident_name + ' as ' + newDate + '<br>Thank You'

                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {

                                }
                            });
                            result.status = '200';
                            result.data = "Data Inserted Successfully !";
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    };
};

exports.addVisitorsByStaff = function(pool, transporter) {
    return function(req, res) {
        var result = {};
        var data = req.body;
        var contact_no = data.contact_no;
        var email = data.email;
        var arrival_date_time = data.arrival_date_time;
        var name = data.name;
        var no_of_person = data.no_of_person;
        var resident_id = data.resident_id;
        var type = data.type;
        var updated_by = data.updated_by;
        var date = new Date(arrival_date_time);
        var month = parseInt(date.getMonth());
        var count = parseInt('1');
        var newMonth = month + count;
        var newDate = date.getDate() + '-' + newMonth + '-' + date.getFullYear();
        var datForDb = date.getFullYear() + '-' + newMonth + '-' + date.getDate() + ' 00:00:00';
        res.setHeader('Content-Type', 'application/json');
        var queryString = "SELECT sm.*, bm.name as block_name, fm.flat_number, concat(r.first_name, ' ', r.last_name) as resident_name from residents r INNER JOIN flat_master fm on r.flat_id = fm.id INNER JOIN block_master bm on bm.id = fm.block_id inner JOIN society_manager sm on sm.id = bm.block_manager WHERE r.id = '" + resident_id + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    var manager_email = rows[0].email;

                    transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: manager_email,
                        subject: 'New Visitor entered in ' + rows[0].block_name,
                        html: 'Hello ' + rows[0].manager_name + ' !<br/>A new visitor has entered in ' + rows[0].block_name + ' with ' + no_of_person + ' Person(s) in flat number ' + rows[0].flat_number + ' which is owned by ' + rows[0].resident_name + ' on ' + newDate + '<br>Thank You'

                    }, function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {

                        }
                    });
                    var query = 'insert into visitor_master(name, contact_no, email, type, no_of_persons, resident_id, estimate_arival_date_time, arival_date_time,update_by_on_entry, status) values("' + name + '", "' + contact_no + '", "' + email + '","' + type + '", "' + no_of_person + '", "' + resident_id + '", "' + arrival_date_time + '","' + arrival_date_time + '","' + updated_by + '", "2")';

                    pool.query(query, function(err, resp) {
                        if (err) {
                            console.log(err);
                            result.error = error;
                            res.send(JSON.stringify(result));
                        } else {
                            result.status = '200';
                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: email,
                                subject: 'Welcome To Man2Help',
                                html: 'Hello ' + name + ' !<br/>' + rows[0].resident_name + ' has added you as a Visitor, and shown that you are comming with ' + no_of_person + ' Person(s) on your responsibility. Your Visitor ID is <b>' + resp.insertId + '</b>. Please remember this id and show it to Security Officer on visit day, which is estimated by ' + rows[0].resident_name + ' as ' + newDate + '<br>Thank You'

                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {

                                }
                            });

                            result.data = "Data Inserted Successfully !";
                            res.send(JSON.stringify(result));
                        }
                    });
                }

            }

        });
    };
};


exports.getVisitorDetail = function(pool) {
    return function(req, res) {
        var result = {};
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var queryString = "SELECT vm.*, concat(r.first_name, ' ', r.last_name) as resident_name, r.contact_no as resident_contact, r.email as resident_email, fm.flat_number FROM visitor_master vm INNER JOIN residents r on r.id=vm.resident_id INNER JOIN flat_master fm on fm.id=r.flat_id WHERE vm.id='" + id + "' GROUP by vm.id";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                if (rows.length > 0) {
                    result.status = '200';
                    result.data = rows[0];
                } else {
                    result.error = "No Data Found !"
                }
            }
            res.send(JSON.stringify(result));
        });
    };
};

exports.UpdateVisitorDetails = function(pool, transporter) {
    return function(req, res) {
        var result = {};
        var data = req.body;
        res.setHeader('Content-Type', 'application/json');
        var id = data.id;
        var updated_by = data.updated_by;
        var comment = data.comment;
        var leaving_date_time = data.leaving_date_time;
        var queryString = "update visitor_master set depart_date_time='" + leaving_date_time + "', staff_comment='" + comment + "', updated_by='" + updated_by + "', status='3' WHERE id='" + id + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                result.status = '200';
                result.data = "Updated Successfully !";
            }
            res.send(JSON.stringify(result));
        });
    };
};

exports.UpdateVisitorEntryDetails = function(pool, transporter) {
    return function(req, res) {
        var result = {};
        var data = req.body;
        res.setHeader('Content-Type', 'application/json');
        var id = data.id;
        var updated_by = data.updated_by;
        var entry_date_time = data.entry_date_time;
        var no_of_person = data.no_of_persons;
        var queryString = "update visitor_master set arival_date_time='" + entry_date_time + "', update_by_on_entry='" + updated_by + "', no_of_persons ='" + no_of_person + "', status='2' WHERE id='" + id + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                /*transporter.sendMail({
                    from: 'kalika.deltabee@gmail.com',
                    to: manager_email,
                    subject: 'New Visitor entered with Visitor Id '+rows[0].block_name,
                    html: 'Hello '+rows[0].manager_name+' !<br/>A new visitor has entered in '+rows[0].block_name+' with '+no_of_person+' Person(s) in flat number '+rows[0].flat_number+' which is owned by '+rows[0].resident_name+' on '+entry_date_time+'<br>Thank You'

                    }, function(error, response) {
                        if (error){
                            console.log(error);
                        }else{
                            
                        }
                    }); */
                result.status = '200';
                result.data = "Updated Successfully !";

            }
            res.send(JSON.stringify(result));
        });
    };
};

exports.ExternalVisitorsForManager = function(pool) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json');
        var result = {};
        var block_id = req.body.id;
        var querystring = 'select vm.*, concat(r.first_name," ",r.last_name) as resident_name,r.contact_no as contact_number,fm.flat_number from flat_master fm INNER JOIN residents r ON fm.id=r.flat_id INNER JOIN visitor_master vm ON r.id=vm.resident_id where block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.success = "Displayed successfully";
                result.data = rows;
                res.send(JSON.stringify(result));
            }
        });
    }
}
