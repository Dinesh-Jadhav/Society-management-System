var customApp = angular.module('customApp', ['ngRoute']);

customApp.config(function($routeProvider){
    $routeProvider.when('/', {
        controller: 'indexController',
        templateUrl : 'html/login.html'
    }).when('/detail/:id', {
        controller: 'detailController',
        templateUrl : 'details.php'
    }).otherwise({
        redirectTo: '/'
    });
});