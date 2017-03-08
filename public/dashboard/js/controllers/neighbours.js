socialApp.controller('neighbours', ['$scope','$http', function($scope, $http){
	$scope.$emit('LOAD');
	$scope.neighbours = [];
	$scope.NoNeighbour = false;
	var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
	$http.get('/getresidentInfo?id='+userDetail.id).success(function(response){
		/*$scope.$emit('LOAD');*/
		if (response.hasOwnProperty('success')) {
			var json = JSON.parse(response.success);
			/*$scope.$emit('LOAD');*/
			$http.get('/neighbourList?id='+userDetail.id+'&storey_number='+json.storey_number+'&block_id='+json.block_id).success(function(res){
				
				if (res.hasOwnProperty(('success'))) {
					var neighbours = JSON.parse(res.success);
					
					angular.forEach(neighbours, function(data, key){
						if (data.name==''|| data.name==' ' || data.name==null) {
							data.name ='N/A';
						}
						if (data.ownership==''|| data.ownership==' ' || data.ownership==null) {
							data.ownership ='N/A';
						}
						$scope.neighbours.push(data);
					});
					if ($scope.neighbours.length==0) {
						$scope.NoNeighbour = true;
					}
				}
				$scope.$emit('UNLOAD');
			});
		}
		
	})
	
}])