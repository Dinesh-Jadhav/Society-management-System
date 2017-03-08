/**/
socialApp.controller('AddVendor', ['$scope', 'fileUpload', '$http', '$location', '$routeParams', function($scope, fileUpload, $http, $location, $routeParams) {
    var block_id = $routeParams.blockID;
    $scope.vendor = {
        block_id: atob(block_id)
    };
    $scope.upload_idImage = function() {

        var file = $scope.idFile;
        console.log(file);
        if (angular.isUndefined(file)) {
            return;
        }
        $scope.$emit('LOAD');
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);

        res.success(function(response) {
            $scope.vendor.id_proof = response.photoId;
            $scope.$emit('UNLOAD');
        });
    };

    $scope.addVendor = function() {
        $scope.$emit('LOAD');
        $http.post('/addVendor', $scope.vendor).success(function(res) {
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('status') && res.status == 200) {
                $location.path('/view-vendor/' + block_id);
            }
        });
    }
}]);

socialApp.controller('ViewVendorForManager', ['$scope', '$http', '$routeParams', '$route', '$timeout', 'DTOptionsBuilder', function($scope, $http, $routeParams, $route, $timeout, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    $scope.vendors = [];
    $scope.success = false;
    $scope.Error = false;
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $http.post('/listvendors', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.vendors = response.data;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });

    $scope.deleteVendor = function(vendor_id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteVendor', { id: vendor_id }).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
            $scope.$emit('UNLOAD');
        });
    }
    $scope.updateId = function(vendor_id, vendor_name, email, contact, description, payuavailable, merchant_id, merchant_key, merchant_salt) {
        $scope.updateData = {
            id: vendor_id,
            vendor_name: vendor_name,
            email: email,
            contact: contact,
            description: description,
            payuavailable: payuavailable,
            merchant_id: merchant_id,
            merchant_key: merchant_key,
            merchant_salt: merchant_salt
        }
    }

    $scope.updateDetails = function() {
        $scope.success = false;
        $scope.Error = false;
        $scope.$emit('LOAD');
        $http.post('/updateVendor', $scope.updateData).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $scope.success = true;
                $scope.Error = false;
                $scope.successMsg = "Details Updated Successfully !";
                $timeout(function() {
                    $route.reload();
                }, 1000);
            } else {
                $scope.Error = true;
                $scope.ErrorMsg = "Some Error Ocuured While Updating Data !";
                $scope.success = false;
            }
            $scope.$emit('UNLOAD');
        });
    }
}]);

socialApp.controller('VendorEntryExit', ['$scope', '$http', '$timeout', '$location', function($scope, $http, $timeout, $location) {
    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var blockId = userData.block_id;
    var SatffID = userData.id;
    $scope.staffData = {
        staff_id: SatffID
    };
    $scope.jobcards = [];

    $scope.$emit('LOAD');
    $http.post('/listvendors', { block_id: blockId }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.vendors = response.data;
        }
        $scope.$emit('UNLOAD');
    });

    $scope.getJobCards = function() {
        var id = $scope.staffData.vendor_id;
        if (id != '' && angular.isDefined(id)) {
            $scope.$emit('LOAD');
            $http.post('/getJobCardsByVendorID', { vendor_id: id }).success(function(res) {
                if (res.hasOwnProperty('sucess')) {
                    $scope.jobcards = res.data;
                }
                $scope.$emit('UNLOAD');
            })
        } else {
            $scope.staffData.job_card_id = '';
            $scope.jobcards = [];
        }
    }

    $scope.vendorEntry = function() {
        var data = $scope.staffData;
        $scope.$emit('LOAD');
        $http.post('/vendorEntryByStaff', data).success(function(res) {
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('success')) {
                $location.path('/vendors-in-view')
            } else {
                $scope.Error = true;
                $scope.ErrorMsg = res.error;
            }
        })
    }
}]);

socialApp.controller('VendorsInView', ['$scope', '$http', '$timeout', '$route', 'DTOptionsBuilder', function($scope, $http, $timeout, $route, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    $scope.$emit('LOAD');
    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var blockId = userData.block_id;
    $scope.vendors = [];
    $scope.visitorDetails = {
        staff_id: userData.id
    };

    $http.post('/listVendorsEntry', { block_id: blockId }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(item, key) {
                if (item.status == 0) {
                    $scope.vendors.push(item);
                }

            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);

    });
    $scope.upadteId = function(id) {
        $scope.visitorDetails.id = id;
    }
    $scope.updateVisiterLeavingDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/VendorExitDetailsByStaff', $scope.visitorDetails).success(function(response) {
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $route.reload();
            }, 500);

        })
    }
}]);

socialApp.controller('VendorEntryView', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    $scope.$emit('LOAD');
    var userData = JSON.parse(window.localStorage.getItem('userDetails'));
    var blockId = userData.block_id;
    $scope.vendors = [];

    $http.post('/listVendorsEntry', { block_id: blockId }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(item, key) {
                if (item.status == 1) {
                    $scope.vendors.push(item);
                }

            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);

    });
}]);
