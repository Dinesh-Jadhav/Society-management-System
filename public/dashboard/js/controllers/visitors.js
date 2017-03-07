socialApp.controller('visitorsForStaff', ['$scope', '$http', '$filter', '$route', '$timeout', function($scope, $http, $filter, $route, $timeout) {
    $scope.AllVisitors = [];
    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var block_id = userData.block_id;

    $scope.today=new Date();
    $scope.$emit('LOAD');
    $http.post('/getVisitorsForStaff', { block_id: block_id }).success(function(response) {

        if (response.hasOwnProperty('status') && response.status == 200) {
            var AllVisitors = response.data;
            var log = [];
            angular.forEach(AllVisitors, function(value, key) {
                value.estimate_arival_date_time = new Date(value.estimate_arival_date_time);
                value.enid = btoa(value.id);
                log.push(value);
            });
            $scope.AllVisitors = log;
        } else {
            alert(response.error);
        }
        $scope.$emit('UNLOAD');
    });
    $scope.visitorDetails = {};
    $scope.leaveSociety = function(visitor_id, no_of_persons) {
        $scope.visitorDetails.id = visitor_id;
        if (no_of_persons != '') {
            $scope.visitorDetails.no_of_persons = parseInt(no_of_persons);
        }

    }

    $scope.updateVisiterLeavingDetails = function() {
        $scope.$emit('LOAD');
        var details = $scope.visitorDetails;
        var date = new Date(details.date);
        details.date = $filter('date')(date, 'yyyy-MM-dd');
        details.time = $filter('date')(details.time, 'HH:mm:ss');
        details.leaving_date_time = details.date + ' ' + details.time + ':00';
        details.updated_by = userData.id;
        $http.post('/UpdateVisitorDetails', details).success(function(response) {
            if (response.hasOwnProperty('status') && response.status == '200') {
                angular.element('.closeBtn').trigger('click');
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 500);

            }
        });
    }

    $scope.updateVisiterEntryDetails = function() {
        $scope.$emit('LOAD');
        var details = $scope.visitorDetails;
        var date = new Date(details.entry_date);
        details.entry_date = $filter('date')(date, 'yyyy-MM-dd');
        details.entry_time = $filter('date')(details.entry_time, 'HH:mm:ss');
        details.entry_date_time = details.entry_date + ' ' + details.entry_time + ':00';
        details.updated_by = userData.id;

        $http.post('/UpdateVisitorEntryDetails', details).success(function(response) {
            if (response.hasOwnProperty('status') && response.status == '200') {
                angular.element('.closeBtn').trigger('click');
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 2000);
            }
        });
    }
}]);

socialApp.controller('visitorsForResident', ['$scope', '$http', '$timeout', 'DTOptionsBuilder', function($scope, $http, $timeout, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    $scope.AllVisitors = [];
    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userData.id;
    $scope.$emit('LOAD');
    $http.post('/getVisitorsForResident', { id: id }).success(function(response) {
        if (response.hasOwnProperty('status') && response.status == 200) {
            var AllVisitors = response.data;
            var log = [];
            angular.forEach(AllVisitors, function(value, key) {
                value.estimate_arival_date_time = new Date(value.estimate_arival_date_time);
                value.enid = btoa(value.id);
                log.push(value);
            });
            $scope.AllVisitors = log;
        } else {
            alert(response.error);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);

socialApp.controller('AddVisitorResident', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout) {

    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userData.id;
    $scope.visitor = {
        resident_id: id
    };
    $scope.today = new Date();
    $scope.addVisitor = function() {
        $scope.$emit('LOAD');
        $http.post('/addVisitorsByResident', $scope.visitor).success(function(response) {
            if (response.hasOwnProperty('status') && response.status == 200) {
                $location.path('/visitors-for-resident');
            } else {
                $scope.errorBlock = true;
                $scope.error = response.error;
            }
            $scope.$emit('UNLOAD');
        });
    }
}]);

socialApp.controller('AddVisitorStaff', ['$scope', '$http', '$location', '$filter', '$timeout', function($scope, $http, $location, $filter, $timeout) {
    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var block_id = userData.block_id;
    $scope.visitor = {};
    $scope.today=new Date();
    $http.post('/getSimpleResidentListOfBlock', { id: block_id }).success(function(response) {
        if (response.status == 200) {
            $scope.residents = response.success;
        }

    });
    $scope.addVisitor = function(response) {
        var details = $scope.visitor;
        details.updated_by = userData.id;

        /*details.arrival_date = $filter('date')(details.arrival_date, 'yyyy-MM-dd');
        details.arrivaltime = $filter('date')(details.arrivaltime, 'HH:mm:ss');*/

        details.arrival_date_time = details.arrival_date + ' ' + details.arrivaltime + ':00';

        $http.post('/addVisitorsByStaff', details).success(function(response) {
            if (response.status == 200) {
                $location.path('/visitors-for-staff');
            } else {
                $scope.errorBlock = true;
                $scope.error = response.error;
            }
        });
    }
}]);


socialApp.controller('DetailVisitor', ['$scope', '$http', '$routeParams', '$timeout', function($scope, $http, $routeParams, $timeout) {
    $scope.visitor = {};
    $scope.$emit('LOAD');
    var id = atob($routeParams.visitorID);
    $http.post('/getVisitorDetail', { id: id }).success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('status') && response.status == 200) {
            $scope.visitor = response.data;

            if ($scope.visitor.arival_date_time == '0000-00-00 00:00:00') {
                $scope.visitor.arival_date_time = 'N/A';
            }
            if ($scope.visitor.depart_date_time == '0000-00-00 00:00:00') {
                $scope.visitor.depart_date_time = 'N/A';
            }
            if ($scope.visitor.estimate_arival_date_time == '0000-00-00 00:00:00') {
                $scope.visitor.estimate_arival_date_time = $scope.visitor.arival_date_time;
            }
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });

}]);

socialApp.controller('ExternalVisitorsForManager', ['$scope', '$http', '$routeParams', 'DTOptionsBuilder', '$timeout', function($scope, $http, $routeParams, DTOptionsBuilder, $timeout) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    $scope.AllVisitors = [];
    var id = atob($routeParams.blockID);
    $scope.$emit('LOAD');
    $http.post('/ExternalVisitorsForManager', { id: id }).success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(item, key) {
                item.enid = btoa(item.id);
                if (item.status == 1) {
                    item.status = 'Not Come Yet';
                }
                if (item.status == 2) {
                    item.status = 'In Society';
                }
                if (item.status == 3) {
                    item.status = 'Left Society';
                }
                $scope.AllVisitors.push(item);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);
