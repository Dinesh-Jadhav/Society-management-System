/*For Login*/
socialApp.controller('login', ['$scope', '$http', '$location', '$compile', function($scope, $http, $location, $compile) {
    $scope.noError = true;

    $scope.loginAction = function() {
        $scope.$emit('LOAD');
        $http.post("/login", $scope.admin).success(function(response, status, headers, config) {

            if (response.error) {
                $scope.noError = false;
                $scope.ErrorMessage = response.error;
            } else {
                window.localStorage.setItem('userDetails', JSON.stringify(response.success));
                $scope.$emit('UNLOAD');
                $location.path("/dashboard");
            }
            $scope.$emit('UNLOAD');
        });
    }
}]);

/*For Forget password*/
socialApp.controller('resetPasswordController', ['$scope', '$http', function($scope, $http) {
    $scope.noError = true;
    $scope.noSuccess = true;
    $scope.resetPassword = function() {
        $scope.$emit('LOAD');
        $http.post("/resetPasswordProcess", {
            email: $scope.useremail
        }).success(function(response, status, headers, config) {
            if (response.hasOwnProperty('success')) {
                $scope.noSuccess = false;
                $scope.noError = true;
                $scope.successMessage = response.success;
                $scope.$emit('UNLOAD');
            } else {
                $scope.noSuccess = true;
                $scope.noError = false;
                $scope.ErrorMessage = response.error;

            }
            $scope.$emit('UNLOAD');
        });
    }
}]);


/*For password reset*/
socialApp.controller('newPasswordController', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
    $scope.$emit('LOAD');
    var token = $routeParams.token;
    var id = $routeParams.id;

    $scope.noError = true;
    $scope.noSuccess = true;

    $http.post("/confirmToken", { userid: id, token: token }).success(function(response, status, headers, config) {
        $scope.$emit('UNLOAD');
        if (response.error) {
            $location.path('/404');
        } else if (response.hasOwnProperty('succes')) {
            $scope.userid = response.id;
        }
    });
    $scope.updatePassword = function() {
        $scope.$emit('LOAD');
        var pass = $scope.userPassword;
        var confirmPass = $scope.confirmPassword;
        var id = $scope.userid;

        if (pass == '') {
            $scope.noError = false;
            $scope.ErrorMessage = 'Please Enter New  Password';
            $scope.$emit('UNLOAD');
        } else if (pass != confirmPass) {
            $scope.noError = false;
            $scope.ErrorMessage = 'Please Enter Same Password';
            $scope.$emit('UNLOAD');
        } else {
            $http.post('/updatePassword', { id: id, pass: pass }).success(function(response, status, headers, config) {
                $scope.$emit('UNLOAD');
                if (response.error) {
                    $scope.noError = false;
                    $scope.noSuccess = true;
                    $scope.ErrorMessage = response.error;
                } else if (response.hasOwnProperty('succes')) {
                    $scope.noSuccess = false;
                    $scope.noError = true;
                    $scope.successMessage = "Password Changed Successfully.";
                    $scope.$emit('UNLOAD');
                }
            });
        }
    };
}]);


socialApp.controller('residentLogin', ['$scope', '$http', '$location', function($scope, $http, $location) {

    $scope.forget_url = "resident-reset-password";
    $scope.titleContent = " Enter Your Username and Password to log on:";
    $scope.userPlaceholder = "Username...";
    $scope.noError = true;
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    if (userDetails != null) {
        $scope.$emit('LOAD');
        $http.get("/authentication/Resident").success(function(response, status, headers, config) {

            if (response.status == 'success') {
                $location.path("/resident-dashboard");
            } else {

            }
            $scope.$emit('UNLOAD');
        });
    }

    $scope.loginAction = function() {
        $scope.$emit('LOAD');
        $http.post("/resident-login", $scope.user).success(function(response, status, headers, config) {
            $scope.$emit('UNLOAD');
            if (response.error) {
                $scope.noError = false;
                $scope.ErrorMessage = response.error;

            } else {

                window.localStorage.setItem('userDetails', JSON.stringify(response.success));
                $scope.$emit('UNLOAD');
                $location.path("/resident-dashboard");
            }
        });
    }
}]);

/*For Forget password For reseident*/
socialApp.controller('residentRessetPassword', ['$scope', '$http', function($scope, $http) {

    $scope.login_url = "resident-login";
    $scope.btnVal = "Get Password !";

    $scope.noError = true;
    $scope.noSuccess = true;

    $scope.resetPassword = function() {
        $scope.$emit('LOAD');
        $http.post("/resident-resetPasswordProcess", { email: $scope.useremail }).success(function(response, status, headers, config) {

            if (response.hasOwnProperty('success')) {

                $scope.noSuccess = false;
                $scope.noError = true;
                $scope.successMessage = response.success;
            } else {
                $scope.noSuccess = true;
                $scope.noError = false;
                $scope.ErrorMessage = response.error;
                $scope.$emit('UNLOAD');
            }
            $scope.$emit('UNLOAD');

        });
    }
}]);


/*For Staff Login*/
socialApp.controller('staffLogin', ['$scope', '$http', '$location', function($scope, $http, $location) {
    /*$scope.$emit('LOAD');*/
    $scope.forget_url = "";
    $scope.titleContent = "Enter Your Email and Password to log on:";
    $scope.userPlaceholder = "Email...";
    $scope.noError = true;
    $scope.loginAction = function() {
        $scope.$emit('LOAD');
        $http.post("/staff-login", $scope.user).success(function(response, status, headers, config) {

            if (response.error) {
                $scope.noError = false;
                $scope.ErrorMessage = response.error;
                $scope.$emit('UNLOAD');
            } else {

                window.localStorage.setItem('userDetails', JSON.stringify(response.success));
                $scope.$emit('UNLOAD');
                $location.path("/visitors-for-staff");
            }
        });
    }
}]);
