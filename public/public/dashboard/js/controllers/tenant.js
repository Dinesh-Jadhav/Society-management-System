socialApp.controller('tenantAssign', ['$scope','Upload','$http','$timeout','$location','fileUpload', function($scope, Upload,$http, $timeout, $location, fileUpload){
	var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
    $scope.today = new Date(),
        
    $scope.$emit('LOAD');
	$scope.tenant = {
		name: '',
		contact_no: '',
		email: '',
		id_proof: '',
		agreement: ''
	}
    if (userDetail!=null) {
        $scope.tenant.resident_id = userDetail.id;
    }
    $http.post('/knowTenantAssignment', {id: userDetail.id}).success(function(response){
        $scope.noTenant = response.success;
        $scope.$emit('UNLOAD');
    });
	$scope.upload_cover = function (dataUrl, name, type) {

        Upload.upload({
            url: '/uploadPhoto',
            data: {
                file: Upload.dataUrltoBlob(dataUrl, name),
                type: type 
            },
        }).then(function (response) {
            $timeout(function () {
            	$scope.onUpload = false;
            	$scope.close=false;
				$scope.crop =false;
				$scope.progress =-1;
                
            });
            $scope.tenant.id_proof = response.data.photoId;
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status 
                + ': ' + response.data;
            $scope.onUpload = false;
        }, function (evt) {
        	$scope.crop =true;
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    }
    $scope.upload_logo = function () {
            var file = $scope.myFile;
            if (angular.isUndefined(file)) {
               return;
            }
            var uploadUrl = "/uploadPhoto";
            var res = fileUpload.uploadFileToUrl(file, uploadUrl);
            res.success(function(response){
                $scope.tenant.agreement = response.photoId;
            });
    }
    $scope.updateTenant = function(){
        $scope.$emit('LOAD');
    	$http.post('/addTenant', $scope.tenant).success(function(response){
            $scope.$emit('UNLOAD');
    		if (response.hasOwnProperty('success')) {
    			
    			$location.path('/tenant-meta-details/'+btoa(response.lastInsertId));
    		}
    	});
    }	
}]);
socialApp.controller('tenantOtherInfo', ['$scope','$http','$timeout','$location','$routeParams', function($scope, $http, $timeout, $location, $routeParams){
	var tenantId = atob($routeParams.tenantID);
    $scope.days = [];
    for (var i = 1; i <= 31; i++) {
        $scope.days.push({day : i});
    }
    $scope.tenant = {
        tenant_id: tenantId
    }
    $scope.updateTenant= function(){
        $scope.$emit('LOAD');
        var url = '/updateTenantMeta';
        $http.post(url, $scope.tenant).success(function(response){
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $location.path('/all-tenant');
            }
        });
    }
}]);
socialApp.controller('tenantProfile', ['$scope','$http', function($scope, $http){
		$scope.tenantDetails = {
			name: 'Full Name',
			contact_no: '1234530',
			email: '1323212',
			id_proof: '1479807890525-80eab00d25c94eef462864b30fd747a6.jpg',
			agreement: '1479807809043-Cleaning-Temizlik-housekeeping-3.jpg'
		}
}]);
socialApp.controller('AllTenantOfResident', ['$scope', '$http', '$location', '$compile','$route','$window', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$filter', function ($scope, $http,$location, $compile, $route, $window, $timeout,DTOptionsBuilder,DTColumnBuilder, $filter){
		$scope.$emit('LOAD');
        $scope.tenantsFilter = 'All';
        var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
		$scope.dtColumns = [
            DTColumnBuilder.newColumn("name", "Name").notSortable(),
            DTColumnBuilder.newColumn("contact_no", "Contact No").notSortable(),
            DTColumnBuilder.newColumn("email", "Email").notSortable(),
            DTColumnBuilder.newColumn("type", "Tenant Type").notSortable(),
            DTColumnBuilder.newColumn("move_in_date", "Move In").notSortable(),
            DTColumnBuilder.newColumn("move_out_date", "Move Out").notSortable(),
            DTColumnBuilder.newColumn("idImg", "ID Image").notSortable(),
            DTColumnBuilder.newColumn("agreement", "Agreement").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/getTenantList",
            type:"GET",
            data: function(d){
            	d.resident_id = userDetail.id;
            },
            dataSrc: function (res) { 
				var log = []; 
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse,function(item,index){
                    item.idImg = '<img src="uploads/'+item.id_proof+'" width="100px"/>';
                    item.agreement = '<a href="uploads/'+item.agreement+'" target="_blank">Click Here to view</a>';
                    var date = new Date(item.move_in_date);
                    item.move_in_date =$filter('date')(item.move_in_date, "dd-MM-yyyy");
                    if (item.move_out_date!='0000-00-00') {
                        item.move_out_date =$filter('date')(item.move_out_date, "dd-MM-yyyy");
                    }else{
                        item.move_out_date ='Currently Living Here';
                    }
                    if (item.type==1) {
                        item.type = 'Bechelor';
                    }else{
                        item.type = 'Family';
                    }
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
        .withOption('aaSorting',[0,'asc'])
         .withOption('responsive', true)
        .withOption('createdRow', createdRow);

        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            var str = '<a href="javascript:void(0)" ng-click="printDetails('+$d.id+')" title="View Deatils"><i class="fa fa-info" style="margin: 2px !important"></i></a>';
            /*str +=' | <a href="javascript:void(0)" ng-click="generateInvoice('+$d.id+')" title="Generate Invoice"><i class="fa fa-envelope" style="margin: 2px !important"></i></a>';*/
            if (!$d.resident_status) {
                str +=' | <a href="#" ng-click="assignTenantId('+$d.id+')" data-toggle="modal" data-target="#myModal" title="Left Flat"><i class="fa fa-sign-out"></i></a>';
            }
            
            /*#/tenant-full-detail-view/'+btoa($d.id)+'*/
            return str;
        }
        $scope.assignTenantId = function(id){
            $scope.tenantID = id;
        }
        $scope.generateInvoice = function(id){
            var tenant_id = btoa(id);
        }
        $scope.printDetails = function(id){
            var tenant_id = btoa(id);
            $location.path('/tenant-full-detail-view/'+tenant_id);
        }

        $scope.tenantMoveOut = function(){
            var move_out_date = $scope.move_out_date;
            $scope.$emit('LOAD');
            $http.post('/tenantMoveOut', {id: $scope.tenantID, move_out_date: move_out_date}).success(function(response){
                $scope.$emit('UNLOAD');
                angular.element('#myModal').modal('hide');
                angular.element('body').removeClass('modal-open');
                angular.element('.modal-backdrop').remove();
                if (response.hasOwnProperty('success')) {
                    $route.reload();
                }
            })    
        }
}]);

socialApp.controller('bechelorsTenantOfResident', ['$scope', '$http', '$location', '$compile','$route','$window', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$filter', function ($scope, $http,$location, $compile, $route, $window, $timeout,DTOptionsBuilder,DTColumnBuilder, $filter){
        $scope.$emit('LOAD');
        $scope.tenantsFilter = 'Bechelor';
        var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
        $scope.dtColumns = [
            DTColumnBuilder.newColumn("name", "Name").notSortable(),
            DTColumnBuilder.newColumn("contact_no", "Contact No").notSortable(),
            DTColumnBuilder.newColumn("email", "Email").notSortable(),
            DTColumnBuilder.newColumn("type", "Tenant Type").notSortable(),
            DTColumnBuilder.newColumn("move_in_date", "Move In").notSortable(),
            DTColumnBuilder.newColumn("move_out_date", "Move Out").notSortable(),
            DTColumnBuilder.newColumn("idImg", "ID Image").notSortable(),
            DTColumnBuilder.newColumn("agreement", "Agreement").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/getTenantList",
            type:"GET",
            data: function(d){
                d.resident_id = userDetail.id;
            },
            dataSrc: function (res) { 
                var log = []; 
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse,function(item,index){
                    if (item.type==1) {
                        item.idImg = '<img src="uploads/'+item.id_proof+'" width="100px"/>';
                        item.agreement = '<a href="uploads/'+item.agreement+'" target="_blank">Click Here to view</a>';
                        var date = new Date(item.move_in_date);
                        item.move_in_date =$filter('date')(item.move_in_date, "dd-MM-yyyy");
                        if (item.move_out_date!='0000-00-00') {
                            item.move_out_date =$filter('date')(item.move_out_date, "dd-MM-yyyy");
                        }else{
                            item.move_out_date ='Currently Living Here';
                        }
                        if (item.type==1) {
                            item.type = 'Bechelor';
                        }else{
                            item.type = 'Family';
                        }
                        log.push(item);
                    }
                });
                $scope.$emit('UNLOAD');
                return log;
            }
        })
        .withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'asc'])
         .withOption('responsive', true)
        .withOption('createdRow', createdRow);

        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            var str = '<a href="javascript:void(0)" ng-click="printDetails('+$d.id+')" title="View Deatils"><i class="fa fa-info" style="margin: 2px !important"></i></a>';
            /*str +=' | <a href="javascript:void(0)" ng-click="generateInvoice('+$d.id+')" title="Generate Invoice"><i class="fa fa-envelope" style="margin: 2px !important"></i></a>';*/
            if (!$d.resident_status) {
                str +=' | <a href="#" ng-click="assignTenantId('+$d.id+')" data-toggle="modal" data-target="#myModal" title="Left Flat"><i class="fa fa-sign-out"></i></a>';
            }
            
            /*#/tenant-full-detail-view/'+btoa($d.id)+'*/
            return str;
        }
        $scope.assignTenantId = function(id){
            $scope.tenantID = id;
        }
        $scope.generateInvoice = function(id){
            var tenant_id = btoa(id);
        }
        $scope.printDetails = function(id){
            var tenant_id = btoa(id);
            $location.path('/tenant-full-detail-view/'+tenant_id);
        }

        $scope.tenantMoveOut = function(){
            var move_out_date = $scope.move_out_date;
            
            $scope.$emit('LOAD');
            $http.post('/tenantMoveOut', {id: $scope.tenantID, move_out_date: move_out_date}).success(function(response){
                $scope.$emit('UNLOAD');
                angular.element('#myModal').modal('hide');
                angular.element('body').removeClass('modal-open');
                angular.element('.modal-backdrop').remove();
                if (response.hasOwnProperty('success')) {
                    $route.reload();
                }
            })    
        }
}]);
socialApp.controller('familiesTenantOfResident', ['$scope', '$http', '$location', '$compile','$route','$window', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$filter', function ($scope, $http,$location, $compile, $route, $window, $timeout,DTOptionsBuilder,DTColumnBuilder, $filter){
        $scope.$emit('LOAD');
        $scope.tenantsFilter = 'Family';
        var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
        $scope.dtColumns = [
            DTColumnBuilder.newColumn("name", "Name").notSortable(),
            DTColumnBuilder.newColumn("contact_no", "Contact No").notSortable(),
            DTColumnBuilder.newColumn("email", "Email").notSortable(),
            DTColumnBuilder.newColumn("type", "Tenant Type").notSortable(),
            DTColumnBuilder.newColumn("move_in_date", "Move In").notSortable(),
            DTColumnBuilder.newColumn("move_out_date", "Move Out").notSortable(),
            DTColumnBuilder.newColumn("idImg", "ID Image").notSortable(),
            DTColumnBuilder.newColumn("agreement", "Agreement").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/getTenantList",
            type:"GET",
            data: function(d){
                d.resident_id = userDetail.id;
            },
            dataSrc: function (res) { 
                var log = []; 
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse,function(item,index){
                    if (item.type!=1) {
                        item.idImg = '<img src="uploads/'+item.id_proof+'" width="100px"/>';
                        item.agreement = '<a href="uploads/'+item.agreement+'" target="_blank">Click Here to view</a>';
                        var date = new Date(item.move_in_date);
                        item.move_in_date =$filter('date')(item.move_in_date, "dd-MM-yyyy");
                        if (item.move_out_date!='0000-00-00') {
                            item.move_out_date =$filter('date')(item.move_out_date, "dd-MM-yyyy");
                        }else{
                            item.move_out_date ='Currently Living Here';
                        }
                        if (item.type==1) {
                            item.type = 'Bechelor';
                        }else{
                            item.type = 'Family';
                        }
                        log.push(item);
                    }
                });
                $scope.$emit('UNLOAD');
                return log;
            }
        })
        .withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'asc'])
         .withOption('responsive', true)
        .withOption('createdRow', createdRow);

        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            var str = '<a href="javascript:void(0)" ng-click="printDetails('+$d.id+')" title="View Deatils"><i class="fa fa-info" style="margin: 2px !important"></i></a>';
            /*str +=' | <a href="javascript:void(0)" ng-click="generateInvoice('+$d.id+')" title="Generate Invoice"><i class="fa fa-envelope" style="margin: 2px !important"></i></a>';*/
            if (!$d.resident_status) {
                str +=' | <a href="#" ng-click="assignTenantId('+$d.id+')" data-toggle="modal" data-target="#myModal" title="Left Flat"><i class="fa fa-sign-out"></i></a>';
            }
            
            /*#/tenant-full-detail-view/'+btoa($d.id)+'*/
            return str;
        }
        $scope.assignTenantId = function(id){
            $scope.tenantID = id;
        }
        $scope.generateInvoice = function(id){
            var tenant_id = btoa(id);
        }
        $scope.printDetails = function(id){
            var tenant_id = btoa(id);
            $location.path('/tenant-full-detail-view/'+tenant_id);
        }

        $scope.tenantMoveOut = function(){
            var move_out_date = $scope.move_out_date;
            
            $scope.$emit('LOAD');
            $http.post('/tenantMoveOut', {id: $scope.tenantID, move_out_date: move_out_date}).success(function(response){
                $scope.$emit('UNLOAD');
                angular.element('#myModal').modal('hide');
                angular.element('body').removeClass('modal-open');
                angular.element('.modal-backdrop').remove();
                if (response.hasOwnProperty('success')) {
                    $route.reload();
                }
            })    
        }
}]);

socialApp.controller('tenantDetailView', ['$scope','$http', '$location','$routeParams','$window', function($scope, $http, $location, $routeParams, $window){
    $scope.$emit('LOAD');
    var tenantId = atob($routeParams.tenantID);
    $scope.tenantDetail = {};
    $http.post('/tenantDetail', {id:tenantId}).success(function(response){
        if (response.hasOwnProperty('success')) {
            $scope.tenantDetail =JSON.parse(response.success);
            if ($scope.tenantDetail.type==1) {
                $scope.tenantDetail.type = 'Bechelor';
            }else{
                $scope.tenantDetail.type = 'Family';
            }
            var date = new Date($scope.tenantDetail.move_in_date);
            $scope.tenantDetail.move_in_date = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear();
            if ($scope.tenantDetail.move_out_date=='0000-00-00') {
                $scope.tenantDetail.move_out_date="Currently Living Here";
            }else{
                var date = new Date($scope.tenantDetail.move_out_date);
                $scope.tenantDetail.move_out_date = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear();
            }
            $scope.$emit('UNLOAD');
            
        }else{
            $scope.$emit('UNLOAD');
            $location.path('/all-tenant');
        }
    });

}])