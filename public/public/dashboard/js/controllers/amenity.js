socialApp.controller('AddAmenity', ['$scope', '$http', '$routeParams', '$location', 'fileUpload', function($scope, $http, $routeParams, $location, fileUpload) {

    var block_id = $routeParams.blockID;
    $scope.amenity = {
        charges: 0,
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
            $scope.amenity.image = response.photoId;
        });
    };

    $scope.AddAmenity = function() {
        $scope.$emit('LOAD');
        $http.post('/addAmenities', $scope.amenity).success(function(res) {
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('status') && res.status == 200) {
                $location.path('/eminity-list/' + block_id);
            }
        });
    }
}]);

socialApp.controller('ListAmenity', ['$scope', '$http', '$routeParams', '$route', '$timeout', function($scope, $http, $routeParams, $route, $timeout) {
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.amenities = [];
    $http.post('/listAmenities', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.amenities = response.data;
        }
        $scope.$emit('UNLOAD');
    });

    $scope.deleteAmility = function(id) {
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        $scope.$emit('LOAD');
        $http.post('/deleteAmenities', { id: id, block_id: block_id }).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $route.reload();
            }
        });
    }
    $scope.facilityDetail = {
        block_id: block_id
    };

    $scope.updateId = function(id) {
        $scope.$emit('LOAD');
        $scope.facilityDetail.id = id;
        $http.post('/getSingleAmility', { id: id }).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $scope.facilityDetail.aminity_name = response.data.aminity_name;
                $scope.facilityDetail.charges = response.data.charges;
                $scope.facilityDetail.description = response.data.description;
                $scope.facilityDetail.time_for_pay = response.data.time_for_pay;

            }
            $scope.$emit('UNLOAD');
        });
    }
    $scope.updateAmelityDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/updateAmenities', $scope.facilityDetail).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 500);
            }
        });
    }
}]);

socialApp.controller('RequestEminity', ['$scope', '$routeParams', '$http', '$timeout', '$route', function($scope, $routeParams, $http, $timeout, $route) {
    $scope.$emit('LOAD');

    $scope.error = false;
    var block_id = atob($routeParams.blockID);
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userDetails.id;

    $scope.AllRequests = [];
    $http.post('/requestedResidentForAmenitiesToManager', { id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(item, key) {
                if (item.status == 1) {
                    item.status = 'Request Approved';
                } else if (item.status == 0) {
                    item.status = 'Requested';
                }
                $scope.AllRequests.push(item);
            });
        }
        $scope.$emit('UNLOAD');
    });
    $scope.UpdateDetails = {};
    $scope.setID = function(req_id) {
        $scope.error = false;
        $scope.UpdateDetails.Req_id = req_id;
    }
    $scope.approveReuest = function() {
        $scope.error = false;
        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        var data = {
            id: $scope.UpdateDetails.Req_id,
            manager_comment: $scope.UpdateDetails.manager_comment
        }
        $scope.$emit('LOAD');
        $http.post('/sendApproveDetailsToResidentAboutAmenities', data).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 200);
            } else {
                $scope.error = true;
                $scope.errMsg = response.error;
                $scope.$emit('UNLOAD');
                alert(response.error);
            }
        });
    }
}]);
socialApp.controller('RequestedListForResident', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    $scope.$emit('LOAD');
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userDetails.id;
    $scope.Amenities = [];

    $http.post('/listOfRequestedAmenitiesForResident', { resident_id: id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.Amenities = response.data;
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });
}]);

socialApp.controller('newAmilityRequestForResident', ['$scope', '$http', '$route', '$timeout', function($scope, $http, $route, $timeout) {
    $scope.$emit('LOAD');
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userDetails.id;
    $scope.Amenities = [];
    $http.post('/listOfAmenitiesForResident', { resident_id: id }).success(function(response) {
        if (response.hasOwnProperty('success')) {

            angular.forEach(response.data, function(item, key) {
                if (item.request_status == null || item.request_status == '') {
                    item.request_status = 3;
                }
                $scope.Amenities.push(item);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 500);
    });
    var activadate = [];
    $scope.ShowAvailiability = function(aminity_id) {
        $scope.$emit('LOAD');
        angular.element('#calendar').fullCalendar('destroy');

        $http.post('/checkDateForAmenity', { id: aminity_id }).success(function(response) {
            activadate = response.data;
            $timeout(function() {
                angular.element('#calendar').fullCalendar({
                    default: 'month',
                    dayRender: function(date, cell) {

                        var NewDate = new Date(date._d);
                        var CurrentDate = NewDate.getDate() + '-' + (NewDate.getMonth() + 1) + '-' + NewDate.getFullYear();
                        var CurrentDateInTime = NewDate.getTime();

                        for (var i = 0; i < activadate.length; i++) {

                            var booking_start_date = new Date(activadate[i].booking_start_date);
                            var NewBookingStartDate = booking_start_date.getDate() + '-' + (booking_start_date.getMonth() + 1) + '-' + booking_start_date.getFullYear();
                            var NewBookingStartDateInTime = booking_start_date.getTime();

                            var booking_end_date = new Date(activadate[i].booking_end_date);
                            var NewBookingEndDate = booking_end_date.getDate() + '-' + (booking_end_date.getMonth() + 1) + '-' + booking_end_date.getFullYear();
                            var NewBookingEndDateInTime = booking_end_date.getTime();

                            if ((CurrentDate == NewBookingStartDate) || (NewBookingStartDateInTime <= CurrentDateInTime && NewBookingEndDateInTime >= CurrentDateInTime) || (CurrentDate == NewBookingEndDate)) {
                                cell.css("background-color", "red");
                            }
                        }

                    }
                });
                $scope.$emit('UNLOAD');
            }, 500);

        });
    }

    $scope.setID = function(req_id) {
        $scope.aminity_id = req_id;
    }


    $scope.RequestForAmenity = function(aminity_id) {
        var returnVal = confirm('Do You Want To Request For This Facility ?');
        if (!returnVal) {
            return;
        }
        var data = {
            amenity_id: $scope.aminity_id,
            resident_id: id,
            booking_start_date: $scope.booking_start_date,
            booking_end_date: $scope.booking_end_date,
            resident_message: $scope.resident_message
        }
        $scope.$emit('LOAD');
        $http.post('/requestToManagerForAmenities', data).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $route.reload();
                }, 200);

            } else {
                alert(response.error);
            }
        });
    }
}]);
