exports.addJobcard = function(pool) {
    return function(req, res) {
        var result = {};
        var vendor_id = req.body.vendor_id;
        var category_id = req.body.category_id;
        var block_id = req.body.block_id;
        var type = req.body.job_card_type;
        var contract_type = req.body.contract_type;
        var total_visits = req.body.total_visits;
        var approximate_visit_date = req.body.approximate_visit_date;
        var reccuring_days = req.body.reccuring_days;
        var description = req.body.description;
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;
        var pay_type = req.body.pay_type;
        var charge = req.body.charge;

        var Q = 'INSERT INTO job_card_master(`vendor_id`, `category_id`, `block_id`, `job_card_type`, `contract_type`,`start_date`,`end_date`, `total_visits`,`visits_left`, `approximate_visit_date`, `reccuring_days`,`pay_type`,`charge`,`description`, `status`) VALUES ("' + vendor_id + '","' + category_id + '","' + block_id + '","' + type + '","' + contract_type + '","' + start_date + '","' + end_date + '","' + total_visits + '", "' + total_visits + '","' + approximate_visit_date + '","' + reccuring_days + '","' + pay_type + '","' + charge + '","' + description + '","-1")';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.success = "JobCard added successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.updateJobcardStatus = function(pool) {
    return function(req, res) {
        var result = {};
        var jobcard_id = req.body.job_card_id;

        var Q = 'Update job_card_master SET status = "1" where id = "' + jobcard_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.sucess = "JobCard Updated successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.deleteJobcardStatus = function(pool) {
    return function(req, res) {
        var result = {};
        var jobcard_id = req.body.job_card_id;

        var Q = 'delete from job_card_master where id = "' + jobcard_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.success = "JobCard deleted successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.jobcardDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var block_id = req.body.block_id;
        var Q = 'select vm.*, jm.*, mm.*, jm.id as job_card_id from job_card_master jm INNER JOIN vendor_master vm ON vm.id = jm.vendor_id INNER JOIN maintainace_category_master mm ON mm.id = jm.category_id where jm.block_id = "' + block_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows;
                result.success = "viewed successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.singlejobcardDetailsWithVendor = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var jobcard_id = req.body.job_card_id;
        var Q = 'select vm.*,jm.*,mm.* from vendor_master vm INNER JOIN job_card_master jm ON vm.id = jm.vendor_id INNER JOIN maintainace_category_master mm ON mm.id = jm.category_id where jm.id = "' + jobcard_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows;
                result.success = "viewed successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.jobcardDetailsForPrint = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var jobcard_id = req.body.id;
        var Q = 'select vm.*,jm.*,mm.category,sm.address,sm.name as society_name, sm.general_img,sma.manager_name, bm.name as block_name from vendor_master vm INNER JOIN job_card_master jm ON vm.id = jm.vendor_id INNER JOIN maintainace_category_master mm ON mm.id = jm.category_id INNER JOIN block_master bm ON jm.block_id = bm.id INNER JOIN society_master sm ON bm.parent_id = sm.id INNER JOIN society_manager sma ON bm.block_manager = sma.id where jm.id = "' + jobcard_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.sucess = "viewed successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}


exports.getJobCardsByVendorID = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var vendor_id = req.body.vendor_id;
        var Q = 'select id from job_card_master where vendor_id="' + vendor_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows;
                result.sucess = "viewed successfully";
                res.send(JSON.stringify(result));
            }
        });
    }
}

exports.addmaintainanceCategory = function(pool) {
    return function(req, res) {
        var category = req.body.category;
        var block_id = req.body.block_id;
        var result = {};
        var Q = 'insert into maintainace_category_master(`category`,`addedon`,`block_id`) VALUES ("' + category + '",now(),"' + block_id + '")';

        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {   
                    result.status = '200';
                    result.data = rows;
                    res.send(JSON.stringify(result));
            }
        });
    }
}

exports.listMaintainanceCategory = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var block_id = req.body.id;
        var Q = 'select * from maintainace_category_master';
        pool.query(Q, function(err, rows) {
            if (err) {
                result.error = err;
            } else {
                result.data = rows;
                result.success = "displayed successfully";
                res.send(JSON.stringify(result));
            };
        })
    }
}

exports.deleteMaintainanceCategory = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var category_id = req.body.id;
        var result = {}
        var querystring = 'delete from maintainace_category_master where id="' + category_id + '"';
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