socialApp.controller('home', ['$scope', '$http', '$timeout', '$interval', '$window','$route','$location','$anchorScroll', function($scope, $http, $interval, $timeout, $window,$route,$location,$anchorScroll) {
    
     $scope.scrollTo = function(id) {
         $location.hash(id);
         $anchorScroll();
    }

    $scope.scrollAbout = function(aid) {
         $location.hash(aid);
         $anchorScroll();
    }

    $scope.scrollVendor = function(vid) {
         $location.hash(vid);
         $anchorScroll();
    }

    $scope.scrollContact = function(cid) {
         $location.hash(cid);
         $anchorScroll();
    }

    $scope.help = {
        /* time: '9am-12pm',
         service: 'Architech'*/
    };



    /*$http.post('/ListServices').success(function(response){
        console.log(response);
    })*/
    $scope.$emit('LOAD');
    $scope.enquiryStatus = '';
    $scope.today = new Date();
    $scope.requestHelp = function() {
        $http.post('/helpDetails', $scope.help).success(function(response) {
            console.log(response);
            /*if(response.hasOwnProperty('status') && response.status==200){
                console.log('hssssssss');
                alert('Your Service Logged Successfully'); 
            }*/
            $scope.help={};
            $timeout(function() {
               $scope.$emit('UNLOAD');
               // $route.reload();
                //$window.location.href = 'http://man2help.com/anyuser.php';
            }, 500);

            $window.alert('Your Service Logged Successfully'); 
        });
    }
    $scope.bgIndex = 0;
    $urlarray = ['images/image/Silder-1.jpg', 'images/image/Silder-2.jpg', 'images/image/Silder-3.jpg'];
    $scope.PosterUrl = $urlarray[$scope.bgIndex];
    setInterval(function() {
        if ($scope.bgIndex == 2) {
            $scope.bgIndex = 0;
        } else {
            $scope.bgIndex = $scope.bgIndex + 1;
        }
        $scope.PosterUrl = $urlarray[$scope.bgIndex];
    }, 6000);

    $scope.services = [];
    $scope.$emit('LOAD');
    $http.post('/ListServices').success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.services = response.data;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });

    $scope.enq = {};
    $scope.enquiry = function() {
        $http.post('/enqiuryDetails', $scope.enq).success(function(response) {
            $scope.enq = {};
            $scope.enquiryStatus = response.success;
            setTimeout(function() {
                $scope.enquiryStatus = '';
                $scope.$apply();
            }, 1500);
        });
    }

    $scope.vendorReg = {};
    $scope.registerVendor = function() {
        $http.post('/vendorRegistration', $scope.vendorReg).success(function(response) {
            $scope.vendorReg = {};
            $scope.registrationStatus = response.success;
            setTimeout(function() {
                $scope.registrationStatus = '';
                $scope.$apply();
            }, 1500);
        });
    }
}]);

socialApp.controller('society', ['$scope', '$http', function($scope, $http) {
    //$scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [1, 'desc']).withButtons(['print', 'excel', 'pdf']);
    $scope.report = [];
    $http.post('/societyDetails').success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('succes')) {
            $scope.report = response.data;
            console.log($scope.report);
        }
    });
}]);