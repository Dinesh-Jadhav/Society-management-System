exports.addParking = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var parking_name = req.body.name;
        var area = "";
        var result = {};
        if (block_id == '' || parking_name == '') {
            result.error = 'Parameter Missing';
            res.send(JSON.stringify(result));
            return;
        }
        var queryString = 'insert into parking_master(block_id, name, area) values("' + block_id + '", "' + parking_name + '", "' + area + '")';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows
                result.success = "parking added successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.getParkingList = function(pool) {
    return function(req, res) {

        var block_id = req.query.block_id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = 'select pm.*, fpm.parking_id, fpm.flat_id, fm.flat_number, concat(r.first_name, " ", r.last_name) as resident_name from parking_master pm left join flat_parking_association fpm on find_in_set(pm.id, fpm.parking_id) left join residents r on r.flat_id = fpm.flat_id left JOIN flat_master fm on fm.id=fpm.flat_id where pm.block_id="' + block_id + '"';
        query += " order by id desc";
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

exports.getParkingUnassign = function(pool) {
    return function(req, res) {

        var block_id = req.query.block_id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = 'select pm.*, fpm.parking_id, fpm.flat_id, fm.flat_number, concat(r.first_name, " ", r.last_name) as resident_name from parking_master pm left join flat_parking_association fpm on find_in_set(pm.id, fpm.parking_id) left join residents r on r.flat_id = fpm.flat_id left JOIN flat_master fm on fm.id=fpm.flat_id where pm.block_id="' + block_id + '" and pm.status = "0"';
        query += " order by id desc";
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

exports.deleteAssingParking = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var data = {}
        pool.query("DELETE FROM parking_master WHERE id=?", [id], function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                data.success = "slot deleted Successfully";
                res.send(JSON.stringify(data));
            }
        });
    };
};

/*exports.assingParking = function(pool) {
    return function(req, res) {
        var result = {};
        var flat_id = req.body.flat_id;
        var parking_id = req.body.parking_id;
        res.setHeader('content-Type', 'application/json');
        Q = 'select * from flat_parking_association where flat_id = "' + flat_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                if (rows.length > 0) {
                    result.success = "this slot is already assigned";
                    res.send(JSON.stringify(result));
                    return;
                }
                var Q1 = 'insert into flat_parking_association (flat_id,parking_id,status) values ("' + flat_id + '","' + parking_id + '","1")';
                pool.query(Q1, function(err, rows) {
                    if (err) {
                        result.error = err;
                        console.log(err);
                    } else {
                        Q2 = 'update parking_master SET status = "1" where id="' + parking_id + '"';
                        pool.query(Q2, function(err, rows) {
                            if (err) {
                                result.error = err;
                                console.log(err);
                            } else {
                                result.success = "parking master updated";
                                result.success = "assign parking slot sucessfully";
                                res.send(JSON.stringify(result));
                            }
                        });
                    }
                });
            }
        });
    }
}*/

exports.assingParking = function(pool) {
    return function(req, res) {
        var result = {};
        var flat_id = req.body.flat_id;
        var parking_id = req.body.parking_id;
        res.setHeader('content-Type', 'application/json');
        Q = 'select * from flat_parking_association where flat_id = "' + flat_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                if (rows.length > 0) {
                    result.success = "this slot is already assigned";
                    res.send(JSON.stringify(result));
                    return;
                }

                if (parking_id == 0) {
                    var Q3 = 'delete from flat_parking_association where flat_id ="' + flat_id + '"';
                    pool.query(Q3, function(err, row) {
                        if (err) {
                            console.log(err)
                        } else {
                            var Q4 = 'update parking_master SET status = "0" where id="' + parking_id + '"';
                            pool.query(Q4, function(err, rows) {
                                if (err) {
                                    result.error = err;
                                    console.log(err);
                                } else {
                                    result.success = "parking master updated";
                                    result.success = "assign parking slot sucessfully";
                                    res.send(JSON.stringify(result));
                                }
                            });
                        }
                    });
                } else {
                    var Q1 = 'insert into flat_parking_association (flat_id,parking_id,status) values ("' + flat_id + '","' + parking_id + '","1")';
                    pool.query(Q1, function(err, rows) {
                        if (err) {
                            result.error = err;
                            console.log(err);
                        } else {
                            var Q2 = 'update parking_master SET status = "1" where id="' + parking_id + '"';
                            pool.query(Q2, function(err, rows) {
                                if (err) {
                                    result.error = err;
                                    console.log(err);
                                } else {
                                    result.success = "parking master updated";
                                    result.success = "assign parking slot sucessfully";
                                    res.send(JSON.stringify(result));
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}




exports.listOfAssignParking = function(pool) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json')
        var result = {};
        var block_id = req.body.block_id;
        var Q = 'SELECT fpa.*,fm.flat_number as flat_number,pms.block_id, concat(r.first_name," ",r.last_name) as resident_name, (SELECT GROUP_CONCAT(name) from parking_master pm WHERE find_in_set(pm.id, fpa.parking_id)) as assign_parking_slots from flat_parking_association fpa INNER join parking_master pms on find_in_set(pms.id, fpa.parking_id) INNER join flat_master fm on fm.id = fpa.flat_id left join residents r on fm.id = r.flat_id where pms.block_id="' + block_id + '" group by fpa.id';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows;
                result.success = "parking list displayed successfully";
                res.send(JSON.stringify(result));
            }
        })
    }
}

exports.updateParking = function(pool) {
    return function(req, res) {
        var result = {};
        var flat_id = req.body.flat_id;
        var parking_id = req.body.parking_id;
        res.setHeader('content-Type', 'application/json');
        Q2 = 'update parking_master SET status = "1" where id="' + parking_id + '"';
        pool.query(Q2, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.success = "parking master updated";
                res.send(JSON.stringify(result));
            }
        });
    }
}
