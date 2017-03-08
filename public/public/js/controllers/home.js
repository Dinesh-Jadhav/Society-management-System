socialApp.controller('home', ['$scope', '$http', '$timeout', '$window', function($scope, $http, $timeout, $window) {
    $scope.help = {
        time: '9am-12pm',
        service: 'Architech'
    };
    /*$http.post('/ListServices').success(function(response){
        console.log(response);
    })*/
    $scope.today = new Date();
    $scope.requestHelp = function() {
            $http.post('/helpDetails', $scope.help).success(function(response) {
                $timeout(function() {
                    $window.location.href = 'http://man2help.com/anyuser.php';
                }, 500);
            });
        }
        /*$scope.requestHelp = function() {
            $http
                .post(
                    'http://man2help.com/anyuser.php',
                    $scope.help
                )
                .then(
                    function successCallback(response) {
                        console.log(response);
                    },
                    function errorCallback(response) {
                        console.log(response);
                    }
                );
        }*/
    $scope.enq = {};
    $scope.enquiry = function() {
        $http.post('/enqiuryDetails', $scope.enq).success(function(response) {
            $timeout(function() {
                $scope.enq = response.data;
            }, 500);
        });
    }
}]);
