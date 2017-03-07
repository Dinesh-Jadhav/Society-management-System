exports.addFlat = function(pool) {
    return function(req, res) {
        var block_id = req.body.block_id;
        var storey_no = req.body.storey_number;
        var flat_no = req.body.flat_no;
        var type = req.body.type_of_flat;

        var queryString = "INSERT INTO flat_master(block_id, storey_number,flat_number,type_of_flat,status) VALUES(" + block_id + " ," + storey_no + ", '" + flat_no + "'," + type + ", 1)";
        var result = {};

        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.success = "Flat inserted successfully";
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};


exports.getFlatList = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var storey_number = req.body.storey_number;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select * from `flat_master` where block_id='" + id + "' and storey_number ='" + storey_number + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                var query = "update block_master set is_updated = 1 where id = " + id;
                pool.query(query, function(err, rows, fields) {

                    result.success = "Flat added successfully";
                });
                result.success = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};



exports.updateFlatDetails = function(pool) {
    return function(req, res) {
        var id = req.body.flat_id;
        var area = req.body.area;
        var location = req.body.location;
        var parking_slots = req.body.parking_slots;
        var parking_avail = req.body.parking_avail;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        if (parking_avail == 1 && parking_slots[0] != 0) {
            var parking_slot = parking_slots.join();
            var Q = 'INSERT INTO flat_parking_association(flat_id, parking_id) VALUES("' + id + '", "' + parking_slot + '") ON DUPLICATE KEY UPDATE parking_id="' + parking_slot + '"';
            pool.query(Q, function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }
        var query = 'update flat_master set area="' + area + '", location="' + location + '" where id="' + id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                console.log(parking_slots);
                var parking_ids = parking_slots;
                var parking_ids_commaa = [];
                for (var i = parking_ids.length - 1; i >= 0; i--) {
                    if (parking_ids.length == 1 && parking_ids[i] == 0) {
                        var Q = 'select count(parking_id) as count,parking_id from flat_parking_association where flat_id ="' + id + '"'
                        pool.query(Q, function(err, rows) {
                            if (err) {
                                console.log(err);
                            } else {
                                var arr = [];
                                 if(rows[0].count==0){
                                    result.success = "parking slot already unassigned"
                                      res.send(JSON.stringify(result));
                                      return;
                                 }
                                var str = JSON.parse(JSON.stringify(rows[0]));
                                if(str.hasOwnProperty('parking_id'))
                                {
                                    arr = (str.parking_id);
                                }
                                
                                var parking_ids_commaa = arr.split(',');
                                console.log(parking_ids_commaa);
                                for (var i = parking_ids_commaa.length - 1; i >= 0; i--)
                                 {
                                    Q2 = 'update parking_master SET status = "0" where id="' + parking_ids_commaa[i] + '"';
                                    pool.query(Q2, function(err, rows) {
                                    if (err)
                                     {
                                        result.error = err;console.log(err);
                                    } else {
                                    result.success = " unassigned parking Successfully !";
                                    res.send(JSON.stringify(result));
                                    return;
                                }
                             });
                            }
                            var Q3 = 'delete from flat_parking_association where flat_id ="' + id + '"';
                                    pool.query(Q3, function(err, row) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        else{
                                        console.log("delete successfully"); 
                                        }
                                    }); 
                              }
                        })
                    } else {
                        var parking_ids = parking_slots;
                for (var i = parking_ids.length - 1; i >= 0; i--) {
                    var Query = 'update parking_master set status=1 where id="' + parking_ids[i] + '"';
                           pool.query(Query, function(err, rows, fields) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                result.success = "Updated Successfully !";
                                res.send(JSON.stringify(result));
                                return;
                            }
                        });
                    }
                 }
                }
            }
        });
    }
};
/*

exports.updateFlatDetails = function(pool) {
    return function(req, res) {
        var id = req.body.flat_id;
        var area = req.body.area;
        var location = req.body.location;
        var parking_slots = req.body.parking_slots;
        var parking_avail = req.body.parking_avail;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        if (parking_avail == 1) {
            var parking_slot = parking_slots.join();
            var Q = 'INSERT INTO flat_parking_association(flat_id, parking_id) VALUES("' + id + '", "' + parking_slot + '") ON DUPLICATE KEY UPDATE parking_id="' + parking_slot + '"';

            pool.query(Q, function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }
        var query = 'update flat_master set area="' + area + '", location="' + location + '" where id="' + id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                var parking_ids = parking_slots;
                for (var i = parking_ids.length - 1; i >= 0; i--) {
                    var Query = 'update parking_master set status=1 where id="' + parking_ids[i] + '"';
                    pool.query(Query, function(err, rows, fields) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                }
                result.success = "Updated Successfully !";
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};
*/
exports.getFlatDetails = function(pool) {
    return function(req, res) {
        var id = req.body.flat_id;

        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = 'select fm.*, concat(r.first_name, " ", r.last_name) as residen_name, r.email as residen_email, r.contact_no as residen_contact_number, r.ownership as resdent_type, bm.parking_avail, pm.parking_id from flat_master fm inner join block_master bm on bm.id=fm.block_id left join residents r on fm.id=r.flat_id left join flat_parking_association pm on fm.id = pm.flat_id where fm.id="' + id + '"';
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

exports.AllFlatsOfBlock = function(pool) {
    return function(req, res) {
        var id = req.body.id;

        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select * from `flat_master` where block_id='" + id + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                result.status = 200;
                result.data = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.forPieChart = function(pool) {
    return function(req, res) {
        var block_id = req.body.block_id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = 'select (count(id)-(SELECT count(r.id)as booked_flats FROM residents r INNER JOIN flat_master fm On fm.id = r.flat_id where fm.block_id = "' + block_id + '"))as available_flats,(SELECT count(r.id)as booked_flats FROM residents r INNER JOIN flat_master fm On fm.id = r.flat_id where fm.block_id = "1")as booked_flats from flat_master where block_id="' + block_id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
            } else {
                result.status = 200;
                result.data = rows[0];

                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.getFlatListCount = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select count(*)as flat_count from `flat_master` where block_id='" + id + "'";
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