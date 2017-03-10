/*Admin Header*/
socialApp.directive('header', ['$compile', '$http', '$location', '$route', function($compile, $http, $location, $route) {
    return {
        restrict: 'E',
        templateUrl: 'admin/admin-panel/html/header.html',
        transclude: true,
        link: function(scope, element, attrs) {
            scope.headerOption = false;
            scope.activetab = $route.current.activetab;
            var userDetails = window.localStorage.getItem('userDetails');
            if (userDetails == null) {
                $location.path("/admin-login");
            } else {
                scope.$emit('LOAD');
                $http.get("/authentication/admin").success(function(response, status, headers, config) {
                    scope.$emit('UNLOAD');
                    if (response.status == 'success') {

                    } else {
                        $location.path("/admin-login");
                    }
                });
            }

            var i = 1;
            scope.openModel = function() {
                if (i % 2 == 1) {
                    angular.element('.dropdown-menu').css('display', 'block');
                } else {
                    angular.element('.dropdown-menu').css('display', 'none');
                }
                i++;
            }
            scope.logOut = function() {
                scope.$emit('LOAD');
                $http.get("/logout", { logout: 'admin' }).success(function(response, status, headers, config) {
                    scope.$emit('UNLOAD');
                    window.localStorage.removeItem('userDetails');
                    $location.path("/admin-login");
                });
            };
        }
    }
}]);

/*Service Admin Header*/
socialApp.directive('serviceheader', ['$compile', '$http', '$location', '$route', function($compile, $http, $location, $route) {
    return {
        restrict: 'E',
        templateUrl: 'serviceadmin/html/header.html',
        transclude: true,
        link: function(scope, element, attrs) {
            scope.headerOption = false;
            scope.activetab = $route.current.activetab;
            var userDetails = window.localStorage.getItem('userDetails');
            if (userDetails == null) {
                $location.path("/service-admin-login");
            } else {
                scope.$emit('LOAD');

                $http.get("/service_authenticated/serviceadmin").success(function(response, status, headers, config) {
                    scope.$emit('UNLOAD');
                    if (response.status == 'success') {
                    
                    } else {
                        $location.path("/service-admin-login");
                    }
                });
            }

            var i = 1;
            scope.openModel = function() {
                if (i % 2 == 1) {
                    angular.element('.dropdown-menu').css('display', 'block');
                } else {
                    angular.element('.dropdown-menu').css('display', 'none');
                }
                i++;
            }
            scope.logOut = function() {
                scope.$emit('LOAD');
                $http.get("/service_logout", { service_logout: 'serviceadmin' }).success(function(response, status, headers, config) {
                    scope.$emit('UNLOAD');
                    window.localStorage.removeItem('userDetails');
                    $location.path("/service-admin-login");
                });
            };
        }
    }
}]);

/*Society manager Header*/
socialApp.directive('societyHeader', ['$compile', '$http', '$location', '$routeParams', '$route', function($compile, $http, $location, $routeParams, $route) {
    return {
        restrict: 'C',
        templateUrl: 'society/html/header.html',
        transclude: true,
        link: function(scope, element, attrs) {
            /*scope.$emit('LOAD');*/
            scope.headerOption = false;
            scope.isSocietyManager = false;
            scope.activetab = $route.current.activetab;
            scope.isUpdated = true;

            var id = window.atob($routeParams.blockID);
            scope.manageDetail = window.localStorage.getItem('manageDetail');
            scope.userDetail = JSON.parse(window.localStorage.getItem('userDetails'));

            if (scope.userDetail == null) {

                $location.path("/society-manager-login");

            } else {
                $http.get("/authentication/societyManager").success(function(response, status, headers, config) {
                    if (response.status == 'success') {
                        var blockManager = JSON.parse(window.localStorage.getItem('blockManager'));

                        if (blockManager != null) {
                            if (blockManager.is_societymanager == 1) {
                                scope.isSocietyManager = true;
                            }

                        } else {
                            $http.post("/checkForSocietyManager", { block_id: id, managerId: scope.userDetail.id }).success(function(response, status, headers, config) {
                                window.localStorage.setItem('blockManager', JSON.stringify(response));
                                if (response.is_societymanager == 1) {
                                    scope.isSocietyManager = true;

                                } else {

                                }
                            });
                        }
                        $http.post('/getSingleBlock', { id: id }).success(function(response) {

                            if (response.success) {

                                scope.parent_id = window.btoa(response.success.parent_id);
                                scope.id = window.btoa(response.success.id);
                                scope.societyLogo = response.success.logo;

                                if (response.success.parking_avail == 1) {
                                    scope.parkingAvail = true;
                                } else {
                                    scope.parkingAvail = false;
                                }
                                scope.$emit('UNLOAD');
                            } else {

                                $location.path('/404');

                            }
                        });
                        scope.$emit('UNLOAD');

                    } else {
                        $location.path("/society-manager-login");
                    }
                });
            }

            var i = 1;
            scope.openModel = function() {
                if (i % 2 == 1) {
                    angular.element('.dropdown-menu').css('display', 'block');
                } else {
                    angular.element('.dropdown-menu').css('display', 'none');
                }
                i++;
            }
            scope.logOut = function() {
                /*scope.$emit('LOAD');*/
                $http.get("/logout", { logout: 'societyManager' }).success(function(response, status, headers, config) {
                    window.localStorage.removeItem('manageDetail');
                    window.localStorage.removeItem('userDetails');
                    window.localStorage.removeItem('blockManager');
                    scope.$emit('UNLOAD');
                    $location.path("/society-manager-login");
                });
            };

        }
    }
}]);
/*Society manager Header*/
socialApp.directive('man2helpForm', ['$compile', '$http', '$location','$route', function($compile, $http, $location,$route) {
    return {
        restrict: 'C',
        templateUrl: 'front/html/header.html',
        transclude: true,
        link: function(scope, element, attrs) {
            scope.help1={};
            scope.man2help = true;
            scope.activetab = $route.current.activetab;
            scope.services = [];
            $http.post('/ListServices').success(function(response) {
            if (response.hasOwnProperty('success')) {
              scope.services = response.data;
            }});
            if(scope.activetab=="residentDashboard"){
             scope.userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
            }

        scope.requestHelp = function() {
        console.log(scope.help.city);
scope.help1=
       {
        resident_id:scope.userDetail.id,
        service_id:scope.help.service,
        req_date:scope.help.date,
        resident_commnet:scope.help.city,
        };
        console.log(scope.help1);
        $http.post('/service_request',scope.help1).success(function(response) {
            console.log("log request successfully")
        })
          }             
            scope.man2helpFormClose = function() {
                scope.man2help = false;
            }
        }
    }
}]);
/*Man2Help Header*/
socialApp.directive('man2helpHeader', ['$compile', '$http', '$location', function($compile, $http, $location) {
    return {
        restrict: 'C',
        templateUrl: 'man2help/header.html',
        transclude: true,
        link: function(scope, element, attrs) {}
    }
}]);

/*Resident Header*/
socialApp.directive('residentheader', ['$compile', '$http', '$location', '$routeParams', '$route', function($compile, $http, $location, $routeParams, $route) {
    return {
        restrict: 'E',
        templateUrl: 'resident/html/header.html',
        transclude: true,
        link: function(scope, element, attrs) {
            scope.activetab = $route.current.activetab;
            scope.userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
            scope.isOwner = false;
            scope.profileCompletePercentage = 0;

            if ((scope.userDetail.first_name == '' && scope.userDetail.last_name == '') || (scope.userDetail.first_name == null && scope.userDetail.last_name == null)) {
                scope.userDetail.fullName = scope.userDetail.email;
            } else {
                scope.userDetail.fullName = scope.userDetail.first_name + ' ' + scope.userDetail.last_name;
            }

            if (scope.userDetail.ownership == 'tenant') {
                scope.isOwner = true;
            }
            $http.get("/authentication/Resident").success(function(response, status, headers, config) {
                if (response.status == 'success') {
                    $http.post("/residentProfile", { id: scope.userDetail.id }).success(function(response, status, headers, config) {

                        if (response.hasOwnProperty('success')) {
                            var res = JSON.parse(response.success);
                            var percent = parseInt(res.profile_percent);
                            scope.profileCompletePercentage = percent;
                            if (percent >= 40) {

                            } else {
                                $location.path("/resident-profile-update");
                            }
                        } else {
                            $location.path("/resident-login");
                        }
                    });
                } else {
                    $location.path("/resident-login");
                }
            });
            var i = 1;
            scope.Complaints = true;
            scope.openComplaint = function() {
                angular.element('.dropdown-menu-notification').css('display', 'none');
                if (i % 2 == 1) {
                    scope.Complaints = true;
                    angular.element('#demo').css('display', 'block');
                } else {
                    angular.element('#demo').css('display', 'none');
                }
                i++;
            }
            var j = 1;
            scope.openNotification = function() {
                angular.element('.dropdown-menu-user').css('display', 'none');
                if (j % 2 == 1) {
                    angular.element('.dropdown-menu-notification').css('display', 'block');
                } else {
                    angular.element('.dropdown-menu-notification').css('display', 'none');
                }
                j++;
            }
            scope.logOut = function() {

                $http.get("/logout", { logout: 'resident' }).success(function(response, status, headers, config) {
                    window.localStorage.removeItem('userDetails');
                    $location.path("/resident-login");
                });
            };

        }
    }
}]);

/*Staff Member*/
socialApp.directive('staffmember', ['$compile', '$http', '$location', '$routeParams', '$route', function($compile, $http, $location, $routeParams, $route) {
    return {
        restrict: 'E',
        templateUrl: 'staff/html/header.html',
        transclude: true,
        link: function(scope, element, attrs) {
            scope.activetab = $route.current.activetab;
            $http.get("/authentication/Staff").success(function(response, status, headers, config) {
                if (response.status == 'success') {

                } else {
                    $location.path("/staff-login");
                }
            });
            scope.logOut = function() {
                $http.get("/logout", { logout: 'resident' }).success(function(response, status, headers, config) {
                    window.localStorage.removeItem('userDetails');
                    $location.path("/staff-login");
                });
            };
        }
    }
}]);
