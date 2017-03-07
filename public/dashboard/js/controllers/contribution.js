socialApp.controller('ContributeList', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', function($scope, $route, $routeParams, $http, $timeout, $location) {
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.today = new Date();
    $scope.contri = [];
    $http.post('/listContribution', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.contri = response.data;
        }
        $scope.$emit('UNLOAD');
    });
    $scope.deleteContribution=function(id){
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteContributions', { id: id, block_id: block_id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }
    $scope.contriDetail = {
        block_id: block_id
    };

    $scope.updateId = function(id) {
        $scope.$emit('LOAD');
        $scope.contriDetail.id = id;
        $http.post('/getSingleContributions', { id: id }).success(function(response) {
            console.log(response);
            if (response.hasOwnProperty('success')) {
                $scope.contriDetail.amount = response.data.amount;
                $scope.contriDetail.last_payment_date = response.data.last_payment_date;
                $scope.contriDetail.description = response.data.description;
                $scope.contriDetail.title = response.data.title;

            }
            $scope.$emit('UNLOAD');
        });
    }
    $scope.updateContributionDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/updateContributionDetails', $scope.contriDetail).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 500);
            }
        });
    }
}]);

socialApp.controller('Contribute', ['$scope', '$http', '$routeParams', '$location', 'fileUpload', function($scope, $http, $routeParams, $location, fileUpload) {

    var block_id = $routeParams.blockID;
    $scope.contribution = {
        block_id: atob(block_id)
    };
    $scope.upload_Image = function() {
        var file = $scope.imageID;
        if (angular.isUndefined(file)) {
            return;
        }
        $scope.$emit('LOAD');
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);

        res.success(function(response) {
            $scope.$emit('UNLOAD');
            $scope.contribution.image = response.photoId;
        });
    };

    $scope.addContribution = function() {
        $scope.$emit('LOAD');
        $http.post('/addContribution', $scope.contribution).success(function(res) {
            console.log($scope.contribution);
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('status') && res.status == 200) {
                $location.path('/contribution-list/' + block_id);
            }
        });
    }
}]);


socialApp.controller('contributions', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    $scope.contributions = [];
    var transData = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = transData.id;
    $scope.$emit('LOAD');
    $http.post('/listContributionForResident', { id: id }).success(function(response) {

        if (response.hasOwnProperty('success')) {
            var contributions = response.data;
            var log = [];
            angular.forEach(contributions, function(value, key) {
                value.enid = btoa(value.id);
                log.push(value);
            });
            $scope.contributions = log;
        } else {
            alert(response.error);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);

socialApp.controller('contributions', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    $scope.contributions = [];
    var transData = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = transData.id;
    $scope.$emit('LOAD');
    $http.post('/listContributionForResident', { id: id }).success(function(response) {

        if (response.hasOwnProperty('success')) {
            var contributions = response.data;
            var log = [];
            angular.forEach(contributions, function(value, key) {
                value.enid = btoa(value.id);
                log.push(value);
            });
            $scope.contributions = log;
        } else {
            alert(response.error);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);

socialApp.controller('ResContribution', ['$scope', '$http', '$timeout', 'sha256', '$location', '$crypthmac', '$routeParams', '$route', function($scope, $http, $timeout, sha256, $location, $crypthmac, $routeParams, $route) {

    var id = $routeParams.conID;
    $scope.contribute = {
        id: id
    };
    $scope.$emit('LOAD');
    $http.post('/getSingleContributions', { id: id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.contribute = response.data;
            $scope.amount = parseInt(response.data.amount);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var resident_id = userDetails.id;
    var userName = userDetails.first_name + ' ' + userDetails.last_name;
    var userEmail = userDetails.email;
    var userCon = userDetails.contact_no;

    var SALT = '';
    var Key = '';
    //$scope.payUdetail = [];
    $http.post('/payUdetailsOfSocietyByResident', { resident_id: resident_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            SALT = response.success.marchant_salt;
            Key = response.success.marchant_key;
        }
        //console.log($scope.payUdetail);
        $scope.$emit('UNLOAD');
    });

    /*   var SALT = "yIEkykqEH3";
     */
    var protocol = $location.protocol();
    var host = $location.host();
    var port = $location.port();

    var surl = protocol + '://' + host;
    var furl = protocol + '://' + host;

    if (host == 'localhost') {
        surl += ':' + port;
        furl += ':' + port;
    }
    surl += '/payment-success';
    furl += '/payment-fail';

    $scope.paymentDetails = {
        //key: "hDkYGPQe",
        firstname: userName,
        email: userEmail,
        phone: userCon,
        surl: surl,
        furl: furl,
        udf1: resident_id,
        udf2: '0',
        udf3: $scope.contribute.id
    };

    $scope.pay = function(amount, event) {
        $scope.paymentDetails.txnid = sha256.convertToSHA256(randomString(5)).substring(0, 20).toLowerCase();
        $scope.paymentDetails.totalPayable = $scope.amount;
        $scope.paymentDetails.key = Key;

        $scope.paymentDetails.productinfo = 'contribution';


        hashString = $scope.paymentDetails.key + '|' + $scope.paymentDetails.txnid + '|' + $scope.paymentDetails.totalPayable + '|' + $scope.paymentDetails.productinfo + '|' + $scope.paymentDetails.firstname + '|' + $scope.paymentDetails.email + '|' + $scope.paymentDetails.udf1 + '|' + $scope.paymentDetails.udf2 + '|' + $scope.paymentDetails.udf3 + '||||||||' + SALT;

        $http.post('/createHash', { string: hashString }).success(function(response) {
            $scope.paymentDetails.hash = response;
        });

        $scope.paymentDetails.service_provider = 'service_provider';
        setTimeout(function() {
            document.paymentFrm.submit();
        }, 2000);
    }

    function randomString(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

}]);

socialApp.controller('ListContri', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', function($scope, $route, $routeParams, $http, $timeout, $location) {
    $scope.$emit('LOAD');
    var conid = $routeParams.conID;
    $scope.ListContribution = [];
    $http.post('/listOfPaidContributionByResident', { id: conid }).success(function(response) {
        console.log(response)
        if (response.hasOwnProperty('success')) {
            $scope.ListContribution = response.data;
        }
        $scope.$emit('UNLOAD');
    });
}]);
