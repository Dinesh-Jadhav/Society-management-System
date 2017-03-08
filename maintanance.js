exports.addmaintanance = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var month = req.body.month;
        var year = req.body.year;
        var amount = req.body.amount;
        var last_payment_date = req.body.last_payment_date;
        var penalty = req.body.penalty;
        var block_id = req.body.block_id;

        var result = {}
        var Q = 'select * from maintainance_master where (month BETWEEN "' + month + '" and "' + year + '") and (year BETWEEN "' + month + '" and "' + year + '")';

        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length > 0) {
                    result.success = "you are Alredy added maintanance for this month";
                    res.send(JSON.stringify(result));
                    return;
                } else {
                    var querystring = 'INSERT INTO maintainance_master(`month`, `year`, `amount`,`penalty`, `last_payment_date`, `block_id`, `staus`) VALUES ("' + month + '","' + year + '","' + amount + '","' + penalty + '","' + last_payment_date + '","' + block_id + '","0")';
                    pool.query(querystring, function(err, rows, fields) {
                        if (err) {
                            result.error = err;
                            console.log(err);
                        } else {
                            var Q = 'select r.id,concat(r.first_name," ",r.last_name) as resident_name,r.email as resident_email,fm.flat_number as flat_number,sm.name as society_name,bm.name as block_name FROM residents r INNER JOIN flat_master fm ON r.flat_id=fm.id INNER JOIN block_master bm ON bm.id = fm.block_id INNER JOIN society_master sm ON sm.id = bm.parent_id where block_id = "' + block_id + '"';
                            pool.query(Q, function(err, rows) {
                                if (err) {
                                    result.error = err;
                                    console.log(err);
                                } else {
                                    for (var i = 0; i < rows.length; i++) {
                                        var resident_name = rows[i].resident_name;
                                        var email = rows[i].resident_email;
                                        var flat_number = rows[i].flat_number;
                                        var society_name = rows[i].society_name;
                                        var block_name = rows[i].block_name;

                                        transporter.sendMail({
                                            from: 'man2helpsm@gmail.com',
                                            to: email,
                                            subject: 'About Maintainance :' + society_name + '-' + block_name,
                                            html: 'Hello ' + resident_name + '!<br/><br> Your Maintainance from ' + month + 'to' + year + ' is ' + amount + 'Rs. for ' + society_name + '-' + block_name + '-' + flat_number + '<br/> <br/> please pay your maintainance as soon as possible <br/><br/>Thank You.'
                                        }, function(error, response) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log('Message sent');
                                            }
                                        });

                                    }

                                    result.success = "Manager generate mantainance successfully";
                                    res.send(JSON.stringify(result));

                                }

                            })
                        };
                    });

                }
            }
        });

    };
};

exports.maintananceListToManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var manager_id = req.body.block_id;

        var result = {}
        var querystring = 'select * from maintainance_master where block_id="' + manager_id + '" order by last_payment_date DESC';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.maintananceListToResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.resident_id;
        var result = {}
        var querystring = 'select concat(r.first_name," ",r.last_name) as resident_name,r.contact_no,r.email,mm.* from maintainance_master mm INNER JOIN block_master bm ON mm.block_id = bm.block_manager INNER JOIN flat_master fm ON bm.id = fm.block_id INNER JOIN residents r ON fm.id = r.flat_id where r.id = "' + resident_id + '" and mm.id not in(SELECT maintainance_master_meta.maintanance_id from maintainance_master_meta inner join maintainance_master on maintainance_master.id=maintainance_master_meta.maintanance_id)';

        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
};

exports.allResidentList = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        console.log(block_id);
        var querystring = 'select * from maintainance_master mm where mm.id not in(select mmm.maintanance_id FROM maintainance_master_meta mmm INNER join residents r On r.id = mmm.resident_id INNER JOIN flat_master fm ON fm.id = r.flat_id where fm.block_id = "' + block_id + '") and mm.block_id = "' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
}


exports.paidResidentList = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var maintanance_id = req.body.maintanance_id;
        var result = {}
        var querystring = 'SELECT r.*, fm.flat_number, mm.year, mm.month, mm.amount from residents r INNER join flat_master fm on fm.id = r.flat_id INNER join block_master bm on bm.id = fm.block_id left join maintainance_master mm on bm.id = mm.block_id WHERE bm.id="' + block_id + '" and mm.id = "' + maintanance_id + '" and r.id in(SELECT resident_id from maintainance_master_meta inner join (SELECT mm1.id from maintainance_master mm1 INNER JOIN block_master bm on bm.id = mm1.block_id where mm1.block_id="' + block_id + '" and mm1.id="' + maintanance_id + '") as mm on mm.id = maintainance_master_meta.maintanance_id) GROUP by r.id';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
}

exports.unpaidResidentList = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var maintanance_id = req.body.maintanance_id;
        var result = {}
        var querystring = 'SELECT r.*, fm.flat_number, mm.year, mm.month, mm.amount from residents r INNER join flat_master fm on fm.id = r.flat_id INNER join block_master bm on bm.id = fm.block_id left join maintainance_master mm on bm.id = mm.block_id WHERE bm.id="' + block_id + '" and mm.id = "' + maintanance_id + '" and r.id not in(SELECT resident_id from maintainance_master_meta inner join (SELECT mm1.id from maintainance_master mm1 INNER JOIN block_master bm on bm.id = mm1.block_id where mm1.block_id="' + block_id + '" and mm1.id="' + maintanance_id + '") as mm on mm.id = maintainance_master_meta.maintanance_id) GROUP by r.id';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
}

exports.displayMaintananceToResidents = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json');
        var result = {}
        var block_id = req.body.block_id;
        var Q = 'select mm.month,mm.year,mm.last_payment_date,mm.amount FROM maintainance_master mm INNER JOIN flat_master fm ON fm.block_id = mm.block_id INNER JOIN residents r ON r.flat_id=fm.id where mm.block_id = "' + block_id + '" order by last_payment_date DESC';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Manager generate mantainance successfully";
                res.send(JSON.stringify(result));
            }
        })
    }
}

exports.residentDetailsForMaintainance = function(pool) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json');
        var result = {};
        var resident_id = req.body.id;
        var Q = 'select smm.marchant_key,smm.marchant_salt,concat(r.first_name," ",r.last_name) as resident_name ,r.email as resident_email ,r.contact_no as contact from residents r INNER JOIN flat_master fm ON r.flat_id = fm.id INNER JOIN block_master bm ON fm.block_id = bm.id INNER JOIN society_manager sm ON bm.block_manager = sm.id INNER JOIN society_manager_meta smm ON smm.manager_id = sm.id where r.id="' + resident_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows[0];
                result.success = 'displayed successfully';
                res.send(JSON.stringify(result));
            }

        });

    }
}

exports.notifyToResident = function(pool) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json');
        var result = {};
        var ids = [];
        ids = req.body.id;
        var message = req.body.message;
        for (var i = ids.length - 1; i >= 0; i--) {
            var resident_id = ids[i];
            var Q = 'select mm.*,concat(r.first_name, " " ,r.last_name) as resident_name ,r.email as email from maintainance_master mm INNER JOIN flat_master fm ON fm.block_id = mm.block_id INNER JOIN residents r ON fm.id = r.flat_id where mm.id not in(select maintanance_id from maintainance_master_meta mmm inner join residents r ON r.id = mmm.resident_id INNER JOIN flat_master fm ON r.flat_id = fm.id INNER JOIN block_master bm On fm.block_id = bm.id WHERE r.id = "' + resident_id + '") group by mm.id';
            pool.query(Q, function(err, rows) {
                if (err) {
                    result.error = err;
                    console.log(err);
                } else {
                    var info = "";
                    for (var i = 0; i < rows.lenght; i++) {
                        info.concate(rows[i].month)
                    }
                    var resident_name = rows[0].resident_name;
                    var email = rows[0].email;
                    transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: email,
                        subject: 'Notice for Maintainance',
                        html: 'Hello ' + resident_name + '!<br/><br> Maintainance <table><th>Maintainance MOnth</th><><tr>' + month + ',' + year + ' is ' + amount + ' <br/> please pay your maintainance as soon as possible <br/><br/>Thank You.'
                    }, function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent');
                        }
                    });
                    result.data = rows;
                    result.success = 'displayed successfully';
                    res.send(JSON.stringify(result));
                }
            });
        }
    }
}
exports.getMaintainanceDetails = function(pool) {
    return function(req, res) {
        var data = req.body;
        var block_id = data.block_id
        var no = data.no_of_last_months;
        var result = {};
        var query = 'SELECT (SELECT COUNT(id) from maintainance_master_meta WHERE maintanance_id = mm.id) as totalPaid, mm.amount, concat(mm.month, ", ", mm.year) as month from maintainance_master mm WHERE mm.block_id = "' + block_id + '" GROUP by mm.id ORDER by mm.id desc LIMIT ' + no;
        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows;
                result.success = 'displayed successfully';
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.amoutForPerticularmaintainanance = function(pool) {
    return function(req, res) {
        var maintanance_id = req.body.id;
        var result = {};
        var query = 'select amount from maintainance_master where id ="' + maintanance_id + '"';
        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows[0];
                result.success = 'displayed successfully';
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.updatePenaltyAmount = function(pool) {
    return function(req, res) {
        var maintanance_id = req.body.maintanance_id;
        var result = {};
        var count = 1;
        var today = new Date();
        var month = today.getMonth() + 1;
        var today_date = today.getFullYear() + "-" + month + "-" + today.getDate();
        var query = 'select amount,penalty,last_payment_date from maintainance_master where id ="' + maintanance_id + '"';
        pool.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                var date1 = new Date(today_date);
                var date2 = new Date(rows[0].last_payment_date);
                var diffDays = parseInt((date1 - date2) / (1000 * 60 * 60 * 24));
                var penaltyamount = Math.floor(diffDays / 30);
                if (penaltyamount == count) {
                    count++;
                    var amount = (rows[0].amount + (penaltyamount * rows[0].penalty));
                    console.log(amount);
                    var query = 'update maintainance_master set amount = "' + amount + '" where id ="' + maintanance_id + '"';
                    pool.query(query, function(err, rows) {
                        if (err) {
                            console.log(err);
                        } else {
                            result.data = rows;
                            result.success = "mantainance successfully displayed";
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    }
}

exports.defaulterResidentList = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'SELECT r.*, fm.flat_number, mm.year, mm.month, mm.amount from residents r INNER join flat_master fm on fm.id = r.flat_id INNER join block_master bm on bm.id = fm.block_id left join maintainance_master mm on bm.id = mm.block_id WHERE bm.id="' + block_id + '" and mm.id = "' + maintanance_id + '" and r.id not in(SELECT resident_id from maintainance_master_meta inner join (SELECT mm1.id from maintainance_master mm1 INNER JOIN block_master bm on bm.id = mm1.block_id where mm1.block_id="' + block_id + '" and mm1.id="' + maintanance_id + '") as mm on mm.id = maintainance_master_meta.maintanance_id) GROUP by r.id';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "mantainance successfully displayed";
                res.send(JSON.stringify(result));
            };
        });
    };
}
