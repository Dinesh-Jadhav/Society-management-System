exports.addContribution = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var contribution_sub = req.body.contribution_sub;
        var charge = req.body.charge;
        var description = req.body.description;
        var block_id = req.body.block_id;
        var image = req.body.image;
        var last_payment_date = req.body.last_date;
        var result = {}
        var queryString = "select * from image_temp where id='" + image + "'";
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
                res.send(JSON.stringify(result));
            } else {
                if (rows.length > 0) {
                    var id_imageName = rows[0].imgName;
                    var Q = 'INSERT INTO contribution (`title`, `amount`, `block_id`, `description`, `image`,`last_payment_date`, `status`) VALUES ("' + contribution_sub + '","' + charge + '","' + block_id + '","' + description + '","' + id_imageName + '","' + last_payment_date + '","0")';
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

exports.listContribution = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {}
        var querystring = 'select * from contribution where block_id="' + block_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Contribution Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.listContributionForResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var resident_id = req.body.id;
        var result = {}
        var querystring = 'select c.*, (case when (select count(id) from contribution_master where resident_id=r.id and contribution_id=c.id) then "Paid" else "Unpaid" end) as isPaid from contribution c inner join block_master bm on bm.id=c.block_id inner join flat_master fm on fm.block_id = bm.id inner join residents r on r.flat_id = fm.id where r.id ="' + resident_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Contribution Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}
exports.deleteContri = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var contri_id = req.body.id;
        var result = {}
        var querystring = 'delete from contribution where id="' + contri_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Contribution Deleted successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.getSingleContributions = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var result = {}
        var querystring = 'select * from contribution where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "Contribution Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.listOfPaidContributionByResident = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var contribution_id = req.body.id;
        var result = {}
        var querystring = 'select c.*,cm.*,r.* from contribution c INNER JOIN contribution_master cm ON c.id = cm.contribution_id INNER JOIN residents r ON r.id = cm.resident_id INNER Join flat_master fm ON fm.id = r.flat_id INNER JOIN block_master bm ON fm.block_id = bm.id INNER JOIN contribution cc ON bm.id = cc.block_id where c.id = "' + contribution_id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {

                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "Contribution List Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.amoutForPerticularContribution = function(pool) {
    return function(req, res) {
        var contribution_id = req.body.id;
        var result = {};
        var query = 'select amount from contribution where id ="' + contribution_id + '"';
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

exports.deleteContributions = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var result = {}
        var querystring = 'delete from contribution where id="' + id + '"';
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

exports.updateContributionDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var amount = req.body.amount;
        var description = req.body.description;
        var change_date = req.body.last_payment_date;
        var d =new Date(change_date);
        var last_payment_date = d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+d.getMinutes();
        console.log(last_payment_date);
        var title = req.body.title;
        var result = {};
        var querystring = 'update contribution SET title = "' + title + '", amount = "' + amount + '",description ="' + description + '",last_payment_date ="' + last_payment_date + '" where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Contribution updated successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}
