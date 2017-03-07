var slug = require('slug');
var moment = require('moment'); 
var loop = require('node-while-loop');

function slugify(text) {
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}


exports.checkSlug = function(slug,moment,async,pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var rSlug = req.body.rslug;
        var type = req.body.entity;
        var select_table= '';    
        var ppSlug = slugify(rSlug);
        var ppSlugN = ppSlug;
        var flag = '0';
        var $i = 1;
        var result = {};
        var $i1 = 1;
        var retval = null;
        switch (type)
        {
            case 'society':
            retval ='society_master';
            break;
        }
        async.whilst(function () {
            return $i1 == 1;
            },function (next) {
                function isExist(ppSlug, callback){
                    var query ="select id from slug_master where slug='"+ppSlug+"'";    
                    pool.query(query,function(err, rows, fields){
                        if(err)
                        {
                            console.log(err);
                        }
                        else{
                            if(rows.length>0)
                            {
                                callback(null,1);
                            }
                            else
                            {
                                callback(null,0);
                            }
                        }  
                    });    
                };
                isExist(ppSlug,function(err,content){
                    if(content==0)
                    {   
                        $i1 = 0;
                        result.slug = ppSlug;
                        res.send(JSON.stringify(result)); 
                    }
                    else
                    { 
                        ppSlug = ppSlugN+'-'+$i;
                        $i++;    
                    }
                    next();
                });
        },function(err){

        });
    };
};

exports.addSlug = function(slug,moment,async,pool){
    return function(req,res){
        res.setHeader('Content-Type', 'application/json');
        var slug = req.body.slug;
        var from_table=req.body.from_table;
        var primary_id= req.body.primary_id;
        var status = req.body.status;
        var result = {}; 
        var query="INSERT INTO `slug_master `(`slug`, `from_table`, `primary_id`, `status`) VALUES ('"+slug+"','"+from_table+"',"+primary_id+","+status+")";
        pool.query(query, function(err, rows, fields)  {
            if (err){
                result.error= err;
            }else{
             result.success= "slug Inserted Successfully.";
            }
            res.send(JSON.stringify(result)); 
        });
    };
}
