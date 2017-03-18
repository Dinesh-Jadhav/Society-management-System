socialApp.controller('managerList', ['$scope', '$http', '$location', '$compile', '$route', '$routeParams', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, $location, $compile, $route, $routeParams, $timeout, DTOptionsBuilder, DTColumnBuilder) {
    /*$scope.$emit('LOAD');*/
    $scope.managers = {};
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server 
        DTColumnBuilder.newColumn("idImage", "ID proof").notSortable(),
        DTColumnBuilder.newColumn("manager_name", "Name").notSortable(),
        DTColumnBuilder.newColumn("email", "Email").notSortable(),
        DTColumnBuilder.newColumn("Phone_Number", "Phone Number").notSortable(),
        DTColumnBuilder.newColumn("added_date", "Add On").notSortable(),
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
                console.log(generateResponse);
                angular.forEach(generateResponse, function(item, index) {
                    item.idImage = '<img src="uploads/' + item.idImage + '" width="80px"/>';
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
        var str = '<a href="javascript:void(0)" ng-click="deleteManager(' + $d.id + ')" title="Delete"><i class="fa fa-trash"></i></a> | <a href="#/edit-manager/'+$d.id+'" title="Edit"><i class="fa fa-edit"></i></a> | <a href="#/view-manager/'+$d.id+'" title="View"><i class="fa fa-question-circle"></i></a>';

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

socialApp.controller('addManager', ['$scope', '$http', '$location', '$compile','fileUpload', function($scope, $http, $location, $compile,fileUpload) {
    $scope.formErrorShow = false;
    $scope.manager={};
    $scope.upload_idImage = function() {

        var file = $scope.idFile;
        console.log(file);
        if (angular.isUndefined(file)) {
            return;
        }
        $scope.$emit('LOAD');
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);

        res.success(function(response) {
            $scope.manager.image = response.photoId;
            $scope.$emit('UNLOAD');
        });
    };

    $scope.addManager = function() {
        $scope.$emit('LOAD');
        $scope.formErrorShow = false;
        $http.post('/addManager', $scope.manager).success(function(res) {

            if (res.success) {
                $scope.$emit('UNLOAD');
                $location.path('/manager-list');
            } else {
                $scope.formError = res.error;
                $scope.formErrorShow = true;
                $scope.$emit('UNLOAD');
            }

        });
    }
}]);

socialApp.controller('editManager',['$scope', '$http', '$location', '$compile','Upload', '$timeout','$routeParams','fileUpload', function ($scope, $http,$location, $compile, Upload, $timeout, $routeParams,fileUpload) {
        $scope.$emit('LOAD');
        var mgr_id = $routeParams.id;

        $http.post('/getSingleManager', {mgr_id: mgr_id}).success(function(response){
            
            if(response.data){
                $scope.manager = response.data;         
            }
            $scope.$emit('UNLOAD');
        });
        
        $scope.upload_idImage = function() {
            $scope.$emit('LOAD');
            var file = $scope.idFile;
            console.log(file);
            if (angular.isUndefined(file)) {
                return;
            }
            var uploadUrl = "/uploadPhoto";   
            var res = fileUpload.uploadFileToUrl(file, uploadUrl);
            res.success(function(response) {
                console.log(response.photoId);
                $scope.manager.image = response.photoId;
                          });
            $scope.$emit('UNLOAD');
        };        
        $scope.editManager = function(){   
            var value = $scope.manager;
            console.log(value);

            $http.post('/updateManager', value).success(function(response){
                $scope.$emit('UNLOAD');
                if(response.data){
                    $location.path('/manager-list');
                }else{
                    alert(response.error);
                }
            });
        }
}]);

socialApp.controller('viewManager',['$scope', '$http', '$location', '$compile','Upload', '$timeout','$routeParams', function ($scope, $http,$location, $compile, Upload, $timeout, $routeParams) {
        $scope.$emit('LOAD');
        var mgr_id = $routeParams.id;

        $scope.managerDetail=[];
        $http.post('/viewManagerDetails',{mgr_id:mgr_id}).success(function(response){
            console.log(response);
               if(response.hasOwnProperty('success')){
                    $scope.managerDetail=response.data;
               } 
               $scope.$emit('UNLOAD');
        });
}]);

socialApp.controller('managerReport',['$scope','$http','DTOptionsBuilder', function($scope,$http,DTOptionsBuilder){
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);
    $scope.report=[];
    $http.post('/managerDetails').success(function(response){
        console.log(response);
        if(response.hasOwnProperty('succes')){
            $scope.report=response.data;
            console.log($scope.report);
        }
    });
}]);