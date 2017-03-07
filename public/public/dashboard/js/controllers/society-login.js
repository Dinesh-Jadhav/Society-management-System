/*For Login*/

socialApp.controller('societyLogin',['$scope', '$http', '$location', '$compile', function ($scope, $http,$location, $compile) {
		$scope.forget_url = "manager-reset-password";
        $scope.titleContent = " Enter your Email and Password to log on:";
        $scope.userPlaceholder = "Email...";
        $scope.noError = true;
        $scope.$emit('LOAD');
		$http.get("/authentication/societyManager").success(function(response,status,headers,config){
             $scope.$emit('UNLOAD');
             if(response.status =='success'){
             	$location.path("/select-block");
             }else{
                
             }
        });
		$scope.loginAction = function(){
			$scope.$emit('LOAD');
			$http.post("/society-login", $scope.user).success(function(response,status,headers,config){
		            if (response.error) 
		            {
		            	$scope.noError = false;	
		            	$scope.ErrorMessage = response.error;
                        
		            }
		            else
		            {
                        window.localStorage.setItem('userDetails', JSON.stringify(response.success));
                        $scope.$emit('UNLOAD');
		            	$location.path("/select-block");
		            }
                    $scope.$emit('UNLOAD');
        	}); 
		}
}]);

/*For Forget password*/
socialApp.controller('societyResetPasswordController',['$scope', '$http', function ($scope, $http) {
    $scope.login_url = "society-manager-login";
    $scope.btnVal = "Send Link !";
    $scope.noError = true;  
    $scope.noSuccess = true;

    $scope.resetPassword = function(){
        $scope.$emit('LOAD');
        $http.post("/society-resetPasswordProcess", {email : $scope.useremail}).success(function(response,status,headers,config){
		  
            if(response.hasOwnProperty('success')){
                
                $scope.noSuccess = false;
                $scope.noError = true;
                $scope.successMessage = response.success;
                $scope.$emit('UNLOAD');
            
            }else{
                
                $scope.noSuccess = true;
                $scope.noError = false;
                $scope.ErrorMessage = response.error;
                $scope.$emit('UNLOAD');
            }
        });     
    }
}]);


/*For password reset*/
socialApp.controller('society-newPasswordController',['$scope','$http','$location','$routeParams', function ($scope, $http, $location, $routeParams) {
      $scope.login_url = "society-manager-login";
      var token =  $routeParams.token;
      var id = $routeParams.id;
      
      $scope.noError = true;
      $scope.noSuccess = true;
        $scope.$emit('LOAD');
      $http.post("/society-confirmToken", {userid:id, token: token}).success(function(response,status,headers,config){
            if (response.error) 
            {
            	$location.path('/');
            }
            else if(response.hasOwnProperty('succes'))
            {
            	$scope.userid = response.id;
            }
            $scope.$emit('UNLOAD');
        }); 
      
$scope.updatePassword = function(){
            $scope.$emit('LOAD');
            var pass = $scope.userPassword;
            var confirmPass = $scope.confirmPassword;
            var id = $scope.userid;
            

            if(pass==''){
                
                $scope.noError = false;
                $scope.ErrorMessage = 'Please Enter New  Password';
                $scope.$emit('UNLOAD');

            }else if(pass != confirmPass){
                
                $scope.noError = false;
                $scope.ErrorMessage = 'Please Enter Same Password';
                $scope.$emit('UNLOAD');
            
            }else{
                $scope.$emit('LOAD');
                $http.post('/societyManager-updatePassword', {id:id, pass:pass}).success(function(response,status,headers,config){
                    if (response.error) 
                    {
                        $scope.noError = false;
                        $scope.noSuccess = true;
                        $scope.ErrorMessage = response.error;
                        $scope.$emit('UNLOAD');
                    }
                    else if(response.hasOwnProperty('succes'))
                    {
                        $scope.noSuccess = false;
                        $scope.noError = true;
                        $scope.successMessage = "Password Changed Successfully.";
                        
                    }
                    $scope.$emit('UNLOAD');
                });
            }
        };
}]);


/*For Change Password*/

socialApp.controller('changePassword',['$scope', '$http', '$location', '$compile', function ($scope, $http,$location, $compile) {
        
        $scope.noError = true;
        $scope.noSuccess = true;

        $scope.updatePassword = function(){
            $scope.$emit('LOAD');
            var pass = $scope.user.newPassword;
            var confirmPass = $scope.user.confirmNewPassword;
            
            if(pass==''){
                
                $scope.noError = false;
                $scope.ErrorMessage = 'Please Enter New  Password';
                $scope.$emit('UNLOAD');
            }else if(pass != confirmPass){
                
                $scope.noError = false;
                $scope.ErrorMessage = 'Please Enter Same Password';
                $scope.$emit('UNLOAD');
            }else{
                
                $http.post('/society-updatePassword', {pass:pass}).success(function(response,status,headers,config){
                    if (response.error) 
                    {
                        $scope.noError = false;
                        $scope.noSuccess = true;
                        $scope.ErrorMessage = response.error;
                        $scope.$emit('UNLOAD');
                    }
                    else if(response.hasOwnProperty('succes'))
                    {
                        $scope.noSuccess = false;
                        $scope.noError = true;
                        $scope.successMessage = "Password Changed Successfully.";
                        $scope.$emit('UNLOAD');
                        
                    }
                    $scope.$emit('UNLOAD');
                });
            }
        };
}]);