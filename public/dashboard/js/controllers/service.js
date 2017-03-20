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

socialApp.controller('serviceList', ['$scope', '$http', '$routeParams', '$route', '$timeout', 'DTOptionsBuilder','DTColumnDefBuilder', function($scope, $http, $routeParams, $route, $timeout, DTOptionsBuilder,DTColumnDefBuilder) {
    $scope.$emit('LOAD');
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [6, 'desc'])
         .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

         $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef([6])
                              .withOption('type', 'date')
        ];

    $scope.service_name = {};
    $scope.services = [];
   $http.post('/requestedServicesListToAdmin').success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('success')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    if (item.resident_comment == 'undefined') {
                        item.resident_comment = '--';
                    }
                    $scope.services.push(item);
                });
            }
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

socialApp.controller('serviceAll', ['$scope', '$http', '$route', 'DTOptionsBuilder','DTColumnDefBuilder', function($scope, $http, $route, DTOptionsBuilder,DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);


         $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef([5])
                              .withOption('type', 'date')
        ];

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

socialApp.controller('requestService', ['$scope', '$http', '$location', '$route', '$timeout', '$routeParams', 'DTOptionsBuilder', function($scope, $http, $location, $route, $timeout, $routeParams, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

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

socialApp.controller('Serviceall', ['$scope', '$http', '$timeout', 'DTOptionsBuilder', '$routeParams','DTColumnDefBuilder', function($scope, $http, $timeout, DTOptionsBuilder, $routeParams,DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [3, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef([3])
                              .withOption('type', 'date')
        ];
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

socialApp.controller('addHandler', ['$scope', '$http', '$location', '$timeout', '$route', function($scope, $http, $location, $timeout, $route) {

    $scope.handler_display = [];
    $http.post('/handlerList').success(function(res) {
        console.log(res);
        if (res.hasOwnProperty('success')) {
            $scope.handler_display = res.data;
        }
    });

    $scope.handler_add = {};
    $scope.addHandler = function() {
        $http.post('/addHandler', $scope.handler_add).success(function(response) {
            if (response.hasOwnProperty('error')) {
                alert('Username Already Exist');
            } else {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $location.path('/handler');
                }, 500);
            }
            $route.reload();
        });
    }

    $scope.deletedHandler = function(id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteHandler', { id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }

    $scope.handlerDetail = {};

    $scope.updateId = function(id) {
        $scope.$emit('LOAD');
        $scope.handlerDetail.id = id;

        $http.post('/getSingleHandler', { id: id }).success(function(response) {
            console.log(response);
            if (response.hasOwnProperty('success')) {
                $scope.handlerDetail.username = response.data.username;
                $scope.handlerDetail.password = response.data.password;
            }
            $scope.$emit('UNLOAD');
        });
    }
    $scope.updateHandlersDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/updateHandler', $scope.handlerDetail).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 500);
            }
        });
    }
}]);

socialApp.controller('homeserviceList', ['$scope','$http','$timeout','DTOptionsBuilder','DTColumnDefBuilder', function($scope,$http,$timeout,DTOptionsBuilder,DTColumnDefBuilder){
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [4, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef([4])
                              .withOption('type', 'date')
        ];

    $scope.homeRequests = [];    
    $scope.$emit('LOAD');
    $http.post('/homePageRequestList').success(function(response){
        console.log(response);
        if (response.hasOwnProperty('success')) {
            $scope.homeRequests = response.success;
        }
        $timeout(function(){
            $scope.$emit('UNLOAD'); 
        }, 500);
    });
}]);

socialApp.controller('regVendor', ['$scope', '$http', '$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', function($scope, $http, $timeout, DTOptionsBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [4, 'desc'])
        .withButtons(['print', 'excel', 'pdf']);
    $scope.dtColumnDefs = [DTColumnDefBuilder.newColumnDef([4])
        .withOption('type', 'date')
    ];
    $scope.registerVendor = [];
    $scope.$emit('LOAD');
    $http.post('/vendorRegistrationList').success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('success')) {
            $scope.registerVendor = response.data;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });
}]);