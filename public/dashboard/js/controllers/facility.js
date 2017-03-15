socialApp.controller('AddFacility', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
    var block_id = atob($routeParams.blockID);
    $scope.facility = {
        charges: 0,
        block_id: block_id
    };
    $scope.AddFacility = function() {
        $scope.$emit('LOAD');
        $http.post('/addFacility', $scope.facility).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $location.path('/facility-list/' + $routeParams.blockID)
            }
            $scope.$emit('UNLOAD');
        });
    }
}]);

socialApp.controller('ListFacility', ['$scope', '$http', '$routeParams', '$route', '$timeout', 'DTOptionsBuilder', function($scope, $http, $routeParams, $route, $timeout, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    var block_id = atob($routeParams.blockID);
    $scope.facilities = [];
    $scope.$emit('LOAD');
    $http.post('/listFacilities', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.facilities = response.data;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });

    $scope.deleteFacility = function(id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteFacilities', { id: id, block_id: block_id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }

        });
    }
    $scope.facilityDetail = {
        block_id: block_id
    };

    $scope.updateId = function(id) {
        $scope.$emit('LOAD');
        $scope.facilityDetail.id = id;
        $http.post('/getSingleFacility', { id: id }).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $scope.facilityDetail.facility_name = response.data.facility_name;
                $scope.facilityDetail.charges = response.data.charges;
                $scope.facilityDetail.description = response.data.description;
            }
            $scope.$emit('UNLOAD');
        });
    }

    $scope.updateFacilityDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/updateFacility', $scope.facilityDetail).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 500);
            }
        });
    }

}]);

socialApp.controller('RequestFacility', ['$scope', '$routeParams', '$http', '$route', '$timeout', 'DTOptionsBuilder', function($scope, $routeParams, $http, $route, $timeout, DTOptionsBuilder) {
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.AllRequests = [];
    $http.post('/facilityRequestesForManager', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(item, key) {
                if (item.status == 1) {
                    item.status = 'Request Approved';
                } else {
                    item.status = 'Requested';
                }
                $scope.AllRequests.push(item);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);

    });

    $scope.approveReuest = function(id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/sendApproveDetailsToResidentAboutFacility', { id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }
}]);

socialApp.controller('RequestedFacilityListForResident', ['$scope', '$http', '$timeout', 'DTOptionsBuilder', function($scope, $http, $timeout, DTOptionsBuilder) {
    $scope.$emit('LOAD');
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userDetails.id;
    $scope.Facilities = [];
    $http.post('/listOfRequestedFacilitiesForResident1', { resident_id: id }).success(function(response) {

        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(item, key) {
                if (item.status == 1) {
                    item.status = 'Request Approved';
                } else {
                    item.status = 'Requested';
                }
                $scope.Facilities.push(item);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);

    });
}]);

socialApp.controller('newFacilityRequestForResident', ['$scope', '$http', '$route', '$timeout', 'DTOptionsBuilder', function($scope, $http, $route, $timeout, DTOptionsBuilder) {
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userDetails.id;
    $scope.Facilities = [];
    $scope.$emit('LOAD');
    $http.post('/listOfFacilitiesForResident', { resident_id: id }).success(function(response) {
        if (response.hasOwnProperty('success')) {

            angular.forEach(response.data, function(item, key) {
                if (item.request_status == null || item.request_status == '') {
                    item.request_status = 3;
                }
                $scope.Facilities.push(item);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });

    $scope.RequestForFacility = function(facility_id) {
        var returnVal = confirm('Do You Want To Request For This Facility ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/requestToManagerForFacility', { facility_id: facility_id, resident_id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            } else {
                alert(response.error);
            }
        });

    }
}]);



socialApp.controller('FacilityApprove', ['$scope', '$http', '$location', '$routeParams', '$window', function($scope, $http, $location, $routeParams, $window) {
    var staff_req_id = $routeParams.facility_req_id;
    $scope.manager = {
        facility_req_id: staff_req_id,
        userName: '',
        password: '',
        manager_comment: ''
    }
    $scope.ApproveRequest = function() {
        $scope.BlankForm = false;
        if ($scope.manager.userName == '' || $scope.manager.password == '' || $scope.manager.manager_comment == '') {
            $scope.BlankForm = true;
            return;
        }
        $http.post('/ManagerLoginForArroveFacility', $scope.manager).success(function(response) {

            if (response.hasOwnProperty('error')) {
                alert(response.error);
                return;
            } else {
                $http.post('/sendApproveDetailsToResidentAboutFacility', { id: $scope.manager.facility_req_id, manager_comment: $scope.manager.manager_comment }).success(function(res) {
                    alert('Approved Successfully !');
                    $window.close();
                })
            }
        });
    }
}]);
