/*exports.conversation = function(socket, pool) {
    socket.on('sendchat', function(username, user_id, message, block_id) {
        // we tell the client to execute 'updatechat' with 4 parameters
        // console.log(resident_data);
        var username = "pritesh";
        var user_id = "2";
        var message = "shdg";
        var block_id = "2";
        var result = {};
        console.log(username);
        var Q = 'INSERT INTO `chat_history`(`sender_id`, `message`, `datetime`, `block_id`, `status`) VALUES ("' + user_id + '","' + message + '",now(),"' + block_id + '","1")';
        console.log(Q);
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            }
        });
        var Q = 'select * from chat_history where block_id = "' + block_id + '"';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log(rows);
                result.data = rows;
                //io.sockets.in('room' + blockid).emit('storechat', name, user_id, data, blockid);
            }
        });
    });


    // when the user disconnects.. perform this
    socket.on('disconnect', function() {
        // remove the username from global usernames list
        /* delete usernames[socket.username];
         
        socket.leave(socket.room);
    });
}
*/

exports.getBlockNumbers = function(pool) {
    return function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        var Q = 'select id from block_master';
        pool.query(Q, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                result.data = rows;
                res.send(JSON.stringify(result));
            }
        });
    }
}
