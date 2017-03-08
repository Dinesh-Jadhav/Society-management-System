exports.index = function(req, res) {
        res.sendfile('./public/index.html','utf-8'); // load the single view file (angular will handle the page changes on the front-end)
   };