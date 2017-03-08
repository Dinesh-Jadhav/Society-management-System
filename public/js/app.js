'use strict';

var socialApp = angular.module('socialApp', ['ngRoute']);

socialApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider
	.when('/', {
		controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'Home | Society Management'
	})
    .when('/features', {
        controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'Features | Society Management'
    })
    .when('/societies', {
        controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'Societies | Society Management'
    })
    .when('/vendors', {
        controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'Vendors | Society Management'
    })
    .when('/about', {
        controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'About | Society Management'
    })
    .when('/contact', {
        controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'Contact | Society Management'
    });
}]);

socialApp.run(['$rootScope', '$route', '$anchorScroll', function($rootScope, $route, $anchorScroll) {
    $rootScope.$on('$routeChangeSuccess', function() {
        document.title = $route.current.title;
        $anchorScroll();
    });
}]);