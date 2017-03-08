/*For Resident*/
socialApp.controller('logComplaint', ['$scope','$http','$location', '$routeParams','$window', function($scope, $http, $location, $routeParams, $window){
	var residentId = JSON.parse(window.localStorage.getItem('userDetails'));
	$scope.complaint = {
		resident_id: residentId.id,
		suggestion:''
	};
	$scope.addComplaint = function(){
        $scope.$emit('LOAD');
		var url = '/addComplaint';
		$http.post(url, $scope.complaint).success(function(response,status,headers,config){
            $scope.$emit('UNLOAD');
			if(response.hasOwnProperty('success')){
				$location.path("/complaint-list");
            }else{
               $location.path("/complaint-list");
            }

        });
	}
		
}]);
socialApp.controller('complaintList',['$scope', '$http', '$location', '$compile','$route', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$window', function ($scope, $http,$location, $compile, $route, $timeout,DTOptionsBuilder,DTColumnBuilder,$window) {
        $scope.$emit('LOAD');
	    var residentId = JSON.parse(window.localStorage.getItem('userDetails'));
		var id = residentId.id;
		$scope.dtColumns = [
            //here We will add .withOption('name','column_name') for send column name to the server 
            DTColumnBuilder.newColumn("id", "Complaint ID").notSortable(),
            DTColumnBuilder.newColumn("subject", "Complaint Subject").notSortable(),
            DTColumnBuilder.newColumn("complaint", "Complaint").notSortable(),
            DTColumnBuilder.newColumn("suggestion", "Your Suggestion").notSortable(),
            DTColumnBuilder.newColumn("date", "Complaint Date").notSortable(),
            DTColumnBuilder.newColumn("status", "Complaint Status").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/getcomplaintList",
            type:"GET",
            data: function(d){
                d.id = id;
            },
            dataSrc: function (res) {
            console.log(res); 
                var log = [];
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse, function(value, key){
                    if (value.status=='Pending') {
                        value.status = '<div class="alert alert-danger">'+value.status+'</div>';
                        
                    }else if (value.status=='Resolved'){
                        value.status = '<div class="alert alert-success">'+value.status+'</div>';
                        
                    }else{
                        value.status = '<div class="alert alert-warning">'+value.status+'</div>';
                    }
                    log.push(value);

                });
                $timeout(function(){
                    $scope.$emit('UNLOAD');
                }, 1000);
                return log;
      		}
        })
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withPaginationType('full_numbers') 
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'asc'])
        .withOption('responsive', true)
        .withOption('createdRow', createdRow)
        /*.withDOM('frtip')
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ])*/;
        
        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            
            return '<a title="Print" href="javascript:void(0)" ng-click="printComplaint('+$d.id+')"><i class="fa fa-print"></i></a>';
        }

        $scope.printComplaint = function(id){
            var complaintId = btoa(id);
            $window.open('#/full-complaint-form/'+complaintId, "popup", "width=600,height=400,left=10,top=50");
        }
        
}]);
/*Print Complaint Form*/
socialApp.controller('fullComplaintForm', ['$scope','$http','$location', '$routeParams','$timeout', '$window', function($scope, $http, $location, $routeParams, $timeout, $window){
        $scope.$emit('LOAD');
        var complaintId = atob($routeParams.complaintID);
        var url = '/getcomplaintDetail';
        $scope.complaintDetail = {};
        $http.post(url, {complaintID: complaintId}).success(function(response,status,headers,config){
            
            if (response.hasOwnProperty('success')) {

                $scope.complaintDetail = JSON.parse(response.success);
                var date = new Date($scope.complaintDetail.date);
                $scope.complaintDetail.date = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear();
                if ($scope.complaintDetail.contact_no==0) {
                    $scope.complaintDetail.contact_no = 'Not Available';
                }
                if ($scope.complaintDetail.status==0) {
                    $scope.complaintDetail.status = 'Pending';
                }
                if ($scope.complaintDetail.status==1) {
                   $scope.complaintDetail.status = 'Under Surveillance';
                }
                if ($scope.complaintDetail.status==2) {
                    $scope.complaintDetail.status = 'Resolved';
                }
                $scope.$emit('UNLOAD');
                $timeout($window.print, 0);
            } 
        });
}]);

/*For Society Manager*/
socialApp.controller('pendingComplaintList',['$scope', '$http', '$location', '$compile','$route', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$routeParams','$window','$route', function ($scope, $http,$location, $compile, $route, $timeout,DTOptionsBuilder,DTColumnBuilder, $routeParams, $window, $route) {
        $scope.$emit('LOAD');
        var residentId = JSON.parse(window.localStorage.getItem('userDetails'));
        var id = residentId.id;
        var block_id = atob($routeParams.blockID);
        $scope.dtColumns = [
            //here We will add .withOption('name','column_name') for send column name to the server 
            DTColumnBuilder.newColumn("id", "Complaint ID").notSortable(),
            DTColumnBuilder.newColumn("first_name","Resident Name").notSortable(),
            DTColumnBuilder.newColumn("flat_number","Flat Number").notSortable(),
            DTColumnBuilder.newColumn("subject", "Complaint Subject").notSortable(),
            DTColumnBuilder.newColumn("complaint", "Complaint").notSortable(),
            DTColumnBuilder.newColumn("suggestion", "Your Suggestion").notSortable(),
            DTColumnBuilder.newColumn("date", "Complaint Date").notSortable(),
            //DTColumnBuilder.newColumn("status", "Complaint Status").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/complaintToManager",
            type:"GET",
            data: function(d){
                d.id = id;
                d.block_id = block_id;
                d.status = 0;
            },
            dataSrc: function (res) { 
                console.log(res);
                var log = [];
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse, function(value, key){

                    if (value.complaint_status=='Pending') {
                        value.status = '<div class="alert alert-danger">'+value.complaint_status+'</div>';
                    }else if (value.complaint_status=='Resolved'){
                        value.status = '<div class="alert alert-success">'+value.complaint_status+'</div>';
                    }else{
                        value.status = '<div class="alert alert-warning">'+value.complaint_status+'</div>';
                    }
                    log.push(value);

                });
                $timeout(function(){
                    $scope.$emit('UNLOAD');
                }, 1000);
                return log;
            }
        })
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withPaginationType('full_numbers') 
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'asc'])
        .withOption('responsive', true)
        .withOption('createdRow', createdRow);
        
        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            
            return '<a title="Print" href="javascript:void(0)" ng-click="printComplaint('+$d.id+')"><i class="fa fa-print"  style="margin:5% !important"></i></a>|<a title="View Details" href="#/view-complaint-details/'+btoa(block_id)+'/'+btoa($d.id)+'"><i class="fa fa-eye" style="margin:5% !important"></i></a>|<a title="Update Status to Under Surveillance" href="javascript:void(0)" ng-click="UpdateStatus('+$d.id+', 1)"><i class="fa fa-arrow-right" style="margin:5% !important"></i></a>|<a title="Update Status to Resolved" href="#"  data-toggle="modal" ng-click="SetID('+$d.id+')" data-target="#myModal"><i class="fa fa-check" style="margin:5% !important"></i></a>';
        }
        $scope.SetID = function(id){
            $scope.ComplaintUpdateID = id; 
        }
        $scope.printComplaint = function(id){
            var complaintId = btoa(id);
            $window.open('#/full-complaint-form/'+complaintId, "popup", "width=600,height=400,left=10,top=50");
        }
        $scope.UpdateStatus = function(id, status){
            var comment = $scope.comment;
            var text ='';
            if (status==1) {
                text +='Have You Started to work on this complaint ?';
            }
            if (status==2) {
                text +='Has this complaint sort ?';
            }
            var returnVal = confirm(text);

            if (returnVal) {
                $scope.$emit('LOAD');
                $http.post('/updatecomplaint', {id: id, status: status, comment: comment}).success(function(response){
                    
                    angular.element('#myModal').modal('hide');
                    angular.element('body').removeClass('modal-open');
                    angular.element('.modal-backdrop').remove();
                    if (response.hasOwnProperty('success')) {
                        $route.reload();
                    }
                    $scope.$emit('UNLOAD');
                })    
            }
            
        }
}]);

socialApp.controller('usComplaintList',['$scope', '$http', '$location', '$compile','$route', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$routeParams','$window','$route', function ($scope, $http,$location, $compile, $route, $timeout,DTOptionsBuilder,DTColumnBuilder, $routeParams, $window, $route) {
    $scope.$emit('LOAD');
    var residentId = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = residentId.id;
    var block_id = atob($routeParams.blockID);
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server 
        DTColumnBuilder.newColumn("id", "Complaint ID").notSortable(),
        DTColumnBuilder.newColumn("first_name","Resident Name").notSortable(),
        DTColumnBuilder.newColumn("flat_number","Flat Number").notSortable(),
        DTColumnBuilder.newColumn("subject", "Complaint Subject").notSortable(),
        DTColumnBuilder.newColumn("complaint", "Complaint").notSortable(),
        DTColumnBuilder.newColumn("suggestion", "Your Suggestion").notSortable(),
        DTColumnBuilder.newColumn("date", "Complaint Date").notSortable(),
       //DTColumnBuilder.newColumn("status", "Complaint Status").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
        contentType: "application/json;",
        url:"/complaintToManager",
        type:"GET",
        data: function(d){
            d.id = id;
            d.block_id = block_id;
            d.status = 1;
        },
        dataSrc: function (res) { 
            var log = [];
            var generateResponse = JSON.parse(res.success);
            angular.forEach(generateResponse, function(value, key){
                
                if (value.complaint_status=='Pending') {
                    value.status = '<div class="alert alert-danger">'+value.complaint_status+'</div>';
                }else if (value.complaint_status=='Resolved'){
                    value.status = '<div class="alert alert-success">'+value.complaint_status+'</div>';
                }else{
                    value.status = '<div class="alert alert-warning">'+value.complaint_status+'</div>';
                }
                log.push(value);

            });
            $timeout(function(){
                $scope.$emit('UNLOAD');
            }, 1000);
            return log;
        }
    })
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withPaginationType('full_numbers') 
    .withDisplayLength(10) // Page size
    .withOption('aaSorting',[0,'asc'])
    .withOption('responsive', true)
    .withOption('createdRow', createdRow);;
    
    function createdRow(row, data, dataIndex) {
    
        $compile(angular.element(row).contents())($scope);
    }
    function actionsHtml(data, type, full, meta) {
        $d = full;
        
        return '<a title="Print" href="javascript:void(0)" ng-click="printComplaint('+$d.id+')"><i class="fa fa-print"  style="margin:5% !important"></i></a>|<a title="Send Status Report" href="#" data-toggle="modal" data-target="#myModal1" ng-click="SetID('+$d.id+')"><i class="fa fa-envelope"  style="margin:5% !important"></i></a>|<a title="View Details" href="#/view-complaint-details/'+btoa(block_id)+'/'+btoa($d.id)+'"><i class="fa fa-eye" style="margin:5% !important"></i></a>|<a title="Update Status to Resolved" href="#"  data-toggle="modal" ng-click="SetID('+$d.id+')" data-target="#myModal"><i class="fa fa-check" style="margin:5% !important"></i></a>';
    }
    $scope.SetID = function(id){
        $scope.ComplaintUpdateID = id; 
    }

    $scope.printComplaint = function(id){
        var complaintId = btoa(id);
        $window.open('#/full-complaint-form/'+complaintId, "popup", "width=600,height=400,left=10,top=50");
    }
    $scope.UpdateStatus = function(id){
        var comment = $scope.comment;
        var returnVal = confirm('Has this complaint sort ?');
        if (returnVal) {
            $scope.$emit('LOAD');
            $http.post('/updatecomplaint', {id: id, status: 2, comment: comment}).success(function(response){
                
                angular.element('#myModal').modal('hide');
                angular.element('body').removeClass('modal-open');
                angular.element('.modal-backdrop').remove();
                if (response.hasOwnProperty('success')) {
                    $route.reload();
                }
                $scope.$emit('UNLOAD');
            })    
        }
        
    }

    $scope.SendStatusReport = function(){
        $scope.$emit('LOAD');

        var complaint_id = $scope.ComplaintUpdateID;
        var comment = $scope.StatusData;
        var data = {
            id: complaint_id,
            comment: comment
        };
        url = '/survillanceComplaintsStatusForResident';
        $http.post(url, data).success(function(response){
            $timeout(function(){
                    $scope.$emit('UNLOAD');
                    $route.reload();
            }, 500);
        });
    }
}]);

socialApp.controller('resolvedComplaintList',['$scope', '$http', '$location', '$compile','$route', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder','$routeParams','$window', function ($scope, $http,$location, $compile, $route, $timeout,DTOptionsBuilder,DTColumnBuilder, $routeParams, $window) {
        $scope.$emit('LOAD');
        var residentId = JSON.parse(window.localStorage.getItem('userDetails'));
        var id = residentId.id;
        var block_id = atob($routeParams.blockID);
        $scope.dtColumns = [
            //here We will add .withOption('name','column_name') for send column name to the server 
            DTColumnBuilder.newColumn("id", "Complaint ID").notSortable(),
            DTColumnBuilder.newColumn("first_name","Resident Name").notSortable(),
            DTColumnBuilder.newColumn("flat_number","Flat Number").notSortable(),
            DTColumnBuilder.newColumn("subject", "Complaint Subject").notSortable(),
            DTColumnBuilder.newColumn("complaint", "Complaint").notSortable(),
            DTColumnBuilder.newColumn("suggestion", "Your Suggestion").notSortable(),
            DTColumnBuilder.newColumn("date", "Complaint Date").notSortable(),
            //DTColumnBuilder.newColumn("status", "Complaint Status").notSortable(),
            DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
        ]
 
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url:"/complaintToManager",
            type:"GET",
            data: function(d){
                d.id = id;
                d.block_id = block_id;
                d.status = 2;
            },
            dataSrc: function (res) { 
                var log = [];
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse, function(value, key){
                    if (value.complaint_status=='Pending') {
                        value.status = '<div class="alert alert-danger">'+value.complaint_status+'</div>';
                    }else if (value.complaint_status=='Resolved'){
                        value.status = '<div class="alert alert-success">'+value.complaint_status+'</div>';
                    }else{
                        value.status = '<div class="alert alert-warning">'+value.complaint_status+'</div>';
                    }
                    log.push(value);

                });
                $timeout(function(){
                    $scope.$emit('UNLOAD');
                }, 1000);
                return log;
            }
        })
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withPaginationType('full_numbers') 
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'asc'])
        .withOption('responsive', true)
        .withOption('createdRow', createdRow);;
        
        function createdRow(row, data, dataIndex) {
        
            $compile(angular.element(row).contents())($scope);
        }
        function actionsHtml(data, type, full, meta) {
            $d = full;
            
            return '<a title="Print" href="javascript:void(0)" ng-click="printComplaint('+$d.id+')"><i class="fa fa-print"  style="margin:5% !important"></i></a>|<a title="View Details" href="#/view-complaint-details/'+btoa(block_id)+'/'+btoa($d.id)+'"><i class="fa fa-eye" style="margin:5% !important"></i></a>';
        }

        $scope.printComplaint = function(id){

            var complaintId = btoa(id);
            $window.open('#/full-complaint-form/'+complaintId, "popup", "width=600,height=400,left=10,top=50");
        }

}]);

socialApp.controller('viewComplaintDetails', ['$scope','$http', '$routeParams','$location', '$window','$timeout', function($scope, $http, $routeParams, $location, $window, $timeout){
        $scope.$emit('LOAD');

        var complaintId = atob($routeParams.complaintID);
        $scope.complaintId = $routeParams.complaintID;
        var url = '/getcomplaintDetail';
        $scope.complaintDetail = {};
        $http.post(url, {complaintID: complaintId}).success(function(response,status,headers,config){
            
            if (response.hasOwnProperty('success')) {

                $scope.complaintDetail = JSON.parse(response.success);
                var date = new Date($scope.complaintDetail.date);
                $scope.complaintDetail.date = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear();
                if ($scope.complaintDetail.contact_no==0) {
                    $scope.complaintDetail.contact_no = 'Not Available';
                }
                if ($scope.complaintDetail.status==0) {
                    $scope.complaintDetail.status = 'Pending';
                }
                if ($scope.complaintDetail.status==1) {
                    $scope.complaintDetail.status = 'Under Surveillance';
                }
                if ($scope.complaintDetail.status==2) {
                    $scope.complaintDetail.status = 'Resolved';
                }
                $timeout(function(){
                    $scope.$emit('UNLOAD');
                }, 500);
            }
            
        });

        $scope.printDetails = function(){
            var complaintId = $routeParams.complaintID;;
            $window.open('#/full-complaint-form/'+complaintId, "popup", "width=600,height=400,left=10,top=50");
        }
}])

