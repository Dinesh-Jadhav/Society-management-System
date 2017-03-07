socialApp.controller('managerList', ['$scope', '$http', '$location', '$compile', '$route', '$routeParams', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, $location, $compile, $route, $routeParams, $timeout, DTOptionsBuilder, DTColumnBuilder) {
    /*$scope.$emit('LOAD');*/
    $scope.managers = {};
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server 
        DTColumnBuilder.newColumn("manager_name", "Name").notSortable(),
        DTColumnBuilder.newColumn("email", "Email").notSortable(),
        DTColumnBuilder.newColumn("idType", "ID Type").notSortable(),
        DTColumnBuilder.newColumn("idNumber", "ID Number").notSortable(),
        DTColumnBuilder.newColumn("description", "Description").notSortable(),
        DTColumnBuilder.newColumn("status_var", "Status").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url: "/getmanagerList",
            type: "get",
            dataSrc: function(res) {

                var log = [];
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse, function(item, index) {
                    item.status_var = '';
                    if (item.status == 1) {
                        item.status_var = '<div class="alert alert-success">Active</div>';
                    } else {
                        item.status_var = '<div class="alert alert-danger">Inactive</div>';
                    }
                    if (item.idType == '') {
                        item.idType = 'N/A';
                    }

                    if (item.idNumber == '') {
                        item.idNumber = 'N/A';
                    }
                    log.push(item);
                });

                return log;
                /*$timeout(function(){
                    $scope.$emit('UNLOAD');
                }, 2500);*/
            }
        })
        .withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        .withOption('aaSorting', [0, 'asc'])
        .withOption('responsive', true)
        .withOption('createdRow', createdRow);

    function createdRow(row, data, dataIndex) {

        $compile(angular.element(row).contents())($scope);
    }

    function actionsHtml(data, type, full, meta) {
        $d = full;
        var str = '<a href="javascript:void(0)" ng-click="deleteManager(' + $d.id + ')" title="Delete"><i class="fa fa-trash"></i></a>';

        return str;
    }

    $scope.deleteManager = function(id) {

        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        var url = '/deleteManager';
        $scope.$emit('LOAD');
        $http.post(url, { id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            $route.reload();
        });
    }

}]);

socialApp.controller('addManager', ['$scope', '$http', '$location', '$compile', function($scope, $http, $location, $compile) {
    $scope.formErrorShow = false;
    $scope.addManager = function() {
        $scope.$emit('LOAD');
        $scope.formErrorShow = false;
        $http.post('/addManager', $scope.manager).success(function(response) {

            if (response.success) {
                $scope.$emit('UNLOAD');
                $location.path('/manager-list');
            } else {
                $scope.formError = response.error;
                $scope.formErrorShow = true;
                $scope.$emit('UNLOAD');
            }

        });
    }
}]);


