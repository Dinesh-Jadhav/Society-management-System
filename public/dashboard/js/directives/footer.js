/*Admin panel footer*/
socialApp.directive('footer', ['$compile', function($compile) {
    return {
        restrict: 'E',
        templateUrl: 'admin/admin-panel/html/footer.html'
    }
}]);

/*Service Footer*/
socialApp.directive('servicefooter', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        templateUrl: 'serviceadmin/html/footer.html'
    }
}]);
/*socialApp.directive('residentfooter', ['$compile', '$http', '$location', '$route', function($compile, $http, $location, $route) {
    return {
        restrict: 'E',
        templateUrl: 'resident/html/footer.html',
        link: function(scope, element, attrs) {
            var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
            var resident_id = userDetails.id;
            var block_id = '';
            $http.post('/residentsBlockId', { resident_id: resident_id }).success(function(response) {
                if (response.hasOwnProperty('success')) {
                    block_id = response.success.id;
                }
            });
            var p = new Invoke({ u: resident_id, v: block_id, s: 1 });

        }
    }
}]);*/

/*Front footer*/
socialApp.directive('frontFooter', ['$compile', function($compile) {
    return {
        restrict: 'C',
        templateUrl: 'front/html/footer.html'
    }
}]);

/*Man2Help Footer*/
socialApp.directive('man2helpFooter', ['$compile', function($compile) {
    return {
        restrict: 'C',
        templateUrl: 'man2help/footer.html'
    }
}]);

/*Chat*/
socialApp.directive('chat', ['$compile', 'socketUrl', '$routeParams', function($compile, socketUrl, $routeParams) {
    return {
        restrict: 'E',
        templateUrl: 'society/html/chat.html',
        link: function($scope, element, attrs) {
            /*Socket Initialization*/

            $scope.chat = {};
            var id = window.atob($routeParams.blockID);
            var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
            var mgr_id = userDetails.id;
            $scope.currentUserId = mgr_id;
            $scope.message_by = 'Block Manager';
            var mgr_nm = userDetails.manager_name;
            $scope.messages = [];

            var socket = io.connect(socketUrl);
            // on connection to server, ask for user's name with an anonymous callback
            socket.on('connect', function() {
                var blockId = id;
                socket.emit('addUser', mgr_nm, blockId);
            });
            socket.on('updatechat', function(history) {
                $scope.messages = history;
                $scope.$apply();
            });

            $scope.send = function() {
                var message = $scope.chat.message;
                // tell server to execute 'sendchat' and send along one parameter
                var name = mgr_nm + '' + $scope.message_by;
                var userID = mgr_id;
                var blockId = id;
                var message_by = $scope.message_by;
                socket.emit('sendchat', message, name, userID, blockId, message_by);
                $scope.chat.message = '';
            }
        }
    }
}]);

socialApp.directive('residentchat', ['$compile', 'socketUrl', '$routeParams', '$http', '$timeout', function($compile, socketUrl, $routeParams, $http, $timeout) {
    return {
        restrict: 'E',
        templateUrl: 'resident/html/chat.html',
        link: function($scope, element, attrs) {
            /*Socket Initialization*/

            $scope.residentchat = {};
            /*var id = window.atob($routeParams.blockID);*/
            var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
            console.log(userDetails);
            var res_id = userDetails.id;
            var block_id = '';
            $http.post('/residentsBlockId', { resident_id: res_id }).success(function(response) {
                if (response.hasOwnProperty('success')) {
                    block_id = response.success.id;
                }
            });

            $scope.currentUserId = res_id;
            var flat_no = userDetails.flat_id;
            var res_nm = userDetails.first_name + " " + userDetails.last_name;
            $scope.message_by = res_nm + ' ' + " - " + flat_no;

            $scope.messagess = [];

            var socket = io.connect(socketUrl);
            // on connection to server, ask for user's name with an anonymous callback

            socket.on('connect', function() {
                var blockId = block_id;
                socket.emit('addUser', res_nm, blockId);
            });

            socket.on('updatechat', function(history) {
                $scope.messagess = history;
                $scope.$apply();
            });

            $scope.send = function() {
                var message = $scope.residentchat.message;
                // tell server to execute 'sendchat' and send along one parameter
                var name = $scope.message_by;
                var userID = res_id;
                var blockId = block_id;
                var message_by = $scope.message_by;
                socket.emit('sendchat', message, name, userID, blockId, message_by);
                $scope.residentchat.message = '';
            }
        }
    }
}]);
