var urlencode = require('urlencode');
var http = require('http');

var sendSMS = function(number, message, callbackFunc) {
    var msg = urlencode(message);
    var username = 'sajjanshettyab@gmail.com';
    var hash = '6277f5b0f21e5c34345a02df91848f989d6a95ef'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
    var res = {};
    var sender = 'txtlcl';
    var data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + number + '&message=' + msg
    var path = '/send?' + data
    var options = {
        host: 'api.textlocal.in',
        path: '/send?' + data,
    };

    callback = function(response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function(chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function() {
                res.message = "Message sent successfully";
                res.status = true;
                callbackFunc(res);
            });
        }
        //console.log('hello js'))
    http.request(options, callback).end();
}
module.exports = {
    sendSMS: sendSMS
};
