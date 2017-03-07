socialApp.controller('CreateJobCard', ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location) {
    var block_id = atob($routeParams.blockID);
    $scope.maintainance = {
        block_id: block_id
    };
    $scope.Vendors = {
        block_id: block_id
    };
    $scope.approximate = [];
    for (var i = 1; i <= 30; i++) {
        $scope.approximate.push(i);
    }
    $scope.today = new Date();
    /*Get list of managers*/
    $scope.$emit('LOAD');

    $scope.maintainance_category = {
        block_id: block_id
    };
    $http.post('/allCategory', $scope.maintainance_category).success(function(response) {
        $scope.maintainance_category = response.data;
        $http.post('/listvendors', $scope.Vendors).success(function(response) {
            $scope.Vendors = response.data;
            $scope.$emit('UNLOAD');
        });
    });

    $scope.addMaintainance = function() {
        $scope.$emit('LOAD');
        if ($scope.maintainance.job_card_type == 1) {
            $scope.maintainance.contract_type = '';
            $scope.maintainance.total_visits = '';
            $scope.maintainance.approximate_visit_date = 0;
            $scope.maintainance.reccuring_days = '';
        }
        if ($scope.maintainance.contract_type == 1) {
            $scope.maintainance.approximate_visit_date = 0;
            $scope.maintainance.reccuring_days = '';
        }
        $http.post('/addJobcard', $scope.maintainance).success(function(response) {
            console.log($scope.maintainance);
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $location.path('/job-card-display/' + btoa(block_id));
            }
        })
    }
}]);

socialApp.controller('RecurrentJobCard', ['$scope', '$routeParams', '$http', '$route', '$window', 'DTOptionsBuilder', function($scope, $routeParams, $http, $route, $window, DTOptionsBuilder) {
    $scope.$emit('LOAD');
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    var block_id = atob($routeParams.blockID);
    $scope.jobcard = {
        block_id: block_id
    };
    $scope.jobcard = [];
    $http.post('/jobcardDetails', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    item.enc_id = btoa(item.job_card_id);
                    if (item.job_card_type == 2) {
                        item.job_card_type = "Recurring";
                    } else {
                        item.job_card_type = "Onetime";
                    }
                    $scope.jobcard.push(item);
                });
            }
        }
        $scope.$emit('UNLOAD');
    });
    $scope.deleteJob = function(job_id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteJobcardStatus', { job_card_id: job_id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }

    $scope.print = function(jobId) {
        $window.open('#/job-card-print/' + $routeParams.blockID + '/' + btoa(jobId), "popup", "width=600,height=400,left=10,top=50");
    }
}]);
socialApp.controller('viewJobCard', ['$scope', '$routeParams', '$location', '$http', function($scope, $routeParams, $location, $http) {
    $scope.$emit('LOAD');
    var id = '';
    if (!angular.isUndefined($routeParams.blockID)) {
        id = atob($routeParams.blockID);
    }

    var job_id = atob($routeParams.jobCardID);

    $scope.jobcardDetail = {};
    $http.post('/singlejobcardDetailsWithVendor', { job_card_id: job_id }).success(function(response) {

        if (response.hasOwnProperty('success')) {
            $scope.jobcardDetail = response.data[0];
            if ($scope.jobcardDetail.category == '') {
                $scope.jobcardDetail.category = 'N/A';
            }
            if ($scope.jobcardDetail.block_id == '') {
                $scope.jobcardDetail.area = 'N/A';
            }
            if ($scope.jobcardDetail.vendor_name == '') {
                $scope.jobcardDetail.vendor_name = 'N/A';
            }
            if ($scope.jobcardDetail.job_card_type == '') {
                $scope.jobcardDetail.job_card_type = 'N/A';
            }
            if ($scope.jobcardDetail.contract_type == '') {
                $scope.jobcardDetail.contract_type = 'N/A';
            }
            if ($scope.jobcardDetail.start_date == '') {
                $scope.jobcardDetail.start_date = 'N/A';
            }
            if ($scope.jobcardDetail.total_visits == '') {
                $scope.jobcardDetail.total_visits = 'N/A';
            }
            if ($scope.jobcardDetail.reccuring_days == '') {
                $scope.jobcardDetail.reccuring_days = 'N/A';
            }
            if ($scope.jobcardDetail.description == '') {
                $scope.jobcardDetail.description = 'N/A';
            }
            if ($scope.jobcardDetail.job_card_type == 2) {
                $scope.jobcardDetail.job_card_type = "Recurring";
                $scope.Recurring = true;
            } else {
                $scope.jobcardDetail.job_card_type = "Onetime";
            }
            if ($scope.jobcardDetail.contract_type == 1) {
                $scope.jobcardDetail.contract_type = "Periodic";
            } else {
                $scope.jobcardDetail.contract_type = "AMC";
            }
        }
        $scope.$emit('UNLOAD');
    });
}]);

socialApp.controller('JobCardPrint', ['$scope', '$routeParams', '$window', '$timeout', '$http', function($scope, $routeParams, $window, $timeout, $http) {
    var jobID = atob($routeParams.jobCardID);
    $scope.societyLogo = '1477314891243-Pacific_Bulb_Society_logo.jpg';
    $scope.$emit('LOAD');
    $http.post('/jobcardDetailsForPrint', { id: jobID }).success(function(res) {
        $scope.$emit('UNLOAD');
        if (res.hasOwnProperty('sucess')) {
            var temp = res.data;
            if (temp.job_card_type == 1) {
                temp.jobCardType = 'Onetime';
            } else if (temp.job_card_type == 2) {
                temp.jobCardType = 'Recurring';
            } else {
                temp.jobCardType = 'N/A';
            }
            if (temp.contract_type == 1) {
                temp.contractType = 'Periodic';
            } else if (temp.contract_type == 2) {
                temp.contractType = 'Annual Maintainance';
                temp.end_date = new Date(temp.start_date).setFullYear(new Date().getFullYear() + 1)
            } else {
                temp.contractType = 'N/A';
            }
            $scope.complaintDetail = temp;
            $timeout($window.print, 0);
        }
    });
}]);

socialApp.controller('mainCategory', ['$scope','DTOptionsBuilder','$routeParams','$route','$location','$http','$timeout', function($scope,DTOptionsBuilder,$routeParams,$route,$location,$http,$timeout){
  $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
   var block_id = atob($routeParams.blockID);
   $scope.maintainCategory={
        block_id: block_id
    };

    $scope.maintain_category=[];
    $http.post('/listMaintainanceCategory').success(function(res){
        console.log(res);
        if(res.hasOwnProperty('success')){
                $scope.maintain_category=res.data;
        }
    });
    
   $scope.addMaintainanceCategory=function(){
        $scope.$emit('LOAD');
        $http.post('/addMaintainanceCategory',$scope.maintainCategory).success(function(response){
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $location.path('/maintainance_category/' + $routeParams.blockID)
            }, 500);
            $route.reload();
        });
    }  
    $scope.deleteCategory = function(id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deletemaintainanceCategory', { id: id, block_id: block_id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }
    
}]);