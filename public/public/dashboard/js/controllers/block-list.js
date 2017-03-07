
socialApp.controller('blockList',['$scope', '$http', '$location', '$compile','$route','$routeParams', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', function ($scope, $http,$location, $compile, $route, $routeParams, $timeout,DTOptionsBuilder,DTColumnBuilder) {
        /*$scope.$emit('LOAD');*/
	    var id = $routeParams.id;
		$scope.dtColumns = [
            //here We will add .withOption('name','column_name') for send column name to the server 
            DTColumnBuilder.newColumn("name", "Name").notSortable(),
            DTColumnBuilder.newColumn("society_name", "Society").notSortable(),
            DTColumnBuilder.newColumn("description", "Description").notSortable(),
            DTColumnBuilder.newColumn("storeys", "Number of Storeys").notSortable(),
            DTColumnBuilder.newColumn("num_of_flats", "Number of Flats").notSortable(),
            DTColumnBuilder.newColumn("manager_name", "Manager").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/getblockList",
            type:"GET",
            data: function(d){
                d.id = id;
            },
            dataSrc: function (res) { 
                var generateResponse = JSON.parse(res.success);
                $scope.$emit('UNLOAD');
                return generateResponse;
      		}
        })
        .withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'asc'])
         .withOption('responsive', true)
        .withOption('createdRow', createdRow);

        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            return '<a href="#/block/'+$d.society_slug+'/'+$d.slug+'" title="Preview" target="_blank"><i class="fa fa-eye"></i></a> | <a href="#/edit-block/'+$d.id+'" title="Edit"><i class="fa fa-edit"></i></a> | <a href="javascript:void(0)" ng-click="deleteBlock('+$d.id+')" title="Delete"><i class="fa fa-trash"></i></a>'; 
        }
        
		$scope.deleteBlock = function(id){
            /*$scope.$emit('LOAD');*/
			var url = '/deleteBlock';
			$http.post(url, {id: id}).success(function(response){
                $scope.$emit('UNLOAD');
				$route.reload();
			});
		}
}]);
