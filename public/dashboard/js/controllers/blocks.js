/*List of Add block page*/
socialApp.controller('block',['$scope', '$http', '$location', '$compile','Upload', '$timeout','$routeParams', function ($scope, $http,$location, $compile, Upload, $timeout, $routeParams) {
		$scope.$emit('LOAD');
		var id = $routeParams.id;
		$scope.blocks = [
							{
								block_number: 1,
							}
						];
		$http.post('/getSocietyDetail', {id: id}).success(function(response){
			if(response.success){
				var result = JSON.parse(response.success);
				if(result.has_blocks){

					$scope.hasBlocks = true;
					$scope.hasNoBlocks = false;
					$scope.noManager = false;

				}else{
					$scope.hasNoBlocks = true;
					$scope.noManager = true;
					$scope.hasBlocks = false;
					$scope.blocks[0].name = result.name;
					$scope.blocks[0].manager = result.society_manager;
				}
				
			}else{
				alert('Error !');
			}
			$timeout(function(){
				$scope.$emit('UNLOAD');	
			}, 1000);
		});
		$scope.ActiveManagers = [];

		/*Get list of managers*/
		/*$scope.$emit('LOAD');*/
		$http.get('/ActiveManagersList').success(function(response){

			$scope.ActiveManagers = JSON.parse(response.success);
			$scope.$emit('UNLOAD');
			
		});
		$scope.addMoreBlock = function(){

			var newItemNo = $scope.blocks.length+1;
    		$scope.blocks.push({'block_number': newItemNo});
		}

		$scope.addBlocks = function(){
			$scope.$emit('LOAD');
			
			var blockDetails = $scope.blocks;
			var check =0;
			var i = 1;
			angular.forEach(blockDetails, function(value, key){
				if ((value.parkAvail==1) && (angular.isUndefined(value.parkArea) || value.parkArea=='')) {
					alert('Please Enter Parking Area in block '+i+' detail');
					check=1;
					return;
				}
				i++;
			});

			if (check==0) {
				angular.forEach(blockDetails, function(value, key){
					$http.post('/checkSlug', {rslug: value.name}).success(function(response){
		            
		             	value.slug = response.slug;
		             	value.parent_id = id;
		             	 
			            $http.post('/addBlock', value).success(function(addResponse){
			            	$timeout(function(){
								$scope.$emit('UNLOAD');	
							}, 1000);
			             	if(addResponse.success){
			             		$location.path('/society-list');
			             	}else{
			             		alert(addResponse.error);
			             	}
				    	});
			    	});
				});
			}
		}
}]);

/*For Edit of Block*/
socialApp.controller('editBlock',['$scope', '$http', '$location', '$compile','Upload', '$timeout','$routeParams', function ($scope, $http,$location, $compile, Upload, $timeout, $routeParams) {
		$scope.$emit('LOAD');
		var id = $routeParams.blockId;
		
		$http.post('/getSingleBlock', {id: id}).success(function(response){
			if(response.success){

				$scope.block = response.success;
				$scope.block.parking_avail = response.success.parking_avail;
				
			}else{
				$scope.$emit('UNLOAD');
				$location.path('/404');

			}
			$scope.$emit('UNLOAD');
		});
		$scope.ActiveManagers = [];
		/*Get list of managers*/
		/*$scope.$emit('LOAD');*/
		$http.get('/ActiveManagersList').success(function(response){
			$scope.ActiveManagers = JSON.parse(response.success);
			$scope.$emit('UNLOAD');
		});

		$scope.editBlocks = function(){
			$scope.$emit('LOAD');
			$scope.error = false;
			var value = $scope.block;
			if ($scope.block.parking_avail==1 && $scope.block.parking_area=='') {
				$scope.error = true;
				return;
			}
			$http.post('/editBlock', value).success(function(response){
				$scope.$emit('UNLOAD');
				if(response.success){
					$location.path('/block-list/'+value.parent_id);
				}else{
					alert(response.error);
				}
				
			});

		}

}]);

/*For select Block*/
socialApp.controller('selectBlock',['$scope', '$http', '$location', '$compile', '$timeout','$routeParams', function ($scope, $http,$location, $compile, $timeout, $routeParams) {
			$scope.$emit('LOAD');
			$scope.blocks = {};
			$http.get("/authentication/societyManager").success(function(response,status,headers,config){
	             if(response.status =='success'){

	             }else{
	                $location.path("/society-manager-login");
	             }
	             $http.get("/societyBlockList").success(function(response,status,headers,config){
		        	if (response.success) {
		        		$scope.blocks = response.success;
		        		$scope.$emit('UNLOAD');
		        	}
		        });
	        });
	        
	        $scope.goToDashboard = function(){
	        	var blockName = angular.element('.select-block option[value="'+$scope.block_id+'"]').text();
	        	window.localStorage.setItem('manageDetail', blockName);
	           	$location.path('/society-dashboard/'+window.btoa($scope.block_id));
	        }
}]);

/*Manage Flats*/
socialApp.controller('flats',['$scope', '$http', '$location', '$compile', '$timeout','$routeParams', function ($scope, $http,$location, $compile, $timeout, $routeParams) {
		/*$scope.$emit('LOAD');*/
		var id = window.atob($routeParams.blockID);
		
		$scope.flat = {};
		$scope.flat.flatNumber = [];
		$scope.flat.flatType = [];
		$scope.synchFlatType = false;

		$scope.Error = false;

		$http.post('/getSingleBlock', {id: id}).success(function(response){
			
			if(response.success){

				var numberOfStoreys = parseInt(response.success.storeys);
				
				$scope.block = response.success;
				$scope.blockStorey = [];
				$scope.flat.block_id = $scope.block.id;
				$scope.flat.numberOfStoreys = numberOfStoreys;
				$scope.flat.numberOfFlats = parseInt($scope.block.num_of_flats);
				$scope.block.parent_id = window.btoa($scope.block.parent_id);
				$scope.block.id = window.btoa($scope.block.id);

				for (var i = 1; i <= numberOfStoreys; i++) {

					$scope.blockStorey.push({storeyNo: i});
				
				}

				
			}else{

				$location.path('/404');
			
			}
			$scope.$emit('UNLOAD');
		});
		$scope.msStructfunc = function(){
			/*$scope.$emit('LOAD');*/
			$baseStruct = $scope.blockStorey[0];
			$baseFlatDetails = $scope.flat;
			$scope.synchFlatType = true;
			angular.forEach($scope.blockStorey, function(value, key){
				$scope.flat.noOfFlats[key] = $scope.flat.noOfFlats[0];
				$scope.openDetailedForm($scope.flat.noOfFlats[key],key,angular.element('.storeyFlatsRow:eq('+key+')').scope());

			}); 
			$scope.$emit('UNLOAD');
		}
		$scope.openDetailedForm = function(noOfFlats, index, _that){
			/*$scope.$emit('LOAD');*/

			if(angular.isUndefined(_that))
			{
				_that = this;
			}
			var number = _that.storey.storeyNo;

			var str = '';
			$scope.flat.flatNumber[number] = [];

			if (typeof $scope.flat.flatType[1] === 'undefined' || !($scope.synchFlatType)) {
				$scope.flat.flatType[number] = [];
			}else{
				$scope.flat.flatType[number] = $scope.flat.flatType[1];
			}
			
		
			for (var i = 1; i <= noOfFlats; i++) {

				$scope.flat.flatNumber[number][i] = number+'0'+i; 

				if (typeof $scope.flat.flatType[1][i] !== 'undefined' && $scope.synchFlatType) {
					$scope.flat.flatType[number][i] = $scope.flat.flatType[1][i];
				}else{

				 	$scope.flat.flatType[number][i] = '1' ;
				}
				

				if (i%10==0) {
					$scope.flat.flatNumber[number][i] = number+''+i;
				}

				str += '<div class="flatInfo"><input type="text" class="form-control flatNumber" value="'+number+'0'+i+'" ng-model="flat.flatNumber['+number+']['+i+']"/><select class="form-control flatNumber" ng-model="flat.flatType['+number+']['+i+']"><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4 BHK</option></select></div>';
			}

			var val = $compile(str)($scope);
			var myEl = angular.element( document.querySelector( '#flatElements'+number ) );
     		myEl.html(val);    
     		$scope.$emit('UNLOAD');
		}

		$scope.addFlats = function(){
			/*$scope.$emit('LOAD');*/
			var block_id = $scope.flat.block_id;
			var totalFlatsByAdmin = $scope.flat.numberOfFlats;
			var count = 0;
			//console.log($scope.flat.flatNumber)
			for(var temp = 0; temp<=$scope.flat.numberOfStoreys-1; temp++){
				count = parseInt($scope.flat.noOfFlats[temp])+count;

			}
			
			if(totalFlatsByAdmin != count){

				$scope.Error = true;
				$scope.errorMsg = "Total no. of flats didn't match with number of flats shown by Admin";
				return;
			
			}
			for( var i = 1; i<=$scope.flat.flatNumber.length-1; i++ ){
				
				var storey_number = i;
				
				for( var j = 1; j<=$scope.flat.flatNumber[i].length-1; j++ ){
					
					var data ={};
					var flat_number = $scope.flat.flatNumber[i][j];
					var flat_type = $scope.flat.flatType[i][j];

					data.block_id = block_id;
					data.storey_number = storey_number;
					data.flat_no = flat_number;
					data.type_of_flat = flat_type;

					$http.post('/addFlat', data).success(function(response){
						$scope.$emit('UNLOAD');
						$location.path('/society-dashboard/'+$routeParams.blockID)
					});
				}
			}
		}

		$scope.closeErrorBox = function(){
			
			$scope.Error = false;
			$scope.errorMsg ='';
		
		}
}]);
socialApp.controller('addResident', ['$scope','$http', '$routeParams','$location', function($scope, $http,$routeParams, $location){
		/*$scope.$emit('LOAD');*/
		var blockID = $routeParams.blockID;
		var flatID = window.atob($routeParams.flatID);
		
		$scope.resident = {
			email:''
		};
		$scope.error = '';
		$scope.errorShow = false;
		$http.post('/getFlatResident', {id : flatID}).success(function(response){
			if (response.hasOwnProperty('success')) {
				$scope.resident.email = response.success.email;
				$scope.$emit('UNLOAD');
			}
		});
		$scope.addResident = function(){
			/*$scope.$emit('LOAD');*/
			$http.post('/addResident', {id: flatID, email: $scope.resident.email}).success(function(response){
				$scope.$emit('UNLOAD');
				if (response.hasOwnProperty('success')) {
					$location.path('/society-dashboard/'+blockID);
				}else{
					$scope.error = response.error;
					$scope.errorShow = true;
				}
			});
		}
}]);