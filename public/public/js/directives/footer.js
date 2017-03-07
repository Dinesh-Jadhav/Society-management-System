socialApp.directive('indexfooter', ['$http', function($http){
	// Runs during compile
	return {
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: 'templates/footer.html',
		transclude: true,
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};
}]);