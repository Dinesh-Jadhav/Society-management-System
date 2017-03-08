
socialApp.controller('society',['$scope', '$http', '$location', '$compile','Upload', '$timeout', function ($scope, $http,$location, $compile, Upload, $timeout) {
		$scope.$emit('LOAD');
		$scope.close=false;
		$scope.cropedImg = false;
		$scope.crop =false;
		
		$scope.ActiveManagers = {};
		/*Get list of managers*/
		$http.get('/ActiveManagersList').success(function(response){
			$scope.ActiveManagers = JSON.parse(response.success);
			
		});
		/*Load Google Map*/
		var map;
	    var marker;
	    $scope.LoadMap= function() {
		    
	    	SetMarker(22.71777014235048, 75.85437297821045, 'Indore');
	    }

		$scope.GetLocation = function(){
			/*$scope.$emit('LOAD');*/
			var geocoder = new google.maps.Geocoder();
            var address = $scope.society.address;
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();
                    
                    SetMarker(latitude, longitude, address);
                }else{
                	alert('Sorry ! address not found on map, try again !')
                }
                $scope.$emit('UNLOAD');

            });
		}
		
		$scope.upload_cover = function (dataUrl, name, type) {
	        Upload.upload({
	            url: '/uploadPhoto',
	            data: {
	                file: Upload.dataUrltoBlob(dataUrl, name),
	                type: type 
	            },
	        }).then(function (response) {
	            $timeout(function () {
	            	$scope.onUpload = false;
	            	$scope.close=false;
					$scope.crop =false;
					$scope.progress =-1;
	                
	            });
	            $scope.society.coverImg = response.data.photoId;
	        }, function (response) {
	            if (response.status > 0) $scope.errorMsg = response.status 
	                + ': ' + response.data;
	            $scope.onUpload = false;
	        }, function (evt) {
	        	$scope.crop =true;
	            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
	        });
	    }
	    $scope.upload_logo = function (dataUrl, name, type) {
	        Upload.upload({
	            url: '/uploadPhoto',
	            data: {
	                file: Upload.dataUrltoBlob(dataUrl, name),
	                type: type 
	            },
	        }).then(function (response) {
	        	
	            $timeout(function () {
	            	$scope.onUpload = false;
	            	$scope.close=false;
					$scope.crop =false;
					$scope.progress =-1;
	            });
	            $scope.society.logoImg = response.data.photoId;
	        }, function (response) {
	            if (response.status > 0) $scope.errorMsg = response.status 
	                + ': ' + response.data;
	            $scope.onUpload = false;
	        }, function (evt) {
	        	$scope.crop =true;
	            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
	        });
	    }

	    $scope.addSociety = function(){
	    	/*$scope.$emit('LOAD');*/
	    	var has_blocks = $scope.society.has_blocks; 
	    	$http.post('/checkSlug', {rslug: $scope.society.name}).success(function(response){
            	$scope.society.slug = response.slug;

            	$http.post('/addSociety', $scope.society).success(function(addResponse){
	             	if(addResponse.success){
		    			$location.path('/add-blocks/'+addResponse.lastInsertId);
	    				$scope.$emit('UNLOAD');
	    			}
	    		
	    		});
	    	});
	    	
	    }



	    /*Set marker possition*/
	    function SetMarker(latitude, longitude, title) {
	    	

			var myLatlng = new google.maps.LatLng(latitude, longitude);

			var mapOptions = {
	            center: myLatlng,
	            zoom: 15,
	            mapTypeId: google.maps.MapTypeId.ROADMAP
	        };

	        map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);

	        marker = new google.maps.Marker({
	            position: myLatlng,
	            map: map,
	            title: title
	        });

	        google.maps.event.addListener(map,'click',function(event) {
	        	
				$scope.society.latitude = event.latLng.lat();
				$scope.society.longitude = event.latLng.lng();
				var myLatlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());

				var mapOptions = {
		            center: myLatlng,
		            zoom: 15,
		            mapTypeId: google.maps.MapTypeId.ROADMAP
		        };

		        map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);

		        marker = new google.maps.Marker({
		            position: myLatlng,
		            map: map,
		            title: title
		        });
	        });
	 	}
}]);