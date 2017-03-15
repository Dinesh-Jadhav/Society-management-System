exports.addBlock= function(pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        $data = req.body;
        var block_name =  $data.name;
        var block_slug =  $data.slug;
        var block_des = $data.description;
        var block_manager= $data.manager;
        var block_storeys= $data.storeys;
        var block_flats= $data.flats;
        var block_parent_id = $data.parent_id;
        var parkAvail = $data.parkAvail;
        var parkArea = $data.parkArea;
        var result = {};

        if(block_name=='' || block_des=='' || block_storeys=='' || block_manager==''|| block_storeys=='' || block_flats==''){
            result.error = 'Parameter Missing';
            res.send(JSON.stringify(result));
            return;
        }
        if (typeof parkArea == 'undefined' || parkAvail==0) {
            parkArea = '';
        }
        var queryString = 'insert into block_master(parent_id, name, slug, description, storeys, num_of_flats, block_manager,parking_avail,parking_area, status) values("'+block_parent_id+'", "'+block_name+'", "'+block_slug+'", "'+block_des+'", "'+block_storeys+'", "'+block_flats+'", "'+block_manager+'","'+parkAvail+'","'+parkArea+'", "1")';

        pool.query(queryString, function(err, rows, fields) {
            if (err)
            {
                console.log(err);
                result.error= err;
            }
            else{
                var insertID = rows.insertId;;
                if(insertID >0)
                {
                    pool.query("insert into slug_master values('NULL','"+block_slug+"','block_master','"+insertID+"','1')");
                } 
                result.success = "Blocks added successfully";
            }

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result)); 
        });  
    }; 
};

exports.getblockList= function(pool,slug){
    return function(req,res){  
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
        var query = "SELECT sm.name as society_name,sm.slug as society_slug, bm.*, sMan.manager_name FROM block_master as bm INNER JOIN society_master as sm on sm.id=bm.parent_id inner JOIN society_manager as sMan on bm.block_manager=sMan.id WHERE bm.parent_id='"+id+"'";
        if(search_key!=''){
            query +=' and (sm.name like "%'+search_key+'%" or bm.name like "%'+search_key+'%")';
        }

        query += " order by bm.id desc";
        pool.query(query, function(err, rows, fields){
            if(err){
                console.log(err);
            }else{
                result.draw = draw;
                recordsTotal = rows.length;
                result.recordsTotal = recordsTotal;

                var resultData = []
                resultData.push(rows.slice(skip, parseInt(skip)+parseInt(pageSize)));

                result.recordsFiltered = recordsTotal;
                result.success = JSON.stringify(resultData[0]);
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

exports.deleteBlock = function(pool){
    return function(req,res){
        var id =  req.body.id;
        var data = {}
        pool.query("DELETE FROM block_master WHERE id=?",[id],function(err, rows, fields){
            if(err){
                data.error = err;
            }else{
                pool.query("DELETE FROM slug_master WHERE primary_id = "+id+" AND from_table = 'block_master'",function(err, rows, fields){
                    if(err){
                        data.error = err;
                    }else{
                    }
                        data.success = "Block deleted Successfully";
                });
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data)); 
            };  
        });

    };
};

exports.editBlock= function(pool){
    return function(req,res){

        $data = req.body;
        var  block_id =$data.id;
        var block_name =  $data.name;
        var block_des = $data.description;
        var block_manager= $data.block_manager;
        var block_storeys= $data.storeys;
        var block_flats= $data.num_of_flats;
        var parkAvail = $data.parking_avail;
        var parkArea = $data.parking_area;
        var result = {};

        if (typeof parkArea == 'undefined' || parkAvail==0) {
            parkArea = '';
        }

        pool.query("UPDATE block_master SET name='"+block_name+"', description='"+block_des+"', storeys='"+block_storeys+"', num_of_flats='"+block_flats+"', block_manager='"+block_manager+"', parking_avail='"+parkAvail+"', parking_area='"+parkArea+"' WHERE id='"+block_id+"'", function(err, rows, fields){
            if(err){
                console.log(err);
                result.error = err;
            }
            else{
                result.success = "Blocks Updated Successfully";
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result)); 
        });
    }
};

exports.getSingleBlock= function(pool,slug){
    return function(req,res){  

        var id = req.body.id;
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var query = "select b.*, sm.general_img as logo from `block_master` b right JOIN society_master sm on sm.id=b.parent_id where b.id="+id;
        pool.query(query, function(err, rows, fields){
            if(err){
                console.log(err);
            }else{
                result.success = rows[0];
                res.send(JSON.stringify(result));
                return;
            }
        });
    }
};

/*exports.block_chairman= function(pool){
 
}*/