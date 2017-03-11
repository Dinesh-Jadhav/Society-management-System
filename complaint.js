exports.addComplaint = function(pool) {
    return function(req, res) {
        var resident_id = req.body.resident_id;
        var subject = req.body.subject;
        var complaint = req.body.complaint;
        var suggestion = req.body.suggestion;

        var queryString = "INSERT INTO complaint_master(resident_id, subject,complaint,suggestion,date,status) VALUES(" + resident_id + " ,'" + subject + "', '" + complaint + "','" + suggestion + "',now(), 0)";
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                result.success = "complaint inserted successfully";
                result.last_id = rows.insertId;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.getcomplaintDetail = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');

        var id = req.body.complaintID;
        var result = {};
        var query = "SELECT cm.*, smas.name as society_name, concat(r.first_name, ' ', r.last_name) as resident_name, r.email, r.contact_no, bm.name as block_name, fm.flat_number, sman.manager_name FROM `complaint_master` cm INNER JOIN residents r on r.id=cm.resident_id INNER JOIN flat_master fm on fm.id=r.flat_id INNER JOIN block_master bm on bm.id=fm.block_id INNER JOIN society_master smas on smas.id=bm.parent_id INNER JOIN society_manager sman on sman.id = bm.block_manager where cm.id='" + id + "'";

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

exports.getcomplaintList = function(pool) {
    return function(req, res) {
        var id = req.query.id;
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

        var query = "SELECT *, CASE status WHEN '0' THEN 'Pending' WHEN '1' THEN 'Under Surveillance' WHEN '2' THEN 'Resolved' ELSE NULL END AS status, DATE_FORMAT(date, '%d %M, %Y %H:%m:%s') as date FROM complaint_master where resident_id='" + id + "'";
        if (search_key != '') {
            query += ' AND (resident_id like "%' + search_key + '%" or subject like  "%' + search_key + '%" or complaint like  "%' + search_key + '%" or suggestion like  "%' + search_key + '%" )';
        }

        query += " order by id desc";
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

exports.complaintToManager = function(pool) {
    return function(req, res) {
        var id = req.query.id;
        var status = req.query.status;
        var draw = req.query.draw;
        var start = req.query.start;
        var length = req.query.length;
        var search_key = req.query.search.value;
        var end = parseInt(start) + parseInt(length);
        var block_id = req.query.block_id;

        var pageSize = length != null ? parseInt(length) : 0;
        var skip = start != null ? parseInt(start) : 0;
        var recordsTotal = 0;

        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = "select cm.id, cm.resident_id,cm.subject, cm.complaint, cm.suggestion,r.first_name,fm.flat_number, DATE_FORMAT(cm.date, '%d %M, %Y %H:%m:%s') as date,CASE cm.status WHEN '0' THEN 'Pending' WHEN '1' THEN 'Under Surveillance' WHEN '2' THEN 'Resolved' ELSE NULL END AS complaint_status from complaint_master cm INNER JOIN residents r ON r.id = cm.resident_id INNER JOIN flat_master fm ON fm.id = r.flat_id INNER JOIN block_master bm ON bm.id = fm.block_id INNER JOIN society_manager sm ON sm.id = bm.block_manager where sm.id ='" + id + "' and bm.id = '" + block_id + "' and cm.status='" + status + "'";
        if (search_key != '') {
            query += ' AND (resident_id like "%' + search_key + '%" or subject like  "%' + search_key + '%" or complaint like  "%' + search_key + '%" or suggestion like  "%' + search_key + '%" )';
        }

        query += " order by id desc";
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

exports.updatecomplaint = function(pool) {
    return function(req, res) {
        $data = req.body;
        var id = $data.id;
        var status = $data.status;
        var comment = $data.comment;
        var result = {};
        var setData = '';
        if (status == 2) {
            setData = 'managers_comment="' + comment + '" , status="' + status + '"';
        } else {
            setData = 'status="' + status + '"';
        }
        var query = "UPDATE complaint_master SET " + setData + " WHERE id='" + id + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.success = "Complaint Status Updated Successfully";
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.getNewNotifications = function(pool) {
    return function(req, res) {
        var result = {};

        var query = "select * from complaint_master where is_new = 0 order by id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.success = rows;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.getComplaintsStatusForResident = function(pool) {
    return function(req, res) {
        var result = {};
        var id = req.body.id;
        var query = "select sum(case status when 0 then 1 else 0 end) as Pending, sum(case status when 1 then 1 else 0 end) as Under_Surveillance, sum(case status when 2 then 1 else 0 end) as Resolved from complaint_master where resident_id='" + id + "'";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                if (rows.length > 0) {
                    result.success = rows[0];
                } else {
                    result.success = { Pending: 0, Under_Surveillance: 0, Resolved: 0 };
                }
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.getComplaintsStatusForManager = function(pool) {
    return function(req, res) {
        var result = {};
        var id = req.body.id;
        var query = "select sum(case cm.status when 0 then 1 else 0 end) as Pending, sum(case cm.status when 1 then 1 else 0 end) as Under_Surveillance, sum(case cm.status when 2 then 1 else 0 end) as Resolved from complaint_master cm INNER JOIN residents rm on rm.id=cm.resident_id INNER JOIN flat_master fm on fm.id=rm.flat_id where fm.block_id='" + id + "'";
        pool.query(query, function(err, rows, fields) {

            if (err) {
                console.log(err);
                result.error = err;
            } else {
                if (rows.length > 0) {
                    result.success = rows[0];
                } else {
                    result.success = { Pending: 0, Under_Surveillance: 0, Resolved: 0 };
                }

            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.getComplaintsStatusForAdmin = function(pool) {
    return function(req, res) {
        var result = {};

        /*var query="select sum(case c.status when 0 then 1 else 0 end) as Pending, sum(case status when 1 then 1 else 0 end) as Under_Surveillance, sum(case status when 2 then 1 else 0 end) as Resolved from complaint_master";*/
        var query = "SELECT sm.name as society_name, count(c.id) as complaints FROM `complaint_master` c INNER JOIN residents r on r.id=c.resident_id INNER JOIN flat_master fm on fm.id=r.flat_id INNER JOIN block_master bm on bm.id=fm.block_id INNER JOIN society_master sm on sm.id = bm.parent_id GROUP by sm.id";
        pool.query(query, function(err, rows, fields) {

            if (err) {
                console.log(err);
                result.error = err;
            } else {
                if (rows.length > 0) {
                    result.success = rows;
                } else {
                    result.success = [];
                }
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
    };
};

exports.survillanceComplaintsStatusForResident = function(pool, transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var complaint_id = req.body.id;
        var comment = req.body.comment;
        var query = 'select concat(r.first_name," ",r.last_name) as resident_name, r.email as resident_email from complaint_master cm INNER JOIN residents r on cm.resident_id = r.id where cm.id = "' + complaint_id + '"';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                var name = '';
                var email = '';

                if (rows.length > 0) {
                    name = rows[0].resident_name;
                    email = rows[0].resident_email;
                }
                transporter.sendMail({
                    from: 'man2helpsm@gmail.com',
                    to: email,
                    subject: 'Under Survillance Complaint Status',
                    html: 'Hello ' + name + ' !<br/><br/> Your Complaint number ' + complaint_id + ' has gone underway, manger has a message for you regarding the same.<br/> Manager wrote: ' + comment + '<br/>We will resolve it as soon as posssible.<br/>Sorry for inconvinience<br><br>Thank You'

                }, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent');
                    }

                });
                result.sucess = "send the survillance complaint status";
            }
            res.send(JSON.stringify(result));
        });
    };
};