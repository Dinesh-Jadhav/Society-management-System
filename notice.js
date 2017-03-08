exports.insertNotice = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var notice_to = req.body.notice_to;
        var notice_content = req.body.notice_content;
        var block_id = req.body.block_id;
        var notice_subject = req.body.notice_for;
        var queryString = 'INSERT INTO notice_master( `notice_to`,`notice_subject` ,`notice_content`,`notice_date`, `block_id`, `status`) VALUES ("' + notice_to + '","' + notice_subject + '","' + notice_content + '", now(), "' + block_id + '", "1")';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                var arr = [];
                arr = notice_to.split(",");
                for (var i = 0; i < arr.length; i++) {
                    var resident_id = arr[i];
                    var Q = 'select email, concat(first_name, " ", last_name) as name from residents where id = "' + resident_id + '"';
                    // console.log(Q);
                    pool.query(Q, function(err, rows) {
                        if (err) {
                            result.error = err;
                            console.log(err);
                        } else {
                            var resident_name = rows[0].name;
                            var email = rows[0].email;
                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: email,
                                subject: 'Notice',
                                html: 'Hello ' + resident_name + '!<br/><br><b>Subject</b>: ' + notice_subject + '<br/><br/>' + notice_content + '<br/><br/>Thank You.'
                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Message sent');
                                }
                            });
                        }
                    });

                }
                result.success = "Notice inserted successfully";
                res.send(JSON.stringify(result));
            }
        });
    };
};

exports.listOfNoticeToManager = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var queryString = 'select * from notice_master where block_id="' + block_id + '"';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Notice list displayed successfully";
                res.send(JSON.stringify(result));
            }
        });
    };
};

exports.sentNoticeToResidents = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('content-Type', 'application/json');
        var result = {}
        var notice_to = req.body.notice_to;
        var notice_id = req.body.id;
        var new_content = req.body.new_content;
        var arr = [];
        arr = notice_to.split(",");
        for (var i = 0; i < arr.length; i++) {
            var resident_id = arr[i];
            var Q = 'select r.id as resident_id, nm.*,concat(r.first_name , " " , r.last_name) as resident_name , r.email as resident_email,fm.flat_number from notice_master nm INNER JOIN flat_master fm ON fm.block_id = nm.block_id INNER JOIN residents r ON r.flat_id = fm.id where nm.id = "' + notice_id + '" and r.id = "' + resident_id + '"';
            pool.query(Q, function(err, rows) {
                if (err) {
                    result.error = err;
                    console.log(err);
                } else {
                    var resident_name = rows[0].resident_name;
                    var email = rows[0].resident_email;
                    var subject = rows[0].notice_subject;
                    var content = rows[0].notice_content;
                    transporter.sendMail({
                        from: 'man2helpsm@gmail.com',
                        to: email,
                        subject: 'Resend Notice',
                        html: 'Hello ' + resident_name + '!<br/><br><b>Subject</b>: ' + subject + '<br/><br/>' + content + '<br/><br/><b>Manager Wrote</b>: ' + new_content + '<br/><br/>Thank You.'
                    }, function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent');
                        }
                    });
                    result.success = " successfully";
                    res.send(JSON.stringify(result));
                }
            });
        }
    }
}

exports.listOfNoticeToResidents = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.id;
        var queryString = 'SELECT r.*,nm.* FROM `notice_master` nm INNER JOIN flat_master fm on fm.block_id = nm.block_id INNER JOIN residents r on r.flat_id = fm.id where find_in_set("'+resident_id+'",nm.notice_to) and r.id="'+resident_id+'"';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Notices displayed successfully";
                res.send(JSON.stringify(result));
            }
        });
    };
};

exports.listOfNoticeToResidentsCount = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.id;
        var queryString = 'SELECT count(r.id) as ncount FROM notice_master nm INNER JOIN flat_master fm on fm.block_id = nm.block_id INNER JOIN residents r on r.flat_id = fm.id where find_in_set("'+resident_id+'",nm.notice_to) and r.id="'+resident_id+'"';
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows[0];
                result.success = "Notices count successfully";
                res.send(JSON.stringify(result));
            }
        });
    };
};