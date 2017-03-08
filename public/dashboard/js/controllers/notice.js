socialApp.controller('addNotice', ['$scope', '$http', '$routeParams', 'CkGetData', '$location', function($scope, $http, $routeParams, CkGetData, $location) {
    $scope.Residents = [];
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.notice = {
        block_id: block_id
    };
    $http.post('/getSimpleResidentListOfBlock', { id: block_id }).success(function(response) {
        if (response.hasOwnProperty('status') && response.status == 200) {
            $scope.Residents = response.success;
        }
        $scope.$emit('UNLOAD');
    });
    $scope.sendNotice = function() {
        $scope.$emit('LOAD');
        $scope.notice.notice_content = CkGetData.getResponse('noticeWrite');
        angular.forEach($scope.notice.notice_recipt, function(item, key) {
            var tempArr = [];
            if (item == 'All') {
                angular.forEach($scope.Residents, function(item1, key1) {
                    tempArr.push(item1.id);
                });
                $scope.notice.notice_to = tempArr.join();

            } else {
                $scope.notice.notice_to = $scope.notice.notice_recipt.join();
            }
        });

        $http.post('/insertNotice', $scope.notice).success(function(response) {
            $scope.$emit('UNLOAD');
            if (response.hasOwnProperty('success')) {
                $location.path('/view-notice/' + btoa(block_id));
            }
        });
    }
}]);

/**/
socialApp.controller('listOfNoticeToManager', ['$scope', '$http', '$routeParams', '$sce', '$route', '$timeout', 'DTOptionsBuilder', function($scope, $http, $routeParams, $sce, $route, $timeout, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

    $scope.notices = [];
    var block_id = atob($routeParams.blockID);
    $scope.$emit('LOAD');
    $http.post('/listOfNoticeToManager', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            var data = response.data;
            var log = [];
            angular.forEach(data, function(item, key) {
                item.notice_content = $sce.trustAsHtml(item.notice_content);
                log.push(item);
            });
            $scope.notices = log;
        }
        $scope.$emit('UNLOAD');
    });
    $scope.AssginId = function(notice_id, notice_rec) {
        $scope.data = {
            id: notice_id,
            notice_to: notice_rec
        }
    }
    $scope.ResendNotification = function() {
        $scope.$emit('LOAD');
        $http.post('/sentNoticeToResidents', $scope.data).success(function(response) {

            if (response.hasOwnProperty('success')) {
                $timeout(function() {
                    $scope.$emit('UNLOAD');
                    $route.reload();
                }, 500);

            }
        });
    }
}]);

socialApp.controller('resNotice', ['$scope','$http','$sce','DTOptionsBuilder','DTColumnDefBuilder', function($scope,$http,$sce,DTOptionsBuilder,DTColumnDefBuilder){
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);

        /*$scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef([4])
                              .withTitle('Date')
                              .withOption('type', 'date')
        ];*/
  $scope.$emit('LOAD');
  var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
  var id=userDetails.id;
  $scope.notices=[];
  $http.post('/listOfNoticeToResidents',{id: id}).success(function(response){
    if (response.hasOwnProperty('success')) {
            var data = response.data;
            var log = [];
            angular.forEach(data, function(item, key) {
                item.notice_content = $sce.trustAsHtml(item.notice_content);
                log.push(item);
            });
            $scope.notices = log;
        }
    $scope.$emit('UNLOAD');
  });
}]);
