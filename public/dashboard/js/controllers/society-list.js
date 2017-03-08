socialApp.controller('societyList', ['$scope', '$http', '$location', '$compile', '$route', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', '$window', '$routeParams', function($scope, $http, $location, $compile, $route, $timeout, DTOptionsBuilder, DTColumnBuilder, $window, $routeParams) {
    //$scope.$emit('LOAD');
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server 
        DTColumnBuilder.newColumn("logo_img", "Logo Image").notSortable(),
        DTColumnBuilder.newColumn("name", "Name").notSortable(),
        DTColumnBuilder.newColumn("established_date", "Establish Date").notSortable(),
        DTColumnBuilder.newColumn("owner", "Owner").notSortable(),
        DTColumnBuilder.newColumn("chair_person", "Chairman").notSortable(),
        DTColumnBuilder.newColumn("secretary", "Secretary").notSortable(),
        DTColumnBuilder.newColumn("treasurer", "Treasurer").notSortable(),
        DTColumnBuilder.newColumn("manager_name", "Manager").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url: "/getsocietyList",
            type: "GET",
            dataSrc: function(res) {

                var log = [];
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse, function(item, index) {
                    item.logo_img = '<img src="uploads/' + item.general_img + '" width="100px"/>';
                    log.push(item);
                });
                $scope.$emit('UNLOAD');
                return log;
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
        var str = '<a href="#/society/' + $d.slug + '" title="Preview" target="_blank"><i class="fa fa-eye"></i></a> |  <a href="#/edit-society/' + $d.id + '" title="Edit"><i class="fa fa-edit"></i></a>| <a href="javascript:void(0)" ng-click="deleteSociety(' + $d.id + ')" title="Delete"><i class="fa fa-trash"></i></a>';
        if ($d.has_blocks == 1) {
            str += ' | <a href="#/add-blocks/' + $d.id + '" title="Add More Blocks"><i class="fa fa-plus"></i></a>';
            str += ' | <a href="#/block-list/' + $d.id + '" title="View Blocks"><i class="fa fa-building-o" aria-hidden="true"></i></a>';
        }

        return str;
    }

    $scope.deleteSociety = function(id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        } else {
            $location.path('/delete-society/' + btoa(id))
            return;
        }
    }
    $scope.Password = '';
    $scope.LoginAndDelete = function() {
        $scope.$emit('LOAD');
        var id = atob($routeParams.societyId);
        var password = $scope.Password;
        var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
        var adminDetail = {
            userName: userDetails.username,
            password: password
        };
        $http.post('/login', adminDetail).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $http.post('/deleteSociety', { id: id }).success(function(response) {
                    $scope.$emit('UNLOAD');
                    if (response.success) {
                        $location.path('/society-list');
                    } else {
                        alert(response.error);
                    }

                });
            } else {
                $scope.$emit('UNLOAD');
                $scope.error = true;
                $scope.errorMsg = response.error;
            }
        })

    }
}]);

socialApp.controller('societyListByID', ['$scope', '$http', '$location', '$compile', '$route', '$timeout', '$routeParams', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, $location, $compile, $route, $timeout, $routeParams, DTOptionsBuilder, DTColumnBuilder) {
    /*$scope.$emit('LOAD');*/
    var id = window.atob($routeParams.id);
    $scope.societyDetails = {};

    $scope.block = {};
    $http.post('/getSocietyDetail', { id: id }).success(function(response) {
        if (response.success) {
            $scope.societyDetails = JSON.parse(response.success);

            $scope.block.parent_id = window.btoa($scope.societyDetails.id);
        } else {
            $location.path('/404');
        }
        $scope.$emit('UNLOAD');
    });
    /*$scope.$emit('LOAD');*/
    $scope.dtColumns = [
        DTColumnBuilder.newColumn("name", "Name").notSortable(),
        DTColumnBuilder.newColumn("society_name", "Society").notSortable(),
        DTColumnBuilder.newColumn("description", "Description").notSortable(),
        DTColumnBuilder.newColumn("storeys", "Number of Storeys").notSortable(),
        DTColumnBuilder.newColumn("num_of_flats", "Number of Flats").notSortable(),
        DTColumnBuilder.newColumn("manager_name", "Manager").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url: "/getblockList",
            type: "GET",
            data: function(d) {
                d.id = id;
            },
            dataSrc: function(res) {
                var generateResponse = JSON.parse(res.success);
                $scope.$emit('UNLOAD');
                return generateResponse;
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
        return '<a href="#/block/' + $d.society_slug + '/' + $d.slug + '" title="Preview" target="_blank"><i class="fa fa-eye"></i></a>';
        /*  | <a href="javascript:void(0)" ng-click="deleteBlock('+$d.id+')" title="Delete"><i class="fa fa-trash"></i></a>| <a href="#/manager-edit-block" title="Edit"><i class="fa fa-edit"></i></a> */
    }

    $scope.deleteBlock = function(id) {
        /*$scope.$emit('LOAD');*/
        var url = '/deleteBlock';
        $http.post(url, { id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            $route.reload();
        });
    }
    $scope.deleteSociety = function(id) {
        /*$scope.$emit('LOAD');*/
        var url = '/deleteSociety';
        $http.post(url, { id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.success) {
                $route.reload();
            } else {
                alert(response.error);
            }

        });
    }
}]);

socialApp.controller('editSociety', ['$scope', '$routeParams', '$location', '$http', function($scope, $routeParams, $location, $http) {
    $scope.$emit('LOAD');
    //var block_id = $routeParams.blockId;
     var id = $routeParams.id;
    //$scope.societyDetails = {};
    console.log(id);
    $http.post('/getSingleSocietyDetails', { id: id }).success(function(response) {
        console.log(response);
        if (response.success) {
            $scope.societyDetails = response.success;
            var id = response.success.society_manager;
            console.log(id);
            $http.post('/SocietyManagers', { id: id }).success(function(response) {
                $scope.managerDetails = [];
                if (response.success) {
                    $scope.managerDetails.manager_id = response.success.manager_id;
                    $scope.managerDetails.manager_name = response.success.manager_name;
                }
                $scope.$emit('UNLOAD');
            });
        } else {
            $scope.$emit('UNLOAD');
            $location.path('/404');
        }
        $scope.$emit('UNLOAD');
    });
    $scope.ActiveManagers = [];
    /*Get list of managers*/
    /*$scope.$emit('LOAD');*/
    $http.post('/listOfManagers', { block_id: id }).success(function(response) {
        if (response.success) {
            $scope.ActiveManagers = response.success;
        }
        $scope.$emit('UNLOAD');
    });

    $scope.editSociety = function() {
        $scope.$emit('LOAD');
        $scope.error = false;
        console.log($scope.societyDetails);
        $http.post('/updateSocietyDetails', $scope.societyDetails).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.success) {
                $location.path('/society-list/');
            }
        });
    }
}]);


socialApp.controller('societyReport',['$scope','$http','DTOptionsBuilder', function($scope,$http,DTOptionsBuilder){
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);
    var userDetail=
    $scope.report=[];
    $http.post('/societyDetails').success(function(response){
          if(response.hasOwnProperty('succes')){
            $scope.report=response.data;
            console.log($scope.report);
        }
    });
}]);