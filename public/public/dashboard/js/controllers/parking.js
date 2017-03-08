socialApp.controller('parking', ['$scope', '$http', '$location', '$compile', '$timeout', '$routeParams', function($scope, $http, $location, $compile, $timeout, $routeParams) {
    /*$scope.$emit('LOAD');*/
    var id = window.atob($routeParams.blockID);
    $scope.flat = {};
    $scope.flat.flatNumber = [];
    $scope.flat.flatType = [];
    $scope.synchFlatType = false;

    $scope.Error = false;

    $http.post('/getSingleBlock', { id: id }).success(function(response) {

        if (response.success) {

            var numberOfStoreys = 1; //parseInt(response.success.storeys);

            $scope.block = response.success;
            $scope.blockStorey = [];
            $scope.flat.block_id = $scope.block.id;
            $scope.flat.numberOfStoreys = numberOfStoreys;
            $scope.flat.numberOfFlats = parseInt($scope.block.num_of_flats);
            $scope.block.parent_id = window.btoa($scope.block.parent_id);
            $scope.block.id = window.btoa($scope.block.id);

            for (var i = 1; i <= numberOfStoreys; i++) {

                $scope.blockStorey.push({ storeyNo: i });

            }


        } else {

            $location.path('/404');

        }
        $scope.$emit('UNLOAD');
    });
    $scope.openDetailedForm = function(noOfFlats, index, _that) {
        /*$scope.$emit('LOAD');*/

        if (angular.isUndefined(_that)) {
            _that = this;
        }
        var number = _that.storey.storeyNo;

        var str = '';
        $scope.flat.flatNumber[number] = [];

        if (typeof $scope.flat.flatType[1] === 'undefined' || !($scope.synchFlatType)) {
            $scope.flat.flatType[number] = [];
        } else {
            $scope.flat.flatType[number] = $scope.flat.flatType[1];
        }


        for (var i = 1; i <= noOfFlats; i++) {

            $scope.flat.flatNumber[number][i] = number + '0' + i;

            if (typeof $scope.flat.flatType[1][i] !== 'undefined' && $scope.synchFlatType) {
                $scope.flat.flatType[number][i] = $scope.flat.flatType[1][i];
            } else {

                $scope.flat.flatType[number][i] = '1';
            }


            if (i % 10 == 0) {
                $scope.flat.flatNumber[number][i] = number + '' + i;
            }

            str += '<div class="flatInfo"><input type="text" class="form-control flatNumber" value="' + number + '0' + i + '" ng-model="flat.flatNumber[' + number + '][' + i + ']"/></div>';
        }

        var val = $compile(str)($scope);
        var myEl = angular.element(document.querySelector('#flatElements' + number));
        myEl.html(val);
        $scope.$emit('UNLOAD');
    }

    $scope.addParkingSlots = function() {
        /*$scope.$emit('LOAD');*/
        var block_id = $scope.flat.block_id;
        var totalFlatsByAdmin = 10; // $scope.flat.numberOfFlats;
        var count = 0;

        for (var temp = 0; temp <= $scope.flat.numberOfStoreys - 1; temp++) {
            count = parseInt($scope.flat.noOfFlats[temp]) + count;

        }


        for (var i = 1; i <= $scope.flat.flatNumber.length - 1; i++) {

            var storey_number = i;

            for (var j = 1; j <= $scope.flat.flatNumber[i].length - 1; j++) {

                var data = {};
                var flat_number = $scope.flat.flatNumber[i][j];
                var flat_type = $scope.flat.flatType[i][j];

                data.block_id = block_id;
                data.name = flat_number;

                $http.post('/addParking', data).success(function(response) {
                    $scope.$emit('UNLOAD');
                    if (response.hasOwnProperty('success')) {
                        $location.path('/manage-parking/' + $routeParams.blockID);
                    }
                });
            }
        }
    }

}]);

socialApp.controller('parkingList', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    var block_id = window.atob($routeParams.blockID);
    $scope.parkingArr = [];
    $scope.manageBtn = true;
    $http.get('/getParkingList/?block_id=' + block_id).success(function(response) {

        if (response.hasOwnProperty('data')) {

            if (response.data.length > 0) {
                $scope.manageBtn = false;
            }
            angular.forEach(response.data, function(item, key) {
                if (item.resident_name == null || item.resident_name == '') {
                    item.resident_name = 'N/A';
                }
                if (item.flat_number == null || item.flat_number == '') {
                    item.flat_number = 'N/A';
                }
                $scope.parkingArr.push(item)
            });
        }

    });

    $scope.assignParking = [];
    $http.post('/listOfAssignParking', { block_id: block_id }).success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('success')) {
            $scope.assignParking = response.data;
        }
    });
}]);
