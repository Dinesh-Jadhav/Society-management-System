exports.getSlug = function(pool, slug) {
    return function(req, res) {
        var slug = req.body.slug;
        res.setHeader('Content-Type', 'application/json');
        var queryString = "select * from slug_master where slug='" + slug + "'";
        var result = {};
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
            } else {
                if (rows.length == 0) {
                    result.error = 'Slug not Found';
                    res.send(JSON.stringify(result));
                    return;
                }
                var from_table = rows[0].from_table;
                var id = rows[0].primary_id;
                var query = "select * from `" + from_table + "` where id=" + id;
                pool.query(query, function(err, rows, fields) {
                    if (err) {
                        console.log('error');
                    } else {
                        result.success = rows[0];
                        res.send(JSON.stringify(result));
                        return;
                    }
                });
            }
        });
    };
};

exports.getActiveSocieties = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.id,name,sm.slug,sm.address,sm.lattitute,sm.longtitute,sm.owner,DATE_FORMAT(sm.established_date,'%d, %b %Y') as established_date,sm.contact_number,sm.chair_person, sm.chair_person_contact,sm.secretary,sm.secretary_contact,sm.treasurer,sm.treasurer_contact,sm.society_manager,sm.cover_img,sm.general_img,sm.has_blocks,sm.last_update_time,sm.updated_by_ip,sm.status, sMan.manager_name from society_master as sm inner join society_manager as sMan on sm.society_manager = sMan.id where sm.status='1'";
        query += " order by id desc";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                result.success = rows;
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.getSocietyDetail = function(pool, slug) {
    return function(req, res) {
        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select sm.id,name,sm.slug,sm.address,sm.lattitute,sm.chair_person_email,sm.longtitute,sm.owner,DATE_FORMAT(sm.established_date,'%d, %b %Y') as established_date,sm.contact_number,sm.chair_person, sm.chair_person_contact,sm.secretary,sm.secretary_contact,sm.treasurer,sm.treasurer_contact,sm.society_manager,sm.cover_img,sm.general_img,sm.has_blocks,sm.last_update_time,sm.updated_by_ip,sm.status, sMan.manager_name from society_master as sm inner join society_manager as sMan on sm.society_manager = sMan.id where sm.id='" + id + "'";
        query += " order by id desc";
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

exports.addSociety = function(formidable, fs, pool,transporter, randomstring, step) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        $data = req.body;
        var name = $data.name;
        var slug = $data.slug;
        var address = $data.address;
        var lat = $data.latitude;
        var long = $data.longitude;
        var owner = $data.owner;
        var contact_number = $data.contact_number;
        var chair_person = $data.chair_person;
        var chair_person_contact = $data.chair_person_contact;
        var secretary = $data.secretary;
        var secretary_contact = $data.secretary_contact;
        var treasurer = $data.treasurer;
        var treasurer_contact = $data.treasurer_contact;
        var manager = $data.manager;
        var chair_person_email = $data.chair_person_email;
        var society_id = '';
        if ($data.has_blocks == 'Y') {
            var has_block = 1;
        } else {
            var has_block = 0;
        }
        var established_date = new Date($data.EstDate);
        var newDate = established_date.getFullYear() + '-' + (established_date.getMonth() + 1) + '-' + established_date.getDate()+' '+established_date.getHours()+'-'+established_date.getMinutes();
        var datetimestamp = Date.now();
        var cover_img_id = $data.coverImg;
        var logo_img_id = $data.logoImg;
        var updated_by_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        var result = {};
        var q= 'select * from chair_person_master where email="'+chair_person_email+'"';
        pool.query(q,function(err,rows){
            if(err){
                console.log(err);
            }else{
                if(rows.length>0){
                result.error="error";
                res.send(JSON.stringify(result));
                return;
                }else{
                  if (name == '' || slug == '' || address == '' || lat == '' || long == '' || owner == '' || contact_number == '' || chair_person == '' || chair_person_contact == '' || secretary == '' || secretary_contact == '' || treasurer == '' || treasurer_contact == '' || $data.EstDate == '' || cover_img_id == '' || logo_img_id == '') {
            result.error = 'Parameter Msissing';
            res.send(JSON.stringify(result));
            return;
        }
        step(
            function getuploaded() {
                pool.query("select imgName from image_temp where id='" + cover_img_id + "'", this);
            },
            function coverImgName(err, rows, fields) {
                if (err) {
                    console.log('coverIMg');
                } else {
                    cover_img = rows[0].imgName;
                    pool.query("select imgName from image_temp where id='" + logo_img_id + "'", this);
                }
            },
            function logoImgName(err, rows, fields) {
                if (err) {
                    console.log('LogoImg');
                } else {
                    logo_img = rows[0].imgName;
                        var inQuery = "INSERT INTO society_master (`name`,`slug`, `address`, `lattitute`, `longtitute`, `owner`, `established_date`, `contact_number`,`chair_person`, `chair_person_contact`,`secretary`,`secretary_contact`,`treasurer`,`treasurer_contact`,`society_manager`, `cover_img`, `general_img`,`has_blocks`, `last_update_time` , `updated_by_ip` , `status`,`chair_person_email`) VALUES ('" + name + "','" + slug + "','" + address + "','" + lat + "','" + long + "','" + owner + "','" + newDate + "','" + contact_number + "', '" + chair_person + "','" + chair_person_contact + "','" + secretary + "','" + secretary_contact + "','" + treasurer + "','" + treasurer_contact + "'," + manager + ",'" + cover_img + "', '" + logo_img + "' ," + has_block + ", '', '" + updated_by_ip + "' ,'1','"+chair_person_email+"')";
                                   pool.query(inQuery, this);        
                      }
                    },
              function insertResponse(err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    result.success = 'true';
                    result.lastInsertId = rows.insertId;
                    society_id = result.lastInsertId;
                    pool.query("delete from image_temp where id='" + cover_img_id + "'", this);
                }
            },
            function coverTempDeltHandler(err, rows) {
                //
                if (err) {} else {
                    pool.query("delete from image_temp where id='" + logo_img_id + "'", this);
                }
            },
            function logoTempDeltHandler(err, rows) {
                if (err) {} else {
                    if (result.lastInsertId > 0) {
                        pool.query("insert into slug_master values('NULL','" + slug + "','society_master','" + result.lastInsertId + "','1')", this);
                    }
                }
            },
            function successHandler(err, rows) {
                if (err) {} else {
                    if (rows.insertId > 0) {
                        var manager_id = society_id; /*society id*/
                        var merchant_id = req.body.merchant_id;
                        var marchant_key = req.body.marchant_key;
                        var marchant_salt = req.body.marchant_salt;
                        var Q = 'INSERT INTO society_manager_meta(`merchant_id`, `marchant_key`, `marchant_salt`, `manager_id`, `status`) VALUES ("' + merchant_id + '","' + marchant_key + '","' + marchant_salt + '","' + manager_id + '","1")';
                        pool.query(Q, function(err, rows, fields) {
                            if (err) {
                                console.log(err);
                                result.error = err;
                            } else {
                                var text = "";
                                var randS = randomstring.generate();
                                for (var i = 0; i < 10; i++) {
                                  text += randS.charAt(Math.floor(Math.random() * randS.length));
                                }
                                var q = 'INSERT INTO chair_person_master(`email`, `password`, `status`) VALUES ("'+chair_person_email+'","'+text+'","1")';

                                pool.query(q,function(err,rows){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("chair person");
                                        transporter.sendMail({
                                        from: 'man2helpsm@gmail.com',
                                        to: chair_person_email,
                                        subject: 'About society rights',
                                        html: 'Hello' + chair_person + ' !<br/> Your Login Details For Man2Help Chair Person Login are:<br/>Username:'+chair_person_email+'<br/>Passsword:'+text 

                                }, function(error, response) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('email sent');
                                        result.success = "Society Registered Successfully";
                                        res.send(JSON.stringify(result));
                                        return;
                                           }
                                     });
                                    }
                                });           
                            }
                        });

                    }
                }
            }
        );            
                }
            }
        });
        
    };
};

exports.getsocietyList = function(pool, slug) {
    return function(req, res) {
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
        var query = "select sm.id,name,sm.slug,sm.address,sm.lattitute,sm.longtitute,sm.owner,DATE_FORMAT(sm.established_date,'%d, %b %Y %H:%m:%s') as established_date,sm.contact_number,sm.chair_person, sm.chair_person_contact,sm.secretary,sm.secretary_contact,sm.treasurer,sm.treasurer_contact,sm.society_manager,sm.cover_img,sm.general_img,sm.has_blocks,sm.last_update_time,sm.updated_by_ip,sm.status, sMan.manager_name from society_master as sm inner join society_manager as sMan on sm.society_manager = sMan.id";
        if (search_key != '') {
            query += ' WHERE sm.name like "%' + search_key + '%" or sm.owner like "%' + search_key + '%"';
        }
        query += " ORDER BY sm.established_date DESC";
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log('error');
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

exports.deleteSociety = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var data = {}
        res.setHeader('Content-Type', 'application/json');
        pool.query("SELECT * FROM block_master WHERE parent_id=" + id, function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                if (rows.length > 0) {
                    for (var i = 0; i <= rows.length - 1; i++) {
                        pool.query("DELETE FROM slug_master WHERE primary_id = " + rows[i].id + " AND slug = '" + rows[i].slug + "' ", function(err, rows, fields) {});
                    }
                }
                pool.query("DELETE FROM block_master WHERE  parent_id =?", [id], function(err, rows, fields) {
                    if (err) {
                        data.error = err;
                    } else {
                        pool.query("DELETE FROM society_master WHERE id=?", [id], function(err, rows, fields) {
                            if (err) {
                                data.error = err;
                            } else {
                                pool.query("DELETE FROM slug_master WHERE primary_id = " + id + " AND from_table = 'society_master'", function(err, rows, fields) {});
                            }
                            data.success = "Society deleted Successfully";
                            res.send(data);
                            return;
                        });
                    };
                });
            };
        });
    };
};

exports.getAllSocieties = function(pool) {
    return function(req, res) {
        var query = "select * from society_master where status=1";
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getBySocietyId = function(pool) {
    return function(req, res) {
        var id = req.body.id;
        var query = "SELECT * FROM block_master WHERE parent_id=" + id;
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getResidentsForAdminByBlockId = function(pool) {
    return function(req, res) {
        var block_id = req.body.blockId;
        var query = "select r.*, fm.flat_number, bm.name as block_name, sm.name as society_name from `residents` r INNER join flat_master fm on fm.id=r.flat_id INNER join block_master bm on bm.id=fm.block_id INNER join society_master sm on sm.id=bm.parent_id where fm.block_id = '" + block_id + "'";
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getTenatsForAdminByBlockId = function(pool) {
    return function(req, res) {
        var block_id = req.body.blockId;
        var type = req.body.Group;
        var where = '';
        if (type != 3) {
            where = ' and t.status="' + type + '"';
        }
        var query = "select t.*, concat(r.first_name, ' ', r.last_name) as resident_name, fm.flat_number, bm.name as block_name, sm.name as society_name from tenant_master t INNER join `residents` r on r.id = t.resident_id INNER join flat_master fm on fm.id=r.flat_id INNER join block_master bm on bm.id=fm.block_id INNER join society_master sm on sm.id=bm.parent_id where fm.block_id = '" + block_id + "' " + where;
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}


exports.payUdetailsOfSocietyByResident = function(pool) {
    return function(req, res) {
        var data = {};
        var resident_id = req.body.resident_id;
        var query = 'select smm.* from residents r INNER JOIN flat_master fm On r.flat_id = fm.id INNER JOIN block_master bm ON fm.block_id = bm.id INNER JOIN society_manager_meta smm On bm.parent_id = smm.manager_id where r.id = "' + resident_id + '" group by manager_id';

        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows[0];
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.payUdetailsOfSociety = function(pool) {
    return function(req, res) {
        var block_id = req.body.blockId;
        var query = 'select smm.* from society_manager_meta smm INNER JOIN society_master sm ON smm.manager_id = sm.id INNER JOIN block_master bm  ON sm.id = bm.parent_id where bm.id = "' + block_id + '" group by manager_id';
        var data = {};
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows[0];
                console.log(JSON.stringify(data));
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getSingleSocietyDetails = function(pool) {
    return function(req, res) {
        var data = {};
        var society_id = req.body.id;
        var query = 'select sm.*,sm.id as societyid ,smm.* from society_master sm left JOIN block_master bm on sm.id = bm.parent_id left JOIN society_manager_meta smm on smm.manager_id = bm.block_manager where sm.id = "' + society_id + '" GROUP BY sm.id';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows[0];
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.updateSocietyDetails = function(pool) {
    return function(req, res) {
        var data = {};
        console.log(JSON.stringify(req.body));
        var society_id = req.body.societyid;
        var chair_person = req.body.chair_person;
        var secretary = req.body.secretary;
        var treasurer = req.body.treasurer;
        var owner = req.body.owner;
        var chair_person_contact = req.body.chair_person_contact;
        var secretary_contact = req.body.secretary_contact;
        var treasurer_contact = req.body.treasurer_contact;
        var established_date = req.body.established_date;
        var name = req.body.name;
        var contact_number = req.body.contact_number;
        var merchant_id = req.body.merchant_id;
        var marchant_key = req.body.marchant_key;
        var marchant_salt = req.body.marchant_salt;
        var image = req.body.logoImg;
        if(req.body.block_manager!=undefined){
         var society_manager = req.body.block_manager;
         }else{
            var society_manager = req.body.society_manager;           
        }

        if(req.body.manager_id==null){
           var society_manager = req.body.society_manager
        } 
       
        var Q = "select * from image_temp where id='" + image + "'";
        pool.query(Q,function(err, rows, fields) {
            if (err) {
                    result.error = err;
                    res.send(JSON.stringify(result));
                    }else{
                    if(rows.length>0){
            var image1 = rows[0].imgName;
            var query = 'UPDATE society_master SET owner="' + owner + '",chair_person="' + chair_person + '",secretary="' + secretary + '",treasurer="' + treasurer + '",society_manager = "' + society_manager + '",chair_person_contact = "' + chair_person_contact + '",secretary_contact = "' + secretary_contact + '",treasurer_contact = "' + treasurer_contact + '",established_date = "' + established_date + '",name = "' + name + '",contact_number = "' + contact_number + '",general_img = "'+ image1 +'" where id = "' + society_id + '"';
            pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {

                var q = 'update society_manager_meta smm INNER join block_master bm On bm.block_manager = smm.manager_id set marchant_key = "' + marchant_key + '" ,marchant_salt = "' + marchant_salt + '" ,merchant_id = "' + merchant_id + '" where bm.parent_id ="' + society_id + '"';
                console.log(q);
                pool.query(q, function(err, rows, fields) {
                   if (err) {
                        console.log(err);
                        data.error = err;
                    } else {
                        console.log("database");
                        data.success = "updated Successfully";
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(data));
                    }
                });
            }
        });
    }
}
});

 var query = 'UPDATE society_master SET owner="' + owner + '",chair_person="' + chair_person + '",secretary="' + secretary + '",treasurer="' + treasurer + '",society_manager = "' + society_manager + '",chair_person_contact = "' + chair_person_contact + '",secretary_contact = "' + secretary_contact + '",treasurer_contact = "' + treasurer_contact + '",established_date = "' + established_date + '",name = "' + name + '",contact_number = "' + contact_number + '" where id = "' + society_id + '"';
            pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                var q = 'update society_manager_meta smm INNER join block_master bm On bm.block_manager = smm.manager_id set marchant_key = "' + marchant_key + '" ,marchant_salt = "' + marchant_salt + '" ,merchant_id = "' + merchant_id + '" where bm.parent_id ="' + society_id + '"';
                console.log(q);
                pool.query(q, function(err, rows, fields) {
                   if (err) {
                        console.log(err);
                        data.error = err;
                    } else {
                        console.log("asdf");
                        data.success = "updated Successfully";
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(data));
                    }
                });
            }
        });
    }
}

exports.listOfManagers = function(pool) {
    return function(req, res) {
        var data = {};
        var society_id = req.body.id;
        var query = 'select id,manager_name from society_manager where status = 1';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.SocietyManagers = function(pool) {
    return function(req, res) {
        var data = {};
        var manager_id = req.body.id;
        var query = 'select id,manager_name from society_manager where id="' + manager_id + '"';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows[0];
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.enqiuryDetails = function(pool, transporter) {
    return function(req, res) {
        var data = {};
        var name = req.body.name;
        var email = req.body.email;
        var subject = req.body.subject;
        var description = req.body.description;
        var query = 'INSERT INTO enquiry_master(`name`, `email`, `subject`, `description`, `status`) VALUES ("' + name + '","' + email + '","' + subject + '","' + description + '","1")';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = 'Enquiry Submitted Successfully!';
				  transporter.sendMail({
                                            from:email,
                                            to: 'man2helpsm@gmail.com',
                                            subject: 'Enquiry :' + name + '-' + subject,
                                            html: 'Hello Admin! <br><br>An Enquiry is generated from '+name +' - '+email+' and the details are -<br>'+description
                                        }, function(error, response) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log('Message sent');
                                            }
                                        });
                res.send(JSON.stringify(data));
            }
        });
    }
}
/*
exports.helpDetails = function(pool) {
    return function(req, res) {
        var data = {};
        var name = req.body.name;
        var mobno = req.body.mobno;
        var service = req.body.service;
        var city = req.body.city;
        var time = req.body.time;
        var date = req.body.date;
        var query = 'INSERT INTO help_master(`name`, `mobno`, `service`, `city`, `time`, `date`, `status`) VALUES ("' + name + '","' + mobno + '","' + service + '","' + city + '","' + time + '","' + date + '","1")';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows[0];
                res.send(JSON.stringify(data));
            }
        });
    }
}*/

exports.helpDetails = function(pool,sms,transporter) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var data = {};
        var name = req.body.name;
        var mobno = req.body.mobno;
        var service = req.body.service;
        var problem_description = req.body.description;
        var city = req.body.city;
        var time = req.body.time;
        var date = req.body.date;
        var query = 'INSERT INTO help_master(`name`,`problem_description`, `mobno`, `service`, `city`, `time`, `date`, `status`) VALUES ("' + name + '","' + problem_description + '","' + mobno + '","' + service + '","' + city + '","' + time + '","' + date + '","1")';
        console.log(query);
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                transporter.sendMail({
                    from: 'man2helpsm@gmail.com',
                    to: 'man2helpsm@gmail.com ',
                    subject: 'Home page request',
                    html: 'Hello Admin! <br><br>This request is generated by ' + name + ' - ' + city + ' and the problem details are -<br>' + problem_description +' for '+service+' service and log this request for '+time+' and his mobile number is - '+mobno+'<br><br>Thank You'
                }, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                            sms.sendSMS('8983389836', 'This request is generated by ' + name + '  - ' + city +' and his mobile number is - '+mobno+'', function(res) {
                            console.log(res);
                        });
                        console.log('Message sent');
                        data.status=200;
                        data.success = rows[0];
                        res.send(JSON.stringify(data));
                    }
                });
            }
        });
    }
}

exports.payUdetailsVendor = function(pool) {
    return function(req, res) {
        var data = {};
        var vendor_id = req.body.vendor_id;
        var query = 'SELECT * FROM `vendor_master` where id = "' + vendor_id + '"';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.homePageRequestList = function(pool) {
    return function(req, res) {
        var data = {};
        //var vendor_id = req.body.vendor_id;
        var query = 'SELECT * FROM help_master order by date desc';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows;
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.getsocietyListCount = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select count(id) as S_count from society_master";

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

exports.homePageRequestListCount = function(pool) {
    return function(req, res) {
        var data = {};
        //var vendor_id = req.body.vendor_id;
        var query = 'SELECT count(id) as H_count FROM help_master';
        res.setHeader('Content-Type', 'application/json');
        pool.query(query, function(err, rows, fields) {
            if (err) {
                console.log(err);
                data.error = err;
            } else {
                data.success = rows[0];
                res.send(JSON.stringify(data));
            }
        });
    }
}

exports.societyDetails = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var block_id = req.body.block_id;
        var result = {};
        var queryString = 'SELECT sm.*,sma.manager_name FROM society_master sm inner JOIN society_manager sma on sma.id = sm.society_manager';
        pool.query(queryString, function(err, rows, fields) {
            if (err) {
                result.error = err;
                console.log(err);
            } else {
                result.data = rows;
                result.succes = "Society List Displayed Successfully";
                res.send(JSON.stringify(result));
            }
        });
    };
};

exports.getchairpersonDetail = function (pool){ 
   return function(req,res){ 
          var mailid = req.body.email;
          var result = {};
          var q='select * from chair_person_master where email= "'+mailid+'"';
          pool.query(q,function(err,rows){
          if(err){ 
              console.log(err);
              console.log("email id not found");
            }else{
              result.success=rows[0];
              res.send(JSON.stringify(result)); 
             }
           })
      }
  }

 exports.vendorRegistration = function(pool, transporter, sms) {
    return function(req, res) {
        var email = req.body.email;
        var name = req.body.name;
        var personal_message = req.body.personal_message;
        var mobile_number = req.body.mobile_number;
        var service = req.body.service;
        var result = {};
        var q = 'insert into vendor_registration (name,email,mobile_number,personal_message,service,date) values ("' + name + '","' + email + '","' + mobile_number + '","' + personal_message + '","' + service + '",now())';
        pool.query(q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                transporter.sendMail({
                    from: 'man2helpsm@gmail.com',
                    to: 'man2helpsm@gmail.com ',
                    subject: 'Vendor registration',
                    html: 'Hello Admin! This request is generated by ' + name + ' and his Message is -' + personal_message + ' for ' + service + ' service and his mobile number is - ' + mobile_number + 'Thank You'
                }, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        sms.sendSMS(mobile_number, 'Your vendor registration successfully done.', function(res) {
                            console.log(res);
                        });
                        console.log('Message sent');
                        result.success = "vendor registered successfully";
                        res.send(JSON.stringify(result));
                    }
                })
            }
        })
    }
}
exports.vendorRegistrationList = function(pool) {
    return function(req, res) {
        var result = {};
        var q = 'select * from vendor_registration';
        pool.query(q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows;
                result.success = "vendor list displayed successfully";
                res.send(JSON.stringify(result));
            }
        })
    }
}

 
/*exports.sendSmsOrNotification = function(pool) {
    return function(req, res) {
        var result = {};
          transporter.sendMail({
                    from: 'man2helpsm@gmail.com',
                    to: 'man2helpsm@gmail.com ',
                    subject: 'Vendor registration',
                    html: ''
                }, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        sms.sendSMS(mobile_number, 'Your vendor registration successfully done.', function(res) {
                            console.log(res);
                        });
                        console.log('Message sent');
                        result.success = "vendor registered successfully";
                        res.send(JSON.stringify(result));
                    }
                })
        }
}
*/

exports.sendSmsAndMailToUnpaidRes = function(pool, transporter, sms) {
    return function(req, res) {
        var result = [];
        result = req.body;
        var maintenance_id = req.body.maintanance_id;
        var Message = req.body.message;
        result1 = {};
        for (var i = result.id.length - 1; i >= 0; i--) {
            console.log(result.id[i]);
            var q = 'select r.*,fm.flat_number,bm.name as block_name,sm.name as so_name  from residents r inner join flat_master fm on fm.id =r.flat_id INNER join block_master as bm on bm.id = fm.block_id inner join society_master sm on sm.id = bm.parent_id where r.id ="' + result.id[i] + '"'
            pool.query(q, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rows);
                    var q1 = 'SELECT * FROM `maintainance_master` where id ="' + maintenance_id + '"';
                    pool.query(q1, function(err, row) {
                        if (err) {
                            console.log(err);
                        } else {
                            transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: rows[0].email,
                                subject: 'Maintenance Due',
                                html: 'Hello ' + rows[0].first_name + ' ' + rows[0].last_name + 'Your maintenance amount for ' + rows[0].so_name + '-' + rows[0].block_name + '-' + rows[0].flat_number + ' is due' + row[0].amount + ' Rs please pay your maintenance as soon as possible Message from manager is :' + Message + 'Thank you'
                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    if (rows[0].contact_no == '') {
                                        rows[0].contact_no = '999999999';
                                    }
                                    sms.sendSMS(rows[0].contact_no, 'Hello ' + rows[0].first_name + ' ' + rows[0].last_name + 'Your maintenance amount for ' + rows[0].society_name + '-' + rows[0].block_name + '-' + rows[0].flat_number + ' is due' + row[0].amount + ' Rs please pay your maintenance as soon as possibleThank you', function(res) {
                                        console.log(res);
                                    });
                                    console.log('Message sent');
                                    result.success = "notify to unpaid residents;"
                                    res.send(JSON.stringify(result));
                                }
                            })
                        }
                    })
                }
            });
        }
    }
}
exports.sendSmsOrNotification = function(transporter, sms) {
        return function(req, res) {
                var result = [];
                result = req.body;
                console.log(result);
                for (var i = result.length - 1; i >= 0; i--) {
                    console.log(result[i].contact_no);
                    console.log(result[i].society_name);
                    transporter.sendMail({
                                from: 'man2helpsm@gmail.com',
                                to: result[i].email,
                                subject: 'Defaulter maintenance ',
                                html: 'Hello ' + result[i].first_name + 'Your maintenance amount for ' + result[i].society_name + '-' + result[i].block_name + '-' + result[i].flat_number + ' is due' + result[i].dues + ' Rs please pay your maintenance as soon as possibleThank you'
                            }, function(error, response) {
                                if (error) {
                                    console.log(error);
                                } else { //console.log(result[i].society_name); 
                                  /*var contact='7387797998';                       
                                  console.log(result[i].society_name);                       
                                  sms.sendSMS(contact, 'Your maintenance amount for '+result[i].society_name+'-'+result[i].block_name+'-'+result[i].flat_number+' is due '+result[i].dues+'Rs please pay your maintenance as soon as possible.',
                                  function(res) {  
                                  console.log(res);
                                  });*/
                                  console.log('Message sent');
                                  result.success = "vendor registered successfully";
                                  res.send(JSON.stringify(result));  
                                }
                    })
                } 
        }
    }