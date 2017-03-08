/*For Manager*/
socialApp.controller('residentList', ['$scope', '$http', '$location', '$compile', '$route', '$routeParams', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, $location, $compile, $route, $routeParams, $timeout, DTOptionsBuilder, DTColumnBuilder) {
    $scope.$emit('LOAD');
    var id = atob($routeParams.blockID);
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server
        DTColumnBuilder.newColumn("id", "Resident ID").notSortable(),
        DTColumnBuilder.newColumn("flat_number", "Flat Number").notSortable(),
        DTColumnBuilder.newColumn("name", "Name").notSortable(),
        DTColumnBuilder.newColumn("user_name", "Username").notSortable(),
        DTColumnBuilder.newColumn("email", "Email").notSortable(),
        DTColumnBuilder.newColumn("contact_no", "Contact").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url: "/getresidentList",
            type: "GET",
            data: function(d) {
                d.id = id;
            },
            dataSrc: function(res) {
                var generateResponse = JSON.parse(res.success);
                var log = [];
                angular.forEach(generateResponse, function(value, key) {
                    if (value.first_name == '') {
                        value.name = 'N/A';
                    } else {
                        value.name = value.first_name + ' ' + value.last_name;
                    }
                    if (value.contact_no == '') {
                        value.contact_no = 'N/A';
                    }
                    log.push(value);
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
        return '<a href="#/resident-info/' + btoa(id) + '/' + btoa($d.id) + '" title="Know More"><i class="fa fa-question-circle" aria-hidden="true"></i></a>'
    }

}]);

/*For Manager*/
socialApp.controller('tenantsList', ['$scope', '$http', '$location', '$compile', '$route', '$routeParams', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, $location, $compile, $route, $routeParams, $timeout, DTOptionsBuilder, DTColumnBuilder) {
    $scope.$emit('LOAD');
    var id = atob($routeParams.blockID);
    $scope.dtColumns = [
        DTColumnBuilder.newColumn("flat_number", "Flat Number").notSortable(),
        DTColumnBuilder.newColumn("name", "Tenant Name").notSortable(),
        DTColumnBuilder.newColumn("owner", "Owner Name").notSortable(),
        DTColumnBuilder.newColumn("email", "Tenant Email").notSortable(),
        DTColumnBuilder.newColumn("contact_no", "Tenant Contact").notSortable(),
        DTColumnBuilder.newColumn("move_in_date", "Tenant Move In Date").notSortable(),
        DTColumnBuilder.newColumn("id_proof", "ID Proof").notSortable(),
        DTColumnBuilder.newColumn("agreement", "Agreement").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url: "/tenantList",
            type: "GET",
            data: function(d) {
                d.id = id;
            },
            dataSrc: function(res) {
                var generateResponse = JSON.parse(res.success);
                var log = [];
                angular.forEach(generateResponse, function(value, key) {
                    if (value.first_name == '') {
                        value.name = 'N/A';
                    } else {
                        value.name = value.name;
                    }
                    if (value.contact_no == '') {
                        value.contact_no = 'N/A';
                    }
                    value.id_proof = '<img src="uploads/' + value.id_proof + '" height="50px"/>';
                    value.agreement = '<a href="uploads/' + value.agreement + '" target="_blank">Click To View</a>';
                    var move_in_date = new Date(value.move_in_date);

                    value.move_in_date = move_in_date.getDate() + '-' + move_in_date.getMonth() + '-' + move_in_date.getFullYear();
                    log.push(value);
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
        return '<a href="#/tenants-info/' + btoa(id) + '/' + btoa($d.id) + '" title="Know More"><i class="fa fa-question-circle" aria-hidden="true"></i></a>'
            /*#/tenant-info/'+btoa(id)+'/'+btoa($d.id)+'*/
    }
}]);


socialApp.controller('residentInfo', ['$scope', '$routeParams', '$location', '$http', function($scope, $routeParams, $location, $http) {
    $scope.$emit('LOAD');
    var id = '';
    if (!angular.isUndefined($routeParams.blockID)) {
        id = atob($routeParams.blockID);
    }

    var residentId = atob($routeParams.residentID);
    $scope.residentDetail = {};
    $http.get('/getresidentInfo?id=' + residentId).success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('success')) {
            $scope.residentDetail = JSON.parse(response.success);
            if($scope.residentDetail.have_pet==null){
              $scope.residentDetail.have_pet='N/A'; 
            }if($scope.residentDetail.parking_name==null){
               $scope.residentDetail.parking_name='N/A'; 
            }
            if($scope.residentDetail.have_vehicle==null){
               $scope.residentDetail.have_vehicle='N/A'; 
            }
            if ($scope.residentDetail.first_name == '' && $scope.residentDetail.last_name == '') {
                $scope.residentDetail.first_name = 'N/A';
            }
            if ($scope.residentDetail.contact_no == '') {
                $scope.residentDetail.contact_no = 'N/A';
            }
            if ($scope.residentDetail.area == '') {
                $scope.residentDetail.area = 'N/A';
            }
            if ($scope.residentDetail.location == '') {
                $scope.residentDetail.location = 'N/A';
            }
            if ($scope.residentDetail.registory_no == '') {
                $scope.residentDetail.registory_no = 'N/A';
            }
            if ($scope.residentDetail.ownership == '') {
                $scope.residentDetail.ownership = 'N/A';
            }
            if ($scope.residentDetail.loan == '') {
                $scope.residentDetail.loan = 'N/A';
            }
            
            $scope.$emit('UNLOAD');
        }
    });

     $scope.familyDetails = [];
    $http.post('/getFamiliyMembersForresident',{id:residentId}).success(function(res){
        console.log(res);
        if(res.hasOwnProperty('success')){
            $scope.familyDetails=res.data;
        }
    });
}]);

socialApp.controller('residentServiceInfo', ['$scope', '$routeParams', '$location', '$http', function($scope, $routeParams, $location, $http) {
    $scope.$emit('LOAD');
    var id = '';
    if (!angular.isUndefined($routeParams.blockID)) {
        id = atob($routeParams.blockID);
    }

    var residentId = $routeParams.residentID;
    $scope.residentDetail = {};
    $http.get('/getresidentInfo?id=' + residentId).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.residentDetail = JSON.parse(response.success);
            if ($scope.residentDetail.first_name == '' && $scope.residentDetail.last_name == '') {
                $scope.residentDetail.first_name = 'N/A';
            }
            if ($scope.residentDetail.contact_no == '') {
                $scope.residentDetail.contact_no = 'N/A';
            }
            if ($scope.residentDetail.area == '') {
                $scope.residentDetail.area = 'N/A';
            }
            if ($scope.residentDetail.location == '') {
                $scope.residentDetail.location = 'N/A';
            }
            if ($scope.residentDetail.registory_no == '') {
                $scope.residentDetail.registory_no = 'N/A';
            }
            if ($scope.residentDetail.ownership == '') {
                $scope.residentDetail.ownership = 'N/A';
            }
            if ($scope.residentDetail.loan == '') {
                $scope.residentDetail.loan = 'N/A';
            }
            $scope.$emit('UNLOAD');
        }
    });
}]);
/*For Admin*/
socialApp.controller('residentsListForAdmin', ['$scope', '$http', '$location', '$route', '$timeout', 'DTOptionsBuilder', function($scope, $http, $location, $route, $timeout, DTOptionsBuilder) {
    $scope.$emit('LOAD');
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    $scope.societyList = [];
    $scope.blockList = [];
    $scope.TenantType = false;
    $http.get('/getAllSocieties').success(function(response) {
        $scope.$emit('UNLOAD');
        if (response.hasOwnProperty('success')) {
            $scope.societyList = response.success;
        } else {
            $location.path('/404');
        }
    });

    $scope.getBlocks = function() {
        $scope.$emit('LOAD');
        $scope.blockList = [];
        $scope.blockId = '';
        $scope.dataAvail = false;
        $scope.dataNotAvail = false;
        $scope.error = false;
        $http.post('/getBySocietyId', { id: $scope.societyId }).success(function(res) {
            if (res.hasOwnProperty('success')) {
                $scope.blockList = res.success;
            }
            $scope.$emit('UNLOAD');
        });
    }
    $scope.CheckTypeOfResident = function() {
        if ($scope.type == 2) {
            $scope.TenantType = true;
        } else {
            $scope.TenantType = false;
        }
    }
    $scope.searchResidents = function() {
        $scope.error = false;

        var societyId = $scope.societyId;
        var blockId = $scope.blockId;
        var type = $scope.type;
        var data = {
            societyId: societyId,
            blockId: blockId,
            type: type,
        };

        var url = '';
        if (angular.isUndefined(societyId) || angular.isUndefined(blockId) || angular.isUndefined(type) || societyId == '' || blockId == '' || type == '') {
            $scope.error = true;
            $scope.errorMsg = "Plese Select All Fields!";
            return;
        }
        if (type == 1) {
            url = '/getResidentsForAdminByBlockId';
            $scope.typeResident = true;
            $scope.typeTenant = false;
            $scope.TenantType = false;
        }
        if (type == 2) {
            var Group = $scope.Group;
            if (angular.isUndefined(Group) || Group == '') {
                $scope.error = true;
                $scope.errorMsg = "Plese Select All Fields!";
                return;
            }

            $scope.typeResident = false;
            $scope.typeTenant = true;
            data.Group = Group;
            url = '/getTenatsForAdminByBlockId';
        }
        $scope.$emit('LOAD');
        $http.post(url, data).success(function(response) {
            if (response.hasOwnProperty('success')) {
                res = response.success;
                var log = [];
                angular.forEach(res, function(item, key) {
                    item.tenant_id = btoa(item.id);
                    log.push(item);
                });
                $scope.Residents = log;
                if ($scope.Residents.length > 0) {

                    if (type == 1) {
                        $scope.ResDataAvail = true;
                        $scope.ResDataNotAvail = false;
                        $scope.TenDataAvail = false;
                        $scope.TenDataNotAvail = false;
                    }

                    if (type == 2) {
                        $scope.TenantType = true;
                        $scope.ResDataAvail = false;
                        $scope.ResDataNotAvail = false;
                        $scope.TenDataAvail = true;
                        $scope.TenDataNotAvail = false;
                        $scope.TenantType = false;
                    }

                } else {

                    if (type == 1) {
                        $scope.ResDataAvail = false;
                        $scope.ResDataNotAvail = true;
                        $scope.TenDataAvail = false;
                        $scope.TenDataNotAvail = false;
                        $scope.TenantType = false;
                    }

                    if (type == 2) {
                        $scope.TenantType = true;
                        $scope.ResDataAvail = false;
                        $scope.ResDataNotAvail = false;
                        $scope.TenDataAvail = false;
                        $scope.TenDataNotAvail = true;
                    }

                }
            }
            $timeout(function() {
                $scope.$emit('UNLOAD');
            }, 1000);
        });
    }
}]);
