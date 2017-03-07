
var values ={};

customApp.controller('detailController', function($scope, $http, $routeParams){
    var id = this;
    id = $routeParams.id;

    $http.post("get_single_detail.php", {id : id}).then(function(response) {
              
              $scope.details = response.data;
              $scope.user_id = response.data.id;
              $scope.first_name = response.data.first_name;
              $scope.last_name = response.data.last_name;
              $scope.email = response.data.email;

    });

    $scope.updateData = function(user_id) {
        $http.post("update.php", {user_id:user_id, first_name:$scope.first_name, last_name:$scope.last_name, email:$scope.email})
        .success(function(response,status,headers,config){

           $scope.details = response;    
           $scope.first_name = response.first_name;
           $scope.last_name = response.last_name;
           $scope.email = response.email;

        });
    }
});