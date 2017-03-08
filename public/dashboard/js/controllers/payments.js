socialApp.controller('PayDues', ['$scope', '$rootScope', '$http', '$timeout', 'sha256', '$location', '$crypthmac', 'DTOptionsBuilder', function($scope, $rootScope, $http, $timeout, sha256, $location, $crypthmac, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'pdf'
        ]);
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = userDetails.id;
    var userName = userDetails.first_name + ' ' + userDetails.last_name;
    var userEmail = userDetails.email;
    var userCon = userDetails.contact_no;
    var SALT = '';
    var Key = '';
    //$scope.payUdetail = [];
    $http.post('/payUdetailsOfSocietyByResident', { resident_id: id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            Key = response.success.marchant_key;
            SALT = response.success.marchant_salt;
        }
        $scope.$emit('UNLOAD');
    });

    $scope.noData = true;
    var protocol = $location.protocol();
    var host = $location.host();
    var port = $location.port();

    var surl = protocol + '://' + host;
    var furl = protocol + '://' + host;

    if (host == 'localhost') {
        surl += ':' + port;
        furl += ':' + port;
    }
    surl += '/payment-success';
    furl += '/payment-fail';

    $scope.paymentDetails = {
        //key: Key,
        firstname: userName,
        email: userEmail,
        phone: userCon,
        surl: surl,
        furl: furl,
        udf1: id,
        udf2: 0,
    };

    $scope.pay = function(event) {
        $scope.paymentDetails.txnid = sha256.convertToSHA256(randomString(5)).substring(0, 20).toLowerCase();
        $scope.paymentDetails.amount = $scope.totalPayableAmount;
        $scope.paymentDetails.key = Key;
        console.log($scope.paymentDetails.key);
        var product = $scope.AmenityPaid.concat($scope.FacilityPaid);
        var proDetail = JSON.stringify(product);
        $scope.paymentDetails.productinfo = proDetail;

        hashString = $scope.paymentDetails.key + '|' + $scope.paymentDetails.txnid + '|' + $scope.totalPayable + '|' + $scope.paymentDetails.productinfo + '|' + $scope.paymentDetails.firstname + '|' + $scope.paymentDetails.email + '|' + id + '|' + $scope.paymentDetails.udf2 + '|||||||||' + SALT;
        console.log(hashString);
        $http.post('/createHash', { string: hashString }).success(function(response) {
            $scope.paymentDetails.hash = response;
        });

        $scope.paymentDetails.service_provider = 'service_provider';

        setTimeout(function() {
            document.paymentFrm.submit();
        }, 3000);

    }

    $scope.Facilities = [];
    $scope.Amenities = [];
    $scope.$emit('LOAD');
    $http.post('/residentAllFacilityMaintainance', { resident_id: id }).success(function(response) {

        if (response.hasOwnProperty('success')) {

            var totalPayableForFacility = 0;
            var today = new Date();
            var todayDate = today.getDate();

            angular.forEach(response.data, function(item, key) {

                var paymentDate = new Date(item.response_date);
                var last_payment_date = new Date(item.last_payment_date);
                var payDate = paymentDate.getDate();
                var diff = payDate - todayDate;
                var days = (today - last_payment_date) / (1000 * 60 * 60 * 24);
                item.availFcaility = true;
                if (days >= 5 || last_payment_date == 'Invalid Date') {
                    totalPayableForFacility += item.charges;
                    item.availFcaility = false;
                }
                $scope.Facilities.push(item);
            });

            $scope.totalPayableAmount = totalPayableForFacility;
            $http.post('/residentAllAmenityMaintainance', { resident_id: id }).success(function(Res) {

                if (Res.hasOwnProperty('success')) {
                    var totalPayableForService = 0;
                    angular.forEach(Res.data, function(item, key) {
                        var booking_end_date = new Date(item.booking_end_date);
                        var booking_start_date = new Date(item.booking_start_date);
                        var days = (Math.round((booking_end_date - booking_start_date) / (1000 * 60 * 60 * 24)) + 1);
                        item.days = days;
                        item.amount = item.charges * days;
                        totalPayableForService += item.charges * days;

                        $scope.Amenities.push(item);
                    });
                    $scope.totalPayableAmount += totalPayableForService;
                }
                $scope.$emit('UNLOAD');
            });
        }
    });
    $scope.changeFac = {};
    $scope.FacilityPaid = [];

    $scope.totalPayable = 0;

    $scope.changeFacility = function() {

        angular.forEach($scope.changeFac, function(item, key) {
            var faciltyId = {
                id: key,
                amount: item,
                type: 'Facility'
            }
            if (item) {
                $scope.FacilityPaid.push(faciltyId);
                var i = 1;
                angular.forEach($scope.FacilityPaid, function(req, key1) {
                    if (req.id == key && i <= 2) {
                        if (i == 1) {
                            $scope.totalPayable += parseInt(item);
                        } else if (i >= 2) {
                            $scope.totalPayable -= parseInt(item);
                            $scope.FacilityPaid.splice(key1, 1);
                        }
                        i++;
                    }
                });

            } else {
                angular.forEach($scope.FacilityPaid, function(req, key1) {

                    if (req.id == key) {
                        $scope.totalPayable -= parseInt(req.amount);
                        $scope.FacilityPaid.splice(key1, 1);
                    }
                });

            }
        });
    }

    $scope.changeAme = {};
    $scope.AmenityPaid = [];

    $scope.changeAmenity = function() {
        angular.forEach($scope.changeAme, function(item, key) {
            var faciltyId = {
                id: key,
                amount: item,
                type: 'Amenity'
            }
            if (item) {
                $scope.AmenityPaid.push(faciltyId);
                var i = 1;
                angular.forEach($scope.AmenityPaid, function(req, key1) {
                    if (req.id == key && i <= 2) {
                        if (i == 1) {
                            $scope.totalPayable += parseInt(item);
                        } else if (i >= 2) {
                            $scope.totalPayable -= parseInt(item);
                            $scope.AmenityPaid.splice(key1, 1);
                        }
                        i++;
                    }
                });

            } else {
                angular.forEach($scope.AmenityPaid, function(req, key1) {
                    if (req.id == key) {
                        $scope.totalPayable -= parseInt(req.amount);
                        $scope.AmenityPaid.splice(key1, 1);
                    }
                });
            }
        });
    }

    function randomString(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

}]);

socialApp.controller('listTransaction', ['$scope', '$http', '$window', '$timeout', 'DTOptionsBuilder', function($scope, $http, $window, $timeout, DTOptionsBuilder) {

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
    $scope.totalTransaction=0;    
    $scope.transaction = [];
    var transData = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = transData.id;
    $scope.$emit('LOAD');
    $http.post('/displayPaymentDetails', { id: id }).success(function(response) {
        console.log(response);
        if (response.hasOwnProperty('status') && response.status == 200) {
            var transaction = response.data;
            var log = [];
            angular.forEach(transaction, function(value, key) {
                value.enid = btoa(value.id);
                log.push(value);
                $scope.totalTransaction=$scope.totalTransaction+value.amount;
                
                if (value.productinfo == "maintainance") {
                    value.productinfo = "maintainance";
                } else if (value.productinfo == "contribution") {
                    value.productinfo = "contribution";
                } else {
                    proInfo = (JSON.parse(value.productinfo));
                    var output = "";
                    for (var i = proInfo.length - 1; i >= 0; i--) {
                        if (proInfo[i].hasOwnProperty('type')) {
                            output += proInfo[i].type + ',';
                        }
                    }
                    value.productinfo = output;
                }

                if (value.email == '') {
                    value.email = "--";
                }
                if (value.phone == '') {
                    value.phone = "--";
                }
                if (value.transaction_status == '') {
                    value.transaction_status = "--";
                }
                if (value.discount == '') {
                    value.discount = "--";
                }
            });
            $scope.transaction = log;
        } else {
            alert(response.error);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);

    });
    $scope.printReceipt = function(id) {
        var transID = btoa(id);
        $window.open('#/transaction-receipt/' + transID, "popup", "width=600,height=400,left=10,top=50");
    }
}]);


socialApp.controller('printReceipt', ['$scope', '$http', '$location', '$routeParams', '$timeout', '$window', function($scope, $http, $location, $routeParams, $timeout, $window) {

    var transId = atob($routeParams.transID);

    $scope.transDetail = [];
    $http.post('/paymentReceipt', { id: transId }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            /*$scope.transDetail = response.data;*/
            var data = response.data;
            var dataProduct = JSON.parse(response.data.productinfo);
            var productinfo = [];
            angular.forEach(dataProduct, function(value, key) {
                var url = '';
                if (value.type == 'Facility') {
                    url = '/getFacilityName';
                } else if (value.type == 'Amenity') {
                    url = '/getAmenityName';
                }
                $http.post(url, { id: value.id }).success(function(Res) {
                    value.name = Res.data.name;
                    productinfo.push(value);
                });

            });
            $scope.transDetail = response.data;
            $scope.transDetail.productinfo = productinfo;
            $timeout($window.print, 0);
        }
    });
}]);

socialApp.controller('BlockIncomes', ['$scope', '$http', '$routeParams', '$route', '$window', '$timeout', '$location', 'DTOptionsBuilder', function($scope, $http, $routeParams, $route, $window, $timeout, $location, DTOptionsBuilder) {
    /**/
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.income = {
        block_id: block_id
    };

    $scope.maintain = [];
    $http.post('/maintananceListToManager', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(value, key) {
                value.enID = btoa(value.id);
                $scope.maintain.push(value);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
    $scope.clear = function() {
        var type = $scope.income.productinfo;
        if (type == null) {
            $scope.income.amount = "";
            $scope.income.maintainance_id = null;
        } else if (type == 1) {
            $scope.income.amount = "";
            $scope.income.maintainance_id = null;
        } else if (type == 2) {
            $scope.income.amount = "";
            $scope.income.maintainance_id = null;
        }

    }

    $scope.changeMainainance = function() {
        var id = $scope.income.maintainance_id;
        var type = $scope.income.productinfo;

        var url = '';
        if (type == 1) {
            url = "/amoutForPerticularmaintainanance";
        } else if (type == 2) {
            url = "/amoutForPerticularContribution"
        }
        $http.post(url, { id: id }).success(function(res) {
            if (res.hasOwnProperty('success')) {
                $scope.income.amount = res.data.amount;
            }
        });
    }
    $scope.contri = [];
    $http.post('/listContribution', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.contri = response.data;
            console.log($scope.contri.id);
        }
        $scope.$emit('UNLOAD');
    });

    $scope.incomeAddFrm = function() {
        $http.post('/paymentByResidentToManagerCashCheck', $scope.income).success(function(response) {
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $location.path('/resident-transactions/' + $routeParams.blockID)
            }, 500);
            $route.reload();
        })
    }

    $scope.totalIncome=0;
    $scope.residents = [];
    $http.post('/transactionHistoryToManager', { id: block_id }).success(function(response) {

        if (response.hasOwnProperty('success')) {
            var transaction = response.data;
            var log = [];
            var proInfo = [];
            angular.forEach(transaction, function(value, key) {
                value.enid = btoa(value.id);
                log.push(value);
                if (value.productinfo == "maintainance") {
                    value.productinfo = "maintainance";
                } else if (value.productinfo == "contribution") {
                    value.productinfo = "contribution";
                } else {
                    proInfo = (JSON.parse(value.productinfo));
                    var output = "";
                    for (var i = proInfo.length - 1; i >= 0; i--) {
                        if (proInfo[i].hasOwnProperty('type')) {
                            output += proInfo[i].type + ',';
                        }
                    }
                    value.productinfo = output;
                }



                if (value.email == '') {
                    value.email = "--";
                }
                if (value.phone == '') {
                    value.phone = "--";
                }
                if (value.transaction_status == '') {
                    value.transaction_status = "--";
                }
                if (value.discount == '') {
                    value.discount = "--";
                }
                $scope.totalIncome=$scope.totalIncome + value.amount;
            });
            $scope.transaction = log;

            $http.post('/getSimpleResidentListOfBlock', { id: block_id }).success(function(res) {
                if (res.hasOwnProperty('status') && res.status == 200) {
                    $scope.residents = res.success;
                    $scope.$emit('UNLOAD');
                } else {
                    $scope.$emit('UNLOAD');
                }

            });

        } else {
            $scope.$emit('UNLOAD');
            alert(response.error);
        }

    });
    $scope.printReceipt = function(id) {
        var transID = btoa(id);
        $window.open('#/transaction-receipt/' + transID, "popup", "width=600,height=400,left=10,top=50");
    }
}]);

socialApp.controller('Expenses', ['$scope', '$http', '$location', '$route', '$timeout', '$routeParams','DTOptionsBuilder', function($scope, $http, $location, $route, $timeout, $routeParams,DTOptionsBuilder
    ) {

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
    var block_id = atob($routeParams.blockID);
    $scope.totalExpense=0;
    $scope.expense = [];
    $scope.$emit('LOAD');
    $http.post('/displayExpenseHistoryToManager', { id: block_id }).success(function(response) {
        console.log(response.data);
        if (response.hasOwnProperty('status') && response.status == 200) {
            var expense = response.data;
            var log = [];
            angular.forEach(expense, function(value, key) {
                value.jobcard_id = (value.hasOwnProperty('resident_id')) ? value.resident_id : value.jobcard_id;
                value.job_card_type = (value.job_card_type == 1) ? 'One Time' : 'Reccuring';
                value.amount = (value.hasOwnProperty('amount')) ? value.amount : value.charge;
                $scope.totalExpense=$scope.totalExpense+value.amount;
                if (value.hasOwnProperty('payment_type')) {
                    if (value.payment_type == 1) {
                        value.pay_by = 'Cheque';
                    } else {
                        value.pay_by = 'Cash';
                    }
                } else {
                    value.pay_by = 'Pay U Money';
                }
                value.date = (value.hasOwnProperty('date')) ? value.date : value.addedon;
                value.transaction_status = (value.hasOwnProperty('transaction_status')) ? value.transaction_status : 'N/A';
                log.push(value);
            });
            $scope.expense = log;
            console.log(log);
        } else {
            alert(response.error);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);


socialApp.controller('MaintainanceResident', ['$scope', '$http', '$window', '$routeParams', '$timeout', '$crypthmac', 'sha256', '$location', 'DTOptionsBuilder', function($scope, $http, $window, $routeParams, $timeout, $crypthmac, sha256, $location, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
    $scope.resmain = [];
    var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
    var resident_id = userDetails.id;
    var SALT = '';
    var Key = '';
    var today = new Date();
    var month = today.getMonth() + 1;
    var date = today.getFullYear() + "-" + month + "-" + today.getDate();
    //$scope.payUdetail = [];
    $http.post('/payUdetailsOfSocietyByResident', { resident_id: resident_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            SALT = response.success.marchant_salt;
            Key = response.success.marchant_key;
        }
        //console.log($scope.payUdetail);
        $scope.$emit('UNLOAD');
    });
    $scope.$emit('LOAD');
    $http.post('/maintananceListToResident', { resident_id: resident_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            var resmain = response.data;
            var log = [];
            angular.forEach(resmain, function(value, key) {
                var maintanance_id = value.id;
                console.log(value.id);
                console.log(value);
                if (value.last_payment_date < date) {
                    //value.amount += value.penalty;
                    $http.post('/updatePenaltyAmount', { maintanance_id: maintanance_id }).success(function(response) {
                        console.log(response);
                    });

                }
                log.push(value);
            });
            $scope.resmain = log;
        } else {
            alert(response.error);
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });

    $scope.pay = function(id, amount, event) {

        /*Define PayuCredentials*/
        //var SALT = "yIEkykqEH3";

        var protocol = $location.protocol();
        var host = $location.host();
        var port = $location.port();

        var surl = protocol + '://' + host;
        var furl = protocol + '://' + host;

        if (host == 'localhost') {
            surl += ':' + port;
            furl += ':' + port;
        }
        surl += '/payment-success';
        furl += '/payment-fail';

        $scope.paymentDetails = {
            key: Key, //"hDkYGPQe",
            firstname: userDetails.first_name + ' ' + userDetails.last_name,
            email: userDetails.email,
            phone: userDetails.contact_no,
            surl: surl,
            furl: furl,
            udf1: resident_id,
            udf2: 0,
            udf3: id,
            amount: amount,
            productinfo: "maintainance",
            service_provider: "payu_paisa",
            txnid: sha256.convertToSHA256(randomString(5)).substring(0, 20).toLowerCase()
        };

        /*$scope.paymentDetails.txnid = ;*/

        var hashString = $scope.paymentDetails.key + '|' + $scope.paymentDetails.txnid + '|' + $scope.paymentDetails.amount + '|' + $scope.paymentDetails.productinfo + '|' + $scope.paymentDetails.firstname + '|' + $scope.paymentDetails.email + '|' + $scope.paymentDetails.udf1 + '|' + $scope.paymentDetails.udf2 + '|' + $scope.paymentDetails.udf3 + '||||||||' + SALT;
        console.log(hashString);

        $http.post('/createHash', { string: hashString }).success(function(response) {
            $scope.paymentDetails.hash = response;

        });

        setTimeout(function() {
            document.paymentFrm.submit();
        }, 3000);
    }

    function randomString(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}]);

socialApp.controller('ResList', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', function($scope, $route, $routeParams, $http, $timeout, $location) {
    var block_id = atob($routeParams.blockID);
    var maintainanceID = atob($routeParams.maintainanceID);

    $scope.reslist = [];
    $scope.list = { isSelected: false };
    $scope.$emit('LOAD');
    $http.post('/allResidentList', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    item.enc_id = btoa(item.block_id);
                    if (item.staus == 0) {
                        item.staus = "Unpaid";
                    } else {

                        item.staus = "Paid";
                    }
                    $scope.reslist.push(item);
                });
            }
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);

socialApp.controller('PaidResidents', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', 'DTOptionsBuilder', function($scope, $route, $routeParams, $http, $timeout, $location, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
    var block_id = atob($routeParams.blockID);
    var maintainanceID = atob($routeParams.maintainanceID);
    $scope.$emit('LOAD');
    $scope.reslist = [];
    $http.post('/paidResidentList', { block_id: block_id, maintanance_id: maintainanceID }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    $scope.reslist.push(item);
                });
            }
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });

}]);

socialApp.controller('UnPaidResidents', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location','DTOptionsBuilder', function($scope, $route, $routeParams, $http, $timeout, $location,DTOptionsBuilder) {
     $scope.dtOptions = DTOptionsBuilder.newOptions() 
                        .withOption('order', [1, 'desc'])
                        .withButtons([
                            'print',
                            'excel',
                            'csv',
                            'pdf'
                        ]);
    var block_id = atob($routeParams.blockID);
    var maintainanceID = atob($routeParams.maintainanceID);
    $scope.noResident = true;
    $scope.isSelected = [];

    notifiedResidents = [];

    $scope.$emit('LOAD');
    $scope.reslist = [];
    $http.post('/unpaidResidentList', { block_id: block_id, maintanance_id: maintainanceID }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    $scope.reslist.push(item);
                });
            }
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });

    $scope.selectAllRes = function() {
        if ($scope.selectAll) {
            notifiedResidents = [];
            for (var i = $scope.reslist.length - 1; i >= 0; i--) {
                $scope.isSelected[$scope.reslist[i].id] = 1;
                if (notifiedResidents.indexOf($scope.reslist[i].id) < 0) {
                    notifiedResidents.push($scope.reslist[i].id);
                }

            }

        } else {
            for (var i = $scope.reslist.length - 1; i >= 0; i--) {
                $scope.isSelected[$scope.reslist[i].id] = 0;
                notifiedResidents.splice(i, 1);
            }
        }
        if (notifiedResidents.length > 0) {
            $scope.noResident = false;
        } else {
            $scope.noResident = true;
        }
    }
    $scope.selectRes = function(res_id) {
        $scope.selectAll = false;
        if ($scope.isSelected[res_id]) {
            if (notifiedResidents.indexOf(res_id) < 0) {
                notifiedResidents.push(res_id);
            }

        } else {
            $scope.isSelected[res_id] = 0;
            var index = notifiedResidents.indexOf(res_id);
            notifiedResidents.splice(index, 1);
        }
        if (notifiedResidents.length > 0) {
            $scope.noResident = false;
        } else {
            $scope.noResident = true;
        }
    }
    $scope.sendMsg = function() {
        var data = {
            message: $scope.message,
            id: notifiedResidents
        };
        /*$http.post(url, data).success(function(response){

        });*/
    }
}]);

socialApp.controller('maintainanceManager', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', 'DTOptionsBuilder', function($scope, $route, $routeParams, $http, $timeout, $location, DTOptionsBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
    var block_id = atob($routeParams.blockID);
    $scope.maintainance = {
        block_id: block_id
    };

    var fromdate="";
    var todate="";
    $scope.errMessage = '';
    $scope.today = new Date();
    $scope.addMaintainance = function() {
        console.log($scope.maintainance);
        if($scope.maintainance.month > $scope.maintainance.year){
              $scope.errMessage = 'To Date should be greater than From date';
              $scope.errShow=true;
              return false;
        }
        else{    
        $scope.$emit('LOAD');
        $http.post('/maintainance', $scope.maintainance).success(function(response) {
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $location.path('/maintainance/' + $routeParams.blockID)
            }, 500);
            $route.reload();
        });

    }
 }
    $scope.main = [];
    $scope.$emit('LOAD');
    $http.post('/maintananceListToManager', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            angular.forEach(response.data, function(value, key) {
                value.enID = btoa(value.id);
                $scope.main.push(value);
            });
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });
}]);

socialApp.controller('Due', ['$scope', '$http', '$location', '$routeParams', '$route', '$timeout', '$crypthmac', 'sha256', function($scope, $http, $location, $routeParams, $route, $timeout, $crypthmac, sha256) {
    $scope.$emit('LOAD');
    var Salt = '';
    var Key = '';
    var block_id = atob($routeParams.blockID);
    $scope.VendorDues = [];
    $http.post('/paymentDuesFromManager', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('succes')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    item.enc_id = btoa(item.job_card_id);
                    if (item.job_card_type == 2) {
                        item.job_card_type = "Recurring";
                    } else {
                        item.job_card_type = "Onetime";
                    }
                    if (item.contract_type == 1) {
                        item.contract_type = "Periodic";
                    } else if (item.contract_type == 2) {
                        item.contract_type = "A.M.C";
                    } else if (item.contract_type == 0) {
                        item.contract_type = "Onetime";
                    }
                    Salt = item.merchant_salt;
                    Key = item.merchant_key;
                    $scope.VendorDues.push(item);
                });
            }
        }
        $scope.$emit("UNLOAD");
    });

    $scope.cashDetail = {};
    $scope.payCash = function(id, type) {

        $scope.cashDetail.type = type;
        $scope.$emit('LOAD');
        $scope.cashDetail.id = id;
        $http.post('/paymentDuesFromManagerForUpdate', { id: id }).success(function(response) {

            if (response.hasOwnProperty('success')) {
                $scope.cashDetail.jobcard_id = response.data.jobcard_id;
                $scope.cashDetail.vendor_id = response.data.vendor_id;
                $scope.cashDetail.vendor_name = response.data.vendor_name;
                $scope.cashDetail.job_card_type = response.data.job_card_type;
                $scope.cashDetail.payment_type = type;
                $scope.cashDetail.category = response.data.category;
                $scope.cashDetail.paydate = response.data.paydate;
                $scope.cashDetail.contract_type = response.data.contract_type;
                $scope.cashDetail.charge = response.data.charge;
                $scope.cashDetail.chequeno = response.data.chequeno;
                $scope.cashDetail.ifsc = response.data.ifsc;
                $scope.cashDetail.chequedate = response.data.chequedate;
                $scope.cashDetail.email = response.data.vendor_email;
                $scope.cashDetail.contact = response.data.contact;
                $scope.cashDetail.merchant_key = response.data.merchant_key;
                $scope.cashDetail.merchant_salt = response.data.merchant_salt;

                if ($scope.cashDetail.job_card_type == 1) {
                    $scope.cashDetail.job_card_type = "Onetime";
                } else if ($scope.cashDetail.job_card_type == 2) {
                    $scope.cashDetail.job_card_type = "Recurring";
                }
                if ($scope.cashDetail.contract_type == 0) {
                    $scope.cashDetail.contract_type = "One time";
                } else if ($scope.cashDetail.contract_type == 1) {
                    $scope.cashDetail.contract_type = "Periodic";
                } else if ($scope.cashDetail.contract_type == 2) {
                    $scope.cashDetail.contract_type = "A.M.C.";
                }
            }

            $scope.$emit('UNLOAD');
        });
    }

    $scope.submitPayDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/managersDueForVendor', $scope.cashDetail).success(function(response) {
            $scope.$emit('UNLOAD');
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $location.path('/expense/' + $routeParams.blockID)
            }, 500);
        });
    }



    $scope.pay = function(id, event) {

        $scope.PayDues = [];
        $scope.PayDues.id = id;
        $http.post('/paymentDuesFromManagerForSinglePay', { id: id, block_id: block_id }).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $scope.PayDues = response.data;
                $scope.noData = true;
                /*Define PayuCredentials*/
                var SALT = salt; //"yIEkykqEH3";

                var protocol = $location.protocol();
                var host = $location.host();
                var port = $location.port();

                var surl = protocol + '://' + host;
                var furl = protocol + '://' + host;

                if (host == 'localhost') {
                    surl += ':' + port;
                    furl += ':' + port;
                }
                surl += '/payment-success';
                furl += '/payment-fail';

                $scope.paymentDetails = {
                    key: Key, //"hDkYGPQe",
                    firstname: $scope.PayDues.vendor_name,
                    email: $scope.PayDues.email,
                    phone: $scope.PayDues.contact,
                    surl: surl,
                    furl: furl,
                    udf1: id,
                    udf2: 1,
                    udf3: block_id,
                    service_provider: "payu_paisa"
                };

                $scope.paymentDetails.txnid = sha256.convertToSHA256(randomString(5)).substring(0, 20).toLowerCase();
                //$scope.paymentDetails.txnid = 'ae7dc1217fe9a4994ea0';
                $scope.paymentDetails.totalPayable = $scope.PayDues.charge;

                var product = $scope.PayDues.job_card_type;
                var proDetail = JSON.stringify(product);
                $scope.paymentDetails.productinfo = proDetail;
                /*var hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10";*/

                var hashString = $scope.paymentDetails.key + '|' + $scope.paymentDetails.txnid + '|' + $scope.paymentDetails.totalPayable + '|' + $scope.paymentDetails.productinfo + '|' + $scope.paymentDetails.firstname + '|' + $scope.paymentDetails.email + '|' + id + '|' + $scope.paymentDetails.udf2 + '|' + $scope.paymentDetails.udf3 + '||||||||' + SALT;
                console.log(hashString);
                $http.post('/createHash', { string: hashString }).success(function(response) {
                    $scope.paymentDetails.hash = response;
                    console.log($scope.paymentDetails.hash)
                });

                $scope.paymentDetails.service_provider = $scope.paymentDetails.service_provider;

                /*$scope.paymentDetails.service_provider = $scope.totalPayable;
                 */
                console.log($scope.paymentDetails)
                setTimeout(function() {
                    angular.element('#paymentFrm').trigger('submit');
                }, 2000);

            }

            function randomString(length) {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }
        });
    }
}]);

/*socialApp.controller('contributions', ['$scope', function($scope) {
    $scope.contributions = [{
        key: 1
    }, {
        key: 1
    }, {
        key: 1
    }, {
        key: 1
    }, {
        key: 1
    }, {
        key: 1
    }, {
        key: 1
    }, ];
}]);
*/
socialApp.controller('adhocExpense', ['$scope','$http','$route','$timeout','$routeParams','$location','DTOptionsBuilder', function($scope,$http,$route,$timeout,$routeParams,$location,DTOptionsBuilder) {

    /**/
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [1, 'desc'])
        .withButtons([
            'print',
            'excel',
            'csv',
            'pdf'
        ]);
   var block_id = atob($routeParams.blockID);
   var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
   $scope.adhoc={
        block_id:block_id
    };

    $scope.total=0;
    $scope.adhoc_expense=[];
    $http.post('/adhocExpenseHistoryToManager').success(function(res){
        if(res.hasOwnProperty('success')){
            angular.forEach(res.data, function(value, key) {
                $scope.total=$scope.total+value.amount;
                $scope.adhoc_expense.push(value);
            });
        }
    });
    
   $scope.addAdhocExpense=function(){
        $scope.$emit('LOAD');
        console.log($scope.adhoc);
        $http.post('/paymentByManagerToAdhoc',$scope.adhoc).success(function(response){
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $location.path('/adhoc-expense/' + $routeParams.blockID)
            }, 500);
            $route.reload();
        });
    } 
}]);

socialApp.controller('defaulterList', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location','DTOptionsBuilder', function($scope, $route, $routeParams, $http, $timeout, $location,DTOptionsBuilder) {
     $scope.dtOptions = DTOptionsBuilder.newOptions() 
                        .withOption('order', [1, 'desc'])
                        .withButtons([
                            'print',
                            'excel',
                            'csv',
                            'pdf'
                        ]);
    var block_id = atob($routeParams.blockID);
    
    $scope.noResident = true;
    $scope.isSelected = [];

    notifiedResidents = [];

    $scope.$emit('LOAD');
    $scope.reslist = [];
    $http.post('/unpaidResidentList', { block_id: block_id}).success(function(response) {
        if (response.hasOwnProperty('success')) {
            if (response.hasOwnProperty('data')) {
                angular.forEach(response.data, function(item, key) {
                    $scope.reslist.push(item);
                });
            }
        }
        $timeout(function() {
            $scope.$emit('UNLOAD');
        }, 1000);
    });

    $scope.selectAllRes = function() {
        if ($scope.selectAll) {
            notifiedResidents = [];
            for (var i = $scope.reslist.length - 1; i >= 0; i--) {
                $scope.isSelected[$scope.reslist[i].id] = 1;
                if (notifiedResidents.indexOf($scope.reslist[i].id) < 0) {
                    notifiedResidents.push($scope.reslist[i].id);
                }

            }

        } else {
            for (var i = $scope.reslist.length - 1; i >= 0; i--) {
                $scope.isSelected[$scope.reslist[i].id] = 0;
                notifiedResidents.splice(i, 1);
            }
        }
        if (notifiedResidents.length > 0) {
            $scope.noResident = false;
        } else {
            $scope.noResident = true;
        }
    }
    $scope.selectRes = function(res_id) {
        $scope.selectAll = false;
        if ($scope.isSelected[res_id]) {
            if (notifiedResidents.indexOf(res_id) < 0) {
                notifiedResidents.push(res_id);
            }

        } else {
            $scope.isSelected[res_id] = 0;
            var index = notifiedResidents.indexOf(res_id);
            notifiedResidents.splice(index, 1);
        }
        if (notifiedResidents.length > 0) {
            $scope.noResident = false;
        } else {
            $scope.noResident = true;
        }
    }
    $scope.sendMsg = function() {
        var data = {
            message: $scope.message,
            id: notifiedResidents
        };
        /*$http.post(url, data).success(function(response){

        });*/
    }
}]);