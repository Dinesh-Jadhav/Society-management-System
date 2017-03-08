exports.addVendor = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var vandor_name = req.body.vendor_name;
        var email = req.body.email;
        var contact = req.body.contact;
        var id_proof = req.body.id_proof;
        var block_id = req.body.block_id;
        var description = req.body.description;
        var payuavailable = req.body.payuavailable;
        var merchant_id = req.body.merchant_id;
        var merchant_key = req.body.merchant_key;
        var merchant_salt = req.body.merchant_salt;

        if (typeof(payuavailable) === "undefined") {
            payuavailable = 0;
            merchant_id = "";
            merchant_key = "";
            merchant_salt = "";
        }
        var result = {};
        var queryString = "select * from image_temp where id='" + id_proof + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    var id_imageName = rows[0].imgName;
                    var Q = 'INSERT INTO vendor_master ( `vendor_name`, `email`, `contact`, `id_poof`, `merchant_id`, `merchant_key`, `payuavailable`,`merchant_salt`, `status`, `block_id`, `description`) VALUES ("' + vandor_name + '","' + email + '","' + contact + '","' + id_imageName + '","' + merchant_id + '","' + merchant_key + '","' + payuavailable + '","' + merchant_salt + '","1", "' + block_id + '", "' + description + '")';
                    pool.query(Q, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                        } else {
                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: email,
                                subject: 'Welcome To Man2Help',
                                html: 'Hello ' + vandor_name + ' !<br/> you are added as a Vendor. Your Visitor ID is <b>' + rows.insertId + '</b>. Please remember this id and show it to Security Officer on visit day<br>Thank You'
                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent');
                                }
                            });
                            var query = "delete from image_temp where id='" + id_proof + "'";
                            pool.query(query, function(err, rows, fields) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    result.status = 200;
                                    res.send(JSON.stringify(result));
                                }
                            });
                        }
                    });
                } else {
                    result.error = "Select ID Image."
                    res.send(JSON.stringify(result));
                }
            }
        });
    }
}


exports.listvendors = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select * from vendor_master where block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows;
                result.success = "vendor list displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.deleteVendor = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var vendor_id = req.body.id;
        var result = {}
        var querystring = 'delete from vendor_master where id="' + vendor_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.success = "vendor Deleted successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.updateVendor = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var vendor_id = req.body.id;
        var description = req.body.description;
        var vendor_name = req.body.vendor_name;
        var vendor_email = req.body.email;
        var merchant_id = req.body.merchant_id;
        var merchant_key = req.body.merchant_key;
        var merchant_salt = req.body.merchant_salt;
        var contact = req.body.contact;
        var payuavailable = req.body.payuavailable;
        var result = {};
        var querystring = 'update vendor_master SET vendor_name = "' + vendor_name + '", email = "' + vendor_email + '",contact ="' + contact + '",merchant_id = "' + merchant_id + '",merchant_key = "' + merchant_key + '",merchant_salt = "' + merchant_salt + '",description="' + description + '",payuavailable = "' + payuavailable + '" where id="' + vendor_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows;
                result.success = "vendor updated successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.vendorEntryByStaff = function(pool) {
    return function(req, res) {
        var data = req.body;
        res.setHeader('Content-Type', 'application/json');
        var job_card_id = data.job_card_id;
        var staff_id = data.staff_id;
        var time_in = data.time_in;
        var vendor_id = data.vendor_id;
        var ip = req.connection.remoteAddress;
        var date = new Date();
        var in_date_time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + time_in;
        var query = 'select * from vendor_entries where vendor_id="' + vendor_id + '" and status=0';
        /*and cast(in_date_time as date)=CURDATE()*/
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length > 0) {
                    res.send({ error: 'This Vendor Is Already In !' });
                } else {
                    var Q = 'INSERT into vendor_entries(vendor_id, job_card_id, in_date_time, in_ip, in_security, status) VALUES("' + vendor_id + '", "' + job_card_id + '", "' + in_date_time + '", "' + ip + '", "' + staff_id + '", "0")';
                    pool.query(Q, function(error, rows, fields) {
                        if (error) {
                            console.log(error);
                        } else {
                            res.send({ success: 'Data Inserted Successfully!' });
                        }
                    });
                }

            }
        });
    }
}


exports.listVendorsEntry = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select vm.vendor_name, ve.*, sm.name as in_staff_name, sm1.name as out_staff_name from vendor_entries ve inner join vendor_master vm on vm.id = ve.vendor_id inner join staff_master sm on sm.id = ve.in_security left join staff_master sm1 on ve.out_security=sm1.id  where vm.block_id="' + block_id + '" order by ve.id desc';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                result.data = rows;
                result.success = "vendor list displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}


exports.VendorExitDetailsByStaff = function(pool) {
    return function(req, res) {
        var data = req.body;
        res.setHeader('Content-Type', 'application/json');
        var id = data.id;
        var staff_id = data.staff_id;
        var time = data.time;
        var comment = data.comment;
        var ip = req.connection.remoteAddress;
        var date = new Date();
        var in_date_time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + time;
        var query = 'update vendor_entries set out_date_time="' + in_date_time + '", out_ip="' + ip + '", out_security="' + staff_id + '", staff_comment="' + comment + '", status=1 where id="' + id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                res.send({ success: 'User Updated Successfully!' });
            }
        });
    }
}
