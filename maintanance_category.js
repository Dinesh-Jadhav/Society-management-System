exports.allCategory = function(pool){
  return function(req,res){
    res.setHeader('Content-Type', 'application/json');  
    var block_id =req.body.id;
    var result = {};
    var querystring='select * from maintainace_category_master'; //where block_id = "'+block_id+'"';
    pool.query(querystring,function(err, rows, fields){
      if(err)
      {
        result.error = err;
        console.log(err);
      }
      else
      {
        result.data = rows;   
        result.success = "category displayed successfully";
        res.send(JSON.stringify(result)); 
      };  
    });

  }
}


