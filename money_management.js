exports.residentAllFacilityMaintainance = function(pool){
    return function(req,res){
        res.setHeader('contentg-Type','application/json');
        var result = {};
        var resident_id = req.body.resident_id;
        var Q= 'select fr.*, fr.id as req_id, fr.status as request_status, fm.* from facility_request fr inner join facility_master fm on fm.id = fr.facility_id where fr.resident_id="'+resident_id+'" and fr.status=1 and fm.charges!=0';
        pool.query(Q,function(err,rows){
            if(err){
                console.log(err);
            }else{
                result.data = rows ;
                result.success = "successfully displayed";
                res.send(JSON.stringify(result));
            }            
        });
    }
}

exports.residentAllAmenityMaintainance = function(pool){
    return function(req,res){
        res.setHeader('contentg-Type','application/json');
        var result = {};
        var resident_id = req.body.resident_id;
        var Q= 'select ar.*, ar.id as req_id,ar.status as request_status, am.* from amenity_request ar inner join amenities_master am on am.id = ar.amenity_id where ar.resident_id="'+resident_id+'" and ar.status=1';
        pool.query(Q,function(err,rows){
            if(err){
                console.log(err);
            }else{
                result.data = rows ;
                result.success = "successfully displayed";
                res.send(JSON.stringify(result));
            }            
        });
    }
}