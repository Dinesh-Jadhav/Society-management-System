exports.addAmenities = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var aminity_name = req.body.aminity_name;
        var charges = req.body.charges;
        var description = req.body.description;
        var block_id = req.body.block_id;
        var image = req.body.image;
        var time_for_pay = req.body.time_for_pay;
        var result = {}
        var queryString = "select * from image_temp where id='" + image + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    var id_imageName = rows[0].imgName;
                    var Q = 'INSERT INTO amenities_master (`aminity_name`, `charges`, `block_id`, `description`, `image`, `time_for_pay`, `status`) VALUES ("' + aminity_name + '","' + charges + '","' + block_id + '","' + description + '","' + id_imageName + '","' + time_for_pay + '","0")';
                    pool.query(Q, function(err, rows, fields) {
                        var query = "delete from image_temp where id='" + image + "'";
                        pool.query(query, function(err, rows, fields) {
                            result.status = 200;
                            res.send(JSON.stringify(result));
                        });
                    });
                } else {
                    result.error = "Select Image."
                    res.send(JSON.stringify(result));
                }
            }
        });
    }
}

exports.listAmenities = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select * from amenities_master where block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Amemities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.deleteAmenities = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var aminity_id = req.body.id;
        var result = {}
        var querystring = 'delete from amenities_master where id="' + aminity_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "amenities Deleted successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.updateAmenities = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var aminity_id = req.body.id;
        var aminity_name = req.body.aminity_name;
        var description = req.body.description;
        var charges = req.body.charges;
        var time_for_pay = req.body.time_for_pay;
        var result = {};
        var querystring = 'update amenities_master SET aminity_name = "' + aminity_name + '", charges = "' + charges + '",description ="' + description + '",time_for_pay ="' + time_for_pay + '" where id="' + aminity_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Aminity updated successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.listOfRequestedAmenitiesForResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var result = {}
        var querystring = 'select am.aminity_name,am.charges, ar.* from amenities_master am INNER JOIN amenity_request ar ON am.id = ar.amenity_id INNER JOIN residents r ON ar.resident_id = r.id INNER JOIN flat_master fm ON r.flat_id = fm.id where ar.resident_id = "' + resident_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Amenities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.listOfAmenitiesForResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var result = {}
        var querystring = 'SELECT am.* FROM residents as res INNER JOIN flat_master flatm ON res.flat_id = flatm.id INNER JOIN amenities_master am ON flatM.block_id = am.block_id WHERE res.id = "' + resident_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err)
            } else {
                result.data = rows;
                result.success = "aminities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.getSingleAmility = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var result = {}
        var querystring = 'select * from amenities_master where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "amenities Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.requestToManagerForAmenities = function(pool, transporter) {
    return function(req, res) {
        var host = req.protocol + '://' + req.headers.host + '/';

        res.setHeader('Content-Type', 'application/json');
        var amenity_id = req.body.amenity_id;
        var resident_id = req.body.resident_id;
        var booking_start_date = req.body.booking_start_date;
        var booking_end_date = req.body.booking_end_date;
        var resident_message = req.body.resident_message;
        var result = {};
        var querystring = 'select *, DATE_FORMAT(booking_end_date,  "%Y-%m-%d") as end_date from amenity_request where ((booking_start_date<="' + booking_start_date + '" and booking_end_date>="' + booking_start_date + '") or (booking_start_date<="' + booking_end_date + '" and booking_end_date>="' + booking_end_date + '")) and amenity_id="' + amenity_id + '" and status="2"';
        pool.query(querystring, function(err, resp, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                if (resp.length > 0) {
                    result.error = "This Amenity is already booked on " + booking_start_date + ", you can request after " + resp[0].end_date + " .";
                    res.send(JSON.stringify(result));
                    return;
                }
                var queryString = 'select sm.manager_name,sm.email as manager_email,concat(r.first_name, " ", r.last_name) as resident_name,am.aminity_name,fm.flat_number from amenities_master am INNER JOIN flat_master fm ON am.block_id = fm.block_id INNER JOIN residents r ON fm.id = r.flat_id INNER JOIN block_master bm ON fm.block_id = bm.id INNER JOIN society_manager sm ON bm.block_manager = sm.id where r.id = "' + resident_id + '" and am.id="' + amenity_id + '"';
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
                            var aminity_name = rows[0].aminity_name;
                            var Q = 'insert into amenity_request(amenity_id, resident_id, request_date, booking_start_date, booking_end_date, resident_message) values("' + amenity_id + '", "' + resident_id + '", now(), "' + booking_start_date + '", "' + booking_end_date + '", "' + resident_message + '")';
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
                                    subject: 'Request for ' + aminity_name + ' amenity',
                                    html: 'Hello ' + manager_name + ' !<br/>I am ' + resident_name + ', owner of ' + flat_number + '. I  select ' + aminity_name + ' facility for my convenience  . Please approve my request, if you find it right.<br/><br/>Thank you'
                                }, function(error, response) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Message sent');
                                    }
                                });
                                result.data = rows;
                                result.success = "Request Sent Successfully !";
                                res.send(JSON.stringify(result));
                            });
                        }
                    }
                });
            }
        });
    }
}

exports.sendApproveDetailsToResidentAboutAmenities = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var $result = {}
        var id = req.body.id;
        var comment = req.body.manager_comment;
        var querystring = 'select ar.*,DATE_FORMAT(ar.booking_end_date,  "%Y-%m-%d") as end_date, am.charges, DATE_FORMAT(ar.booking_start_date,  "%Y-%m-%d") as start_date, concat(r.first_name," ",r.last_name) as resident_name, r.email as resident_email ,am.aminity_name from amenities_master am INNER JOIN amenity_request ar ON am.id = ar.amenity_id INNER JOIN residents r ON ar.resident_id = r.id INNER JOIN flat_master flm ON r.flat_id = flm.id INNER JOIN block_master bm ON flm.block_id = bm.id INNER JOIN society_manager sm ON bm.block_manager = sm.id where ar.id="' + id + '"';

        pool.query(querystring, function(err, result) {
            if (err) {
                $result.error = err;
                console.log(err);
            } else {
                var resident_name = '';
                var resident_email = '';
                var facility_name = '';
                var charges = '';
                if (result.length > 0) {
                    resident_name = result[0].resident_name;
                    resident_email = result[0].resident_email;
                    aminity_name = result[0].aminity_name;
                    charges = result[0].charges;
                }
                var Q = 'select *, DATE_FORMAT(booking_end_date,  "%Y-%m-%d") as end_date,  DATE_FORMAT(booking_start_date,  "%Y-%m-%d") as start_date from amenity_request where ((booking_start_date<="' + result[0].start_date + '" and booking_end_date>="' + result[0].start_date + '") or (booking_start_date<="' + result[0].end_date + '" and booking_end_date>="' + result[0].end_date + '")) and amenity_id="' + result[0].amenity_id + '" and status="2"';

                pool.query(Q, function(err, request) {
                    if (err) {
                        console.log(err);
                    } else {

                        if (request.length > 0) {
                            $result.error = aminity_name + " already assigned to other resident from " + request[0].start_date + ' to ' + request[0].end_date;
                            res.send(JSON.stringify($result));

                        } else {
                            transporter.sendMail({
                                    from: 'man2helpsm@gmail.com',
                                    to: resident_email,
                                    subject: 'Your request for ' + aminity_name + ' has been approved ',
                                    html: 'Hello ' + resident_name + ' !<br/><br/>Your request for <b>' + aminity_name + '</b> has been approved by your block manager and it is requested to Reserve from ' + result[0].start_date + ' to ' + result[0].end_date + ', please pay for the same as soon as possible, to get it booked.<br/><br/> Thank you '

                                },
                                function(error, response) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Message sent');
                                    }
                                });

                            var status = 1;
                            if (charges == 0) {
                                status = 2
                            } else {
                                status = 1;
                            }
                            var queryString = 'update amenity_request SET status="' + status + '", response_date = now(), manager_message="' + comment + '" where id="' + id + '"';

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
                    }
                });
            }
        });
    }
}

exports.requestedResidentForAmenitiesToManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.id;
        var result = {}
        var querystring = 'select ar.*, am.aminity_name as amenities_name, am.charges, concat(r.first_name," ",r.last_name) as resident_name ,r.email as resident_email, flm.flat_number as flat_number,ar.request_date ,ar.status as status from amenities_master am INNER JOIN amenity_request ar ON am.id = ar.amenity_id INNER JOIN residents r ON ar.resident_id = r.id INNER JOIN flat_master flm ON r.flat_id = flm.id INNER JOIN block_master bm ON flm.block_id = bm.id where bm.id="' + block_id + '" order by ar.request_date DESC';

        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "List of requested displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.checkDateForAmenity = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var amenity_id = req.body.id;
        var result = {}
        var querystring = 'select am.aminity_name,concat(r.first_name , " " ,r.last_name) as resident_name,fm.flat_number,ar.booking_start_date ,ar.booking_end_date from amenities_master am INNER JOIN amenity_request ar ON ar.amenity_id = am.id INNER JOIN residents r ON r.id = ar.resident_id INNER JOIN flat_master fm ON fm.id = r.flat_id INNER JOIN block_master bm ON fm.block_id = bm.id where am.id ="' + amenity_id + '" and ar.status="2"';

        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "List of approved amenities displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}
