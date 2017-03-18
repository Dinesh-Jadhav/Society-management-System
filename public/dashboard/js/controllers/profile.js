/*Profile Edit For Resident*/
socialApp.controller('profiile', ['$scope', '$http', '$location', function($scope, $http, $location) {
    /*$scope.$emit('LOAD');*/
    $http.get("/authentication/Resident").success(function(response, status, headers, config) {
        $scope.$emit('UNLOAD');
        if (response.status == 'success') {} else {
            $location.path("/resident-login");
        }
    });

    var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));

    $scope.errorBlock = false;
    $scope.user = {
        id: userDetail.id,
        first_name: '',
        last_name: '',
        contact_no: '',
        registory_no: '',
        ownership: '',
        loan: ''
    }
    $scope.error = '';
    /*$scope.$emit('LOAD');*/
    $http.post("/residentProfile", { id: userDetail.id }).success(function(response, status, headers, config) {
        if (response.hasOwnProperty('success')) {
            var res = JSON.parse(response.success);
            var percent = parseInt(res.PercentNotNull);
            if (percent >= 100) {
                $location.path("/resident-dashboard");
            }
        } else {
            $location.path("/resident-login");
        }
        $scope.$emit('UNLOAD');
    });
    /*$scope.$emit('LOAD');*/
    $http.post('/getFlatResident', { id: userDetail.flat_id }).success(function(response) {
        $scope.$emit('UNLOAD');
        if (response.hasOwnProperty('success')) {
            $scope.user = response.success;
        }
    });

    $scope.updateProfile = function() {
        /*$scope.$emit('LOAD');*/
        $http.post('/updateresidentProfile', $scope.user).success(function(response) {
            if (response.hasOwnProperty('success')) {

                window.localStorage.setItem('userDetails', JSON.stringify($scope.user));
                if ($scope.user.ownership == 'tenant') {
                    $location.path('/tenant');
                } else {
                    $location.path('/resident-dashboard');
                }

            } else {

                $scope.error = response.error;
                $scope.errorBlock = true;
            }
            $scope.$emit('UNLOAD');
        });
    }
    $scope.closeError = function() {
        $scope.errorBlock = false;
    }
}]);

socialApp.controller('updateProfile', ['$scope', '$http', '$location', '$routeParams', '$route', 'fileUpload', function($scope, $http, $location, $routeParams, $route, fileUpload) {
    var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));

    $http.get('/getresidentInfo?id=' + userDetail.id).success(function(response) {
          
        if (response.hasOwnProperty('success')) {

            $scope.profileDetails = JSON.parse(response.success);
            console.log($scope.profileDetails);
            if ($scope.profileDetails.aadhar_number == null) {
                $scope.profileDetails.aadhar_number = '';
            }
            
            if ($scope.profileDetails.id_image == null) {
                $scope.profileDetails.id_image = '';
            }

            if ($scope.profileDetails.blood_group == null) {
                $scope.profileDetails.blood_group = '';
            }
            if ($scope.profileDetails.pan_number == null) {
                $scope.profileDetails.pan_number = '';
            }
            if ($scope.profileDetails.voter_id_number == null) {
                $scope.profileDetails.voter_id_number = '';
            }
            if ($scope.profileDetails.signature_file == null) {
                $scope.profileDetails.signature_file = '';
            }

            if ($scope.profileDetails.date_of_birth == null) {
                $scope.profileDetails.date_of_birth = new Date();
            } 

           else {
                $scope.profileDetails.date_of_birth = new Date($scope.profileDetails.date_of_birth);
            }

            $scope.profileDetails.name = $scope.profileDetails.first_name + ' ' + $scope.profileDetails.last_name;
            $scope.profileDetails.resident_id = userDetail.id;
        }
    });

    $scope.uploadFile = function() {
        $scope.$emit('LOAD');
        var file = $scope.myFile;
        if (angular.isUndefined(file)) {
            return;
        }
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);
        res.success(function(response) {
            $scope.profileDetails.signature = response.photoId;
            $scope.$emit('UNLOAD');
        });
    };

    $scope.uploadId = function() {
        $scope.$emit('LOAD');
        var file = $scope.idFile;
        if (angular.isUndefined(file)) {
            return;
        }
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);
        res.success(function(response) {
            $scope.profileDetails.idProof = response.photoId;
            $scope.$emit('UNLOAD');
            console.log($scope.profileDetails.idProof);
        });
    };
   
    $scope.checkbox1= function(){
        if($scope.profileDetails.vehicle_type1=='true'){
            //$scope.profileDetails.vehicle_type1.checked=false;
            $scope.profileDetails.vehicle_type1=false;
        }
        if($scope.profileDetails.vehicle_type1=='false'){
            //$scope.profileDetails.vehicle_type1.checked=false;
            $scope.profileDetails.vehicle_type1=true;
        }
    }
    $scope.checkbox2= function(){
        if($scope.profileDetails.vehicle_type=='true'){
           // $scope.profileDetails.vehicle_type.checked=false;
            $scope.profileDetails.vehicle_type=false;
        }
        if($scope.profileDetails.vehicle_type=='false'){
           // $scope.profileDetails.vehicle_type.checked=false;
            $scope.profileDetails.vehicle_type=true;
        }
    }
    
    $scope.updateProfileDetails = function() {

       if ($scope.profileDetails.have_pet == 'N') {
            $scope.profileDetails.no_of_pets = '';
        }
        if ($scope.profileDetails.have_vehicle == 'N') {
            $scope.profileDetails.vehicle_type = '';
            $scope.profileDetails.no_of_vehicle = '';
             $scope.profileDetails.vehicle_type1 = '';
            $scope.profileDetails.four_wc = '';
        }
          
        if (($scope.profileDetails.have_vehicle == 'y') && ($scope.profileDetails.vehicle_type == '') && ($scope.profileDetails.vehicle_type1 == '')) {
            $scope.profileDetails.vehicle_type = '';
            $scope.profileDetails.no_of_vehicle = '';
             $scope.profileDetails.vehicle_type1 = '';
            $scope.profileDetails.four_wc = '';
        } 
          
        if ($scope.profileDetails.vehicle_type ==false){
           //$scope.profileDetails.vehicle_type = '';
            $scope.profileDetails.four_wc = '';
        }

        if ($scope.profileDetails.vehicle_type1 ==false){
           //$scope.profileDetails.vehicle_type1 = '';
            $scope.profileDetails.no_of_vehicle = '';
        }
        //console.log($scope.profileDetails);
        var url = '/updateresidentProfileAllDetails';
        var data = $scope.profileDetails; 
        console.log(data);
         $http.post(url, data).success(function(response) {
            if (response.hasOwnProperty('success')) {
                window.localStorage.setItem('userDetails', JSON.stringify(data));
                $route.reload();
            } else {
                $scope.error = response.error;
            }
        });
    }
}]);
