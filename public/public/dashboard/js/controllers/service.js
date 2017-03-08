socialApp.controller('service', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.service_name = {};
    $scope.addService = function() {
        $scope.$emit('LOAD');
        $http.post('/addService', { service_name: $scope.service_name.name, description: $scope.service_name.description }).success(function(res) {
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('success')) {
                $location.path('/service-all')
            };
        });
    }
}]);
socialApp.controller('serviceList', ['$scope', '$http', '$routeParams', '$route', '$timeout', function($scope, $http, $routeParams, $route, $timeout) {
    $scope.$emit('LOAD');
    $scope.service_name = {};
    $scope.services = [];
    $http.post('/requestedServicesListToAdmin').success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.services = response.data;
        }
        $scope.$emit('UNLOAD');
    });
    $scope.updateData = {};
    $scope.setId = function(id) {
        $scope.updateData.id = id;
    }
    $scope.UpdateStatus = function(req_id, status) {

        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/updateServiceRequestStatus', { id: req_id, status: status, comment: $scope.updateData.comment }).success(function(res) {
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('success')) {
                $timeout(function() {
                    $route.reload();
                }, 200);

            }
        });
    }
}]);

socialApp.controller('serviceAll', ['$scope', '$http', '$route', function($scope, $http, $route) {
    $scope.services = [];
    $scope.$emit('LOAD');
    $http.post('/ListServices').success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.services = response.data;
        }
        $scope.$emit('UNLOAD');
    });

    $scope.deleteService = function(service_id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteService', { service_id: service_id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }

}]);

socialApp.controller('requestService', ['$scope', '$http', '$location', '$route', '$timeout', '$routeParams', function($scope, $http, $location, $route, $timeout, $routeParams) {
    var block_id = atob($routeParams.blockID);

    $scope.services = [];
    $scope.$emit('LOAD');
    $http.post('/ListServices').success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.services = response.data;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });

    $scope.residents = [];
    $http.post('/getSimpleResidentListOfBlock', { id: block_id }).success(function(res) {
        console.log(res);
        if (res.hasOwnProperty('status') && res.status == 200) {
            $scope.residents = res.success;
            console.log($scope.residents);
            $scope.$emit('UNLOAD');
        } else {
            $scope.$emit('UNLOAD');
        }
    });
    $scope.RequestDetails = {
        block_id: block_id
    };
    $scope.RequestForService = function() {
        $scope.$emit('LOAD');
        $http.post('/service_request', $scope.RequestDetails).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $location.path('/view-services/' + $routeParams.blockID);
            }
        })
    }
}]);

socialApp.controller('Serviceall', ['$scope', '$http', '$timeout', 'DTOptionsBuilder', '$routeParams', function($scope, $http, $timeout, DTOptionsBuilder, $routeParams) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);
    //var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var block_id = atob($routeParams.blockID);

    //console.log(userDetails);
    $scope.AllRequests = [];


    $scope.$emit('LOAD');
    $http.post('/listOfRequestedServicesManager', { block_id: block_id }).success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('success')) {
            var log = [];
            angular.forEach(response.data, function(dataVal, key) {
                if (dataVal.status == 0) {
                    dataVal.status = 'Requested';
                }
                if (dataVal.status == 1) {
                    dataVal.status = 'Under Servigillance';
                }
                if (dataVal.status == 2) {
                    dataVal.status = 'Done';
                }
                log.push(dataVal);
            });
            $scope.AllRequests = log;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });
}]);
