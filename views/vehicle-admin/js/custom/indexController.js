var values ={};
    
customApp.controller('indexController', function ($scope, $http) {
    $scope.login = function() {
        $http.post("", {userName:$scope.username, password: $scope.password})
        .success(function(response,status,headers,config){
           /*$scope.values = response;*/    
           alert(response);
        });
    }
   
    /*$http.get("call.php").then(function(response) {
              $scope.values = response.data;
    });
    
    $scope.insertData = function() {
        $http.post("insert.php", {first_name:$scope.first_name,last_name:$scope.last_name,email:$scope.email})
        .success(function(data,status,headers,config){
            
            $scope.values = data;
            $scope.first_name = '';
            $scope.last_name = '';
            $scope.email = '';
        });
    }
    
    $scope.delete = function(email) {
        $http.post("delete.php", {email:email})
        .success(function(response,status,headers,config){
           $scope.values = response;    
        });
    }*/
    
});