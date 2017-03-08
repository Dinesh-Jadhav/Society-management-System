socialApp.controller('addStaff', ['$scope','$http','$routeParams','fileUpload','$location', function($scope,$http, $routeParams, fileUpload, $location){
	var blockID = atob($routeParams.blockID);
	$scope.$emit('LOAD');
	$scope.staff = {
		AvailiableFlats: []
	};

	$scope.staff_type = [];
	$scope.AllFlats = [];
	$http.get('/getStaffTypes').success(function(response){
		
		if (response.hasOwnProperty('status') && response.status=='200') {
			$scope.staff_type = response.data;
		}
		$scope.$emit('UNLOAD');
	});
	$http.post('/AllFlatsOfBlock', {id: blockID}).success(function(response){
		
		if (response.hasOwnProperty('status') && response.status=='200') {
			$scope.AllFlats = response.data;
			//console.log(response);
		}
	});
	$scope.upload_idImage = function(){
		var file = $scope.myFile;
        if (angular.isUndefined(file)) {
           return;
        }
        $scope.$emit('LOAD');
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);
        res.success(function(response){
            $scope.staff.id_image = response.photoId;
            $scope.$emit('UNLOAD');
        });
	};
	
	$scope.chooseType = function(){
		var type = $scope.staff.staff_type;
		$scope.noFlatSelect = false;
		$scope.staff.AvailiableFlats = [];
		if (type==2) {
			$scope.flatType = true;
		}else if(type==1){
			angular.forEach($scope.AllFlats, function(value, key){
				$scope.staff.AvailiableFlats[key] = value.id;
			});

			$scope.flatType = false;
			
		}else{
			$scope.flatType = false;
		}
	}

	$scope.addStaff = function(){

		if ($scope.staff.AvailiableFlats.length==0) {
			$scope.noFlatSelect = true;
			return;
		}
		$scope.$emit('LOAD');
		var availiable_for = '';
		var len = $scope.staff.AvailiableFlats.length-1;
		angular.forEach($scope.staff.AvailiableFlats, function(item, key){
			if (key==len) {
				availiable_for += item;
			}else{
				availiable_for += item+',';
			}
			
		});
		$scope.staff.availiable_for = availiable_for;
		$scope.staff.block_id = blockID;

		$http.post('/addStaff', $scope.staff).success(function(res){
			if (res.hasOwnProperty('status') && res.status==200) {
				$location.path('/staff-list/'+btoa(blockID));
			}else{
				$scope.errorShow = true;
				$scope.error = res.error;
			}
			$scope.$emit('UNLOAD');
		});
	}
}]);

socialApp.controller('listStaff',  ['$scope', '$http', '$location', '$compile','$route','$window', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$filter','$routeParams', function ($scope, $http,$location, $compile, $route, $window, $timeout,DTOptionsBuilder,DTColumnBuilder, $filter, $routeParams){
        $scope.$emit('LOAD');
        var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
        $scope.dtColumns = [
        	DTColumnBuilder.newColumn("id", "Staff ID").notSortable(),
            DTColumnBuilder.newColumn("name", "Name").notSortable(),
            DTColumnBuilder.newColumn("contact_number", "Contact No").notSortable(),
            DTColumnBuilder.newColumn("email", "Email").notSortable(),
            DTColumnBuilder.newColumn("type", "Staff For").notSortable(),
            DTColumnBuilder.newColumn("staff_type", "Availiable For").notSortable(),
            DTColumnBuilder.newColumn("description", "Description").notSortable(),
            DTColumnBuilder.newColumn("idImg", "ID").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/staffListByBlock",
            type:"GET",
            data: function(d){
                d.blockID = atob($routeParams.blockID);
            },
            dataSrc: function (res) { 
                var log = []; 
                
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse,function(item,index){
                    if (item.type!=1) {
                        item.idImg = '<a href="uploads/'+item.id_file+'" target="_blank">Click Here to View</a>';
                        
                        var date = new Date(item.move_in_date);
                        item.move_in_date =$filter('date')(item.move_in_date, "dd-MM-yyyy");
                        
                        if (item.staff_type==1) {
                            item.staff_type = 'Whole Block';
                        }else{
                            item.staff_type = 'Perticular Flats';
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
            var str = '<a href="#/view-staff-details/'+$routeParams.blockID+'/'+btoa($d.id)+'" title="View Deatils"><i class="fa fa-eye" style="margin: 2px !important"></i></a>|<a href="javascript:void(0)" ng-click="delete('+$d.id+')" title="Delete"><i class="fa fa-trash" style="margin: 2px !important"></i></a>';
            return str;
        }

        $scope.delete = function(id){
        	var returnVal = confirm("Are You Sure ?");
        	if (!returnVal) {
        		return;
        	}else{
        		$location.path('/delete-staff/'+$routeParams.blockID+'/'+btoa(id));
        	}
        }
}]);

socialApp.controller('deleteStaff', ['$scope','$location', '$http','$routeParams', function($scope, $location, $http, $routeParams){
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
	$scope.Password = '';
	var staff_id = atob($routeParams.staff_id);
	$scope.LoginAndDelete = function(){
		$scope.$emit('LOAD');
		$http.post('/society-login', {userName: userDetails.email, password: $scope.Password}).success(function(response){
			if (response.hasOwnProperty('success')) {
				$http.post('/deleteStaff', {id: staff_id}).success(function(res){
					$scope.$emit('UNLOAD');
					if (res.hasOwnProperty('success')) {
						$location.path('/staff-list/'+$routeParams.blockID);
					}
				});
				
			}else{
				$scope.errorMsg = response.error;
				$scope.error = true;
				$scope.$emit('UNLOAD');
			}
		})
	};
}]);

socialApp.controller('staffDetails', ['$scope','$http','$routeParams','$location', function($scope, $http, $routeParams, $location){
	var member_id = atob($routeParams.staff_id);
	$scope.member = {};
	$scope.flats = [];
	$scope.$emit('LOAD');
	$http.post('/getStaffDetails', {id: member_id}).success(function(res){
		if (res.hasOwnProperty('success')) {
			$scope.member = res.success;
			if ($scope.member.staff_type==1) {
                $scope.member.staff_type = 'Whole Block';
            }else{
                $scope.member.staff_type = 'Perticular Flats';
            }

			var availiable_for = res.success.availible_for;
			var data = availiable_for.split(',');
			if ($scope.member.staff_type==1 || $scope.member.staff_type=='Whole Block') {
				$scope.$emit('UNLOAD');
				$scope.staff_type_flats = false;
			}else{
				$scope.staff_type_flats = true;
				for (var i = data.length - 1; i >= 0; i--) {
					var flat_id = parseInt(data[i]);
					$http.post('/getFlatDetails', {flat_id: flat_id}).success(function(response){
						if (response.hasOwnProperty('success')) {
							$scope.flats.push(response.success);
						}
					});
					$scope.$emit('UNLOAD');
				}

			}
		}else{
			$scope.$emit('UNLOAD');
			$location.path('/404');
		}
	});
}]);

socialApp.controller('RequestServent', ['$scope','$http','$location','$route', '$timeout', function($scope, $http, $location, $route, $timeout){
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
	var id = userDetails.id;

	/*$scope.servents = [];
	$http.post('/servantsList', {id: id}).success(function(response) {
		if (response.hasOwnProperty('success')) {
			var log = [];
			angular.forEach(response.data, function(item, key){
				item.enid = btoa(item.id);
				log.push(item);
			});
			$scope.servents = log;
		}
	});

	$scope.requestForServent = function(staff_id){
		var returnVal = confirm('Are You Sure ?');

		if (!returnVal) {
			return;
		}
		$http.post('/sendDetailstoManager', {resident_id: id, staff_id: staff_id}).success(function(response){
			if (response.hasOwnProperty('success')) {
				$location.path('/resident-staff-request');
			}else{
				alert(response.error);
			}
		});
	}*/
	$scope.services = [];
	$scope.$emit('LOAD');
	$http.post('/ListServices').success(function(response){
		if (response.hasOwnProperty('success')) {
			$scope.services = response.data;
		}
		$timeout(function(){
			$scope.$emit('UNLOAD');
		}, 500);
	});

	$scope.RequestDetails = {};
	$scope.RequestForService = function(){
		$scope.RequestDetails.resident_id = id;
		$scope.$emit('LOAD');
		$http.post('/service_request', $scope.RequestDetails).success(function(response){
			$scope.$emit('UNLOAD');
			if (response.hasOwnProperty('success')) {
				$location.path('/resident-staff-request');
			}
		})
	}

}]);

socialApp.controller('staffListForRessident', ['$scope','$http','$timeout', function($scope, $http, $timeout){
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
	var id = userDetails.id;
	$scope.AllRequests = [];
	/*$http.post('/staffListForResident').success(function(response){
		if (response.hasOwnProperty('success')) {
			var log = [];
			angular.forEach(response.data, function(dataVal, key){
				if (dataVal.status==0) {
					dataVal.status = 'Requested';
				}
				if (dataVal.status==1) {
					dataVal.status = 'Approved';
				}
				if (dataVal.manager_comment=='') {
					dataVal.manager_comment = 'N/A';
				}
				log.push(dataVal);
			});
			$scope.AllRequests = log;
			console.log($scope.AllRequests);
		}
	});*/
	$scope.$emit('LOAD');
	$http.post('/listOfRequestedServicesToResident', {id: id}).success(function(response){
		if (response.hasOwnProperty('success')) {
			var log = [];
			angular.forEach(response.data, function(dataVal, key){
				if (dataVal.status==0) {
					dataVal.status = 'Requested';
				}
				if (dataVal.status==1) {
					dataVal.status = 'Under Servigillance';
				}
				if (dataVal.status==2) {
					dataVal.status = 'Done';
				}
				
				log.push(dataVal);
			});
			$scope.AllRequests = log;
		}
		$timeout(function(){
			$scope.$emit('UNLOAD');	
		}, 500);
	});
}]);

socialApp.controller('staffApprove', ['$scope','$http', '$location', '$routeParams','$window', function($scope, $http, $location, $routeParams, $window){
	var staff_req_id = $routeParams.staff_req_id;
	$scope.manager = {
		staff_req_id: staff_req_id,
		userName: '',
		password: '',
		manager_comment: ''
	}
	
	$scope.ApproveRequest = function() {
		$scope.BlankForm = false;
		if ($scope.manager.userName=='' || $scope.manager.password=='' || $scope.manager.manager_comment=='') {
			$scope.BlankForm = true;
			return;
		}		
		$http.post('/ManagerLoginForArroveServent', $scope.manager).success(function(response){
			if (response.hasOwnProperty('error')) {
				alert(response.error);
				return;
			}else{
				$http.post('/sendApproveDetails', {id: $scope.manager.staff_req_id, manager_comment: $scope.manager.manager_comment}).success(function(res){
					alert('Approved Successfully !');
					$window.close();
				})
			}
		});
	}
}]);

socialApp.controller('StaffEntryBySecurity', ['$scope','$http','$timeout', '$location', '$route', function($scope, $http, $timeout, $location, $route){
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
	var id = userDetails.id;
	var block_id = userDetails.block_id;
	$scope.staffData = {
		entry: id
	};
	$scope.AllStaffMEmeber = [];
	$http.post('/staffListByBlockSimple', {blockID: block_id}).success(function(response){
		if (response.hasOwnProperty('data')) {
			$scope.AllStaffMEmeber = response.data;
		}
	});
	$scope.staffAttandance = function(){
		$http.post('/staffAttendance', $scope.staffData).success(function(response){
			if(response.hasOwnProperty('success')){
				$scope.successMsg = response.success;
				$timeout(function(){
					$route.reload();	
				}, delay);
			}
		});
	}
}]);


socialApp.controller('staffAttandanceForManager', ['$scope','$routeParams', '$http', function($scope, $routeParams, $http){
	var block_id = atob($routeParams.blockID);
	$scope.AllStaffMemeber = [];
	$scope.today = new Date();
	$scope.$emit('LOAD');
	$http.post('/staffListByBlockSimple', {blockID: block_id}).success(function(response){
		if (response.hasOwnProperty('data')) {
			$scope.AllStaffMemeber = response.data;
		}
		$scope.$emit('UNLOAD');
	});
	$scope.attandance = {
		block_id: block_id
	}
	$scope.SearchData = function(){
		$scope.$emit('LOAD');
		$http.post('/attandanceForManager', $scope.attandance).success(function(response){
			
			if (response.hasOwnProperty('success')) {
				$scope.attandanceData = response.data;
			}else{
				$scope.attandanceData = [];
			}
			$scope.$emit('UNLOAD');
		});
	}
}]);


socialApp.controller('StaffReuestsForManager', ['$scope','$http','$routeParams','$timeout','$route', function($scope, $http, $routeParams, $timeout, $route){
	$scope.AllRequests = [];
	$scope.updateData = {};
	var block_id = atob($routeParams.blockID);
	$http.post('/staffRequestesForManager', {block_id: block_id}).success(function(response){
		if (response.hasOwnProperty('success')) {
			
			angular.forEach(response.data, function(item, key){
				if (item.status==1) {
					item.status = 'Request Approved';
				}else{
					item.status = 'Requested';
				}
				$scope.AllRequests.push(item);
			});
		}
		
	});

	$scope.setID = function(id){
		$scope.updateData.id = id;
	}
	$scope.submitData = function(){
		
		$http.post('/sendApproveDetails', $scope.updateData).success(function(response){
			if (response.hasOwnProperty('success')) {
				$timeout(function(){
					$route.reload();
				}, 500);
			}
		});
	}
}]);