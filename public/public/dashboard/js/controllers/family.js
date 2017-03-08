/**/
socialApp.controller('FamilyMembers', ['$scope', '$http', '$location', '$timeout', '$route', function($scope, $http, $location, $timeout, $route){
	$scope.$emit('LOAD');
	$scope.Members = [];
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
	$http.post('/getFamiliyMembersForresident', {id: userDetails.id}).success(function(response){
		if (response.hasOwnProperty('success')) {
			angular.forEach(response.data, function(item, key){
				var todayDate = new Date();
				var dob = new Date(item.date_of_birth);

				var timeDiff = Math.abs(todayDate.getTime() - dob.getTime());
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				var days = diffDays%30;
			    var months = Math.floor(diffDays/30);
			    var years = Math.floor(months/12);
				var age = years+' Year(s)';
				if (years==0) {
					age = months+' Month(s)';
					if (months==0) {
						age = days+' Day(s)';
					}
				}
				item.age = age;
				if (item.contact_number=='') {
					item.contact_number = 'N/A';
				}
				if (item.email=='') {
					item.email = 'N/A';
				}
				if (item.occupation=='') {
					item.occupation = 'N/A';
				}
				$scope.Members.push(item);
			});
		}
		$timeout(function(){
			$scope.$emit('UNLOAD');
		}, 1000);

	})
	
}]);

/**/
socialApp.controller('AddNewFamilyMembers', ['$scope', '$http', '$location', '$timeout', '$route', function($scope, $http, $location, $timeout, $route){
	$scope.today = new Date();
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));

	$scope.member = {
		resident_id: userDetails.id,
		contact_no: '',
		email: ''
	};
	$scope.errorBlock = false;

	$scope.closeError = function() {
		$scope.errorBlock = false;
	}

	$scope.addMember = function(){
		$http.post('/addFamilyMember', $scope.member).success(function(response){
			if(response.hasOwnProperty('success')){
				$location.path('/familiy-members');
			}else{
				alert('Error !');
			}
		});
	}

}]);