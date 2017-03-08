exports.uploadPhoto = function(formidable, fs, pool) {

    return function(req, res) {
        var form = new formidable.IncomingForm();

        var $data = form.parse(req, function(err, fields, files) {
            var datetimestamp = Date.now();
            var cover_img = datetimestamp + "-" + files.file.name;
            var newfile = 'public/dashboard/uploads/' + cover_img;
            var response = {};
            fs.copy(files.file.path, newfile, function(err) {
                if (err) {
                    req.flash("error", "Oops, something went wrong! (reason: copy)");
                } else {
                    fs.unlink(files.file.path, function(err) {
                        if (err) {
                            req.flash("error", "Oops, something went wrong! (reason: deletion)");
                        }
                    });
                    pool.query("insert into image_temp (imgName, uploadedAt, status) values('" + cover_img + "','" + Date.now() + "',1)", function(err, rows, fields) {
                        response.photoId = rows.insertId;
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(response));
                    });
                }
            });
        });
    };
};
