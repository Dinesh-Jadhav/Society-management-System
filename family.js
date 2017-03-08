exports.addFamilyMember = function(pool) {
    return function(req, res) {
        var data = req.body;
        var resident_id = data.resident_id;
        var contact_no = data.contact_no;
        var dob = data.dob;
        var email = data.email;
        var gender = data.gender;
        var marital_status = data.marital_status;
        var name = data.name;
        var relation = data.relation;
        var occupation = data.occupation
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        if (typeof resident_id === 'undefined' || typeof dob === 'undefined' || typeof gender === 'undefined' || typeof marital_status === 'undefined' || typeof name === 'undefined' || typeof relation === 'undefined') {
            result.error = "Parameter Missing";
            res.send(JSON.stringify(result));
            return;
        }

        var query = 'insert into family_members(resident_id, name, contact_number, email, date_of_birth, gender, relation, marital_status, status, occupation) values("' + resident_id + '", "' + name + '", "' + contact_no + '", "' + email + '", "' + dob + '", "' + gender + '", "' + relation + '", "' + marital_status + '", "1", "' + occupation + '")';
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.err = err;
            } else {
                result.success = "Member Added Successfully !";
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.getFamiliyMembersForresident = function(pool) {
    return function(req, res) {
        var data = req.body;
        var resident_id = data.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};

        var query = 'select * from family_members where resident_id=' + resident_id;
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.err = err;
            } else {
                result.success = "Executed Successfully !";
                result.data = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.updateFamilyDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var member_id = req.body.id;
        var name = req.body.name;
        var contact_number = req.body.contact_number;
        var email = req.body.email;
        var date_of_birth = req.body.date_of_birth;
        var gender = req.body.gender;
        var relation = req.body.relation;
        var occupation = req.body.occupation;
        var result = {};
        var querystring = 'update family_members SET name = "' + name + '", contact_number = "' + contact_number + '",email ="' + email + '",date_of_birth ="' + date_of_birth + '",gender ="' + gender + '",relation ="' + relation + '",occupation ="' + occupation + '",occupation ="' + occupation + '" where id="' + member_id + '"';
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

exports.getSingleFamilyDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var result = {}
        var querystring = 'select * from family_members where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                console.log(err);
                result.error = err;
            } else {
                result.data = rows[0];
                result.success = "Families Displayed successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}

exports.deleteFamilyMember = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var id = req.body.id;
        var result = {}
        var querystring = 'delete from family_members where id="' + id + '"';
        pool.query(querystring, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.success = "Families Deleted successfully";
                res.send(JSON.stringify(result));
            };
        });
    }
}
