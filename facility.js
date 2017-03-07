exports.addFacility = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var facility_name = req.body.facility_name;
        var charges = req.body.charges;
        var block_id = req.body.block_id;
        var description = req.body.description;
        var recurring_peroid = req.body.recurring_peroid;

        var result = {}
        var querystring = 'INSERT INTO facility_master (`facility_name`, `charges`, `block_id`, `status`, `description`, `recurring_peroid`) VALUES ("' + facility_name + '","' + charges + '","' + block_id + '","1", "' + description + '", "' + recurring_peroid + '")';
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

exports.listFacilities = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select * from facility_master where block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows;
                result.success = "facilities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.getSingleFacility = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var result = {}
        var querystring = 'select * from facility_master where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "facilities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.deleteFacilities = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var facility_id = req.body.id;
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'delete from facility_master where id="' + facility_id + '" and block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows;
                result.success = "facility Deleted successfully";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.updateFacility = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var facility_id = req.body.id;
        var block_id = req.body.block_id;
        var facility_name = req.body.facility_name;
        var charges = req.body.charges;
        var description = req.body.description;
        var result = {};
        var querystring = 'update facility_master SET facility_name="' + facility_name + '", charges="' + charges + '", description="' + description + '" where id="' + facility_id + '" and block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows;
                result.success = "facility updated successfully";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.requestToManagerForFacility = function(pool, transporter) {
    return function(req, res) {
        var host = req.protocol + '://' + req.headers.host + '/';

        var result;
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var facility_id = req.body.facility_id;

        var result = {};
        var querystring = 'select * from facility_request where resident_id="' + resident_id + '" and facility_id="' + facility_id + '"';
        pool.query(querystring, function(err, resp, fields) {
            if (err) {
                result.error = err;
            } else {
                if (resp.length > 0) {
                    result.error = "You have already sent request for this facility.";
                    res.send(JSON.stringify(result));
                    return;
                }

                var queryString = 'SELECT SM.manager_name, SM.email as manager_email, concat(res.first_name, " ", res.last_name) as resident_name, flatm.flat_number, fm.facility_name FROM residents as res INNER JOIN flat_master flatm ON res.flat_id = flatm.id INNER JOIN block_master BM ON BM.id = flatm.block_id INNER JOIN society_manager SM ON SM.id = BM.block_manager INNER JOIN facility_master fm on fm.block_id = BM.id WHERE fm.id = "' + facility_id + '" and res.id="' + resident_id + '"';
                pool.query(queryString, function(err, rows, fields) {
                    if (err) {
                        result.error = err;
                        console.log(err);
                        res.send(JSON.stringify(result));
                        return;
                    } else {
                        if (rows.length > 0) {
                            var m_email = rows[0].manager_email;
                            var resident_name = rows[0].resident_name;
                            var manager_name = rows[0].manager_name;
                            var flat_number = rows[0].flat_number;
                            var facility_name = rows[0].facility_name;
                            var Q = 'insert into facility_request(facility_id, resident_id, request_date) values("' + facility_id + '", "' + resident_id + '", now())';
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
                                    subject: 'New Request for facility',
                                    html: 'Hello ' + manager_name + ' !<br/>I am ' + resident_name + ', owner of ' + flat_number + '. I  select ' + facility_name + ' facility for my convenience  . Please approve my request, if you find it right.<br/><a href="' + host + '#/approve-request-for-facility/' + rows.insertId + '">Click To Approve Request</a><br/>Thank you'
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
                        } else {
                            result.success = "There is no any record found !";
                            res.send(JSON.stringify(result));
                        }
                    }
                });
            }
        });
    }
}


exports.sendApproveDetailsToResidentAboutFacility = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var $result = {}
        var resident_id = req.body.id;
        var querystring = 'select concat(r.first_name," ",r.last_name) as resident_name, r.email as resident_email ,fm.facility_name from facility_master fm INNER JOIN facility_request fr ON fm.id = fr.facility_id INNER JOIN residents r ON fr.resident_id = r.id INNER JOIN flat_master flm ON r.flat_id = flm.id INNER JOIN block_master bm ON flm.block_id = bm.id INNER JOIN society_manager sm ON bm.block_manager = sm.id where fr.id="' + resident_id + '"';

        pool.query(querystring, function(err, result) {
            if (err) {
                $result.error = err;
                console.log(err);
            } else {
                var resident_name = '';
                var resident_email = '';
                var facility_name = '';
                if (result.length > 0) {
                    resident_name = result[0].resident_name;
                    resident_email = result[0].resident_email;
                    facility_name = result[0].facility_name;
                }
                transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: resident_email,
                        subject: 'Your request is approved for facility',
                        html: 'Hello ' + resident_name + ' !<br/><br/>You request for ' + facility_name + ' has been approved by your block manager.<br/><br/> Thank you '

                    },
                    function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent');
                        }
                    });

                var queryString = 'update facility_request SET status=1, response_date = now() where id="' + resident_id + '"';

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

exports.listOfFacilitiesForResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var result = {}
        var querystring = 'SELECT stMast.* FROM residents as res INNER JOIN flat_master flatm ON res.flat_id = flatm.id INNER JOIN facility_master stMast ON flatM.block_id = stMast.block_id WHERE res.id = "' + resident_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                result.data = rows;
                result.success = "facilities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.listOfRequestedFacilitiesForResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var result = {}
        var querystring = 'select fr.*, fm.facility_name, fm.charges, fm.description from facility_request fr INNER JOIN  facility_master fm ON fm.id = fr.facility_id INNER JOIN residents r ON fr.resident_id = r.id INNER JOIN flat_master fl_m ON r.flat_id = fl_m.id where resident_id = "' + resident_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                result.data = rows;
                result.success = "facilities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.facilityRequestesForManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var block_id = req.body.block_id;
        var querystring = 'select sm.*, sr.request_date, sr.id as request_id, concat(r.first_name," ",r.last_name) as resident_name, r.contact_no as resident_contact_number, sr.status as status, fm.flat_number from facility_master sm INNER JOIN facility_request sr ON sm.id = sr.facility_id INNER JOIN residents r ON sr.resident_id = r.id INNER JOIN flat_master fm ON r.flat_id = fm.id where fm.block_id = "' + block_id + '" order by sr.request_date asc';

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
