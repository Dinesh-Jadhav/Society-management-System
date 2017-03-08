/*Select2*/
socialApp.directive("select2",function($timeout,$parse){
    return {
        restrict: 'AC',
        link: function(scope, element, attrs) {
            

            $timeout(function() {
                $(element).select2({
                	placeholder: "Select Option"
                });
            },200);
        }
    };
});

/*Datepicker*/
socialApp.directive("datepicker", function () {
    return {
        restrict: "A",
        link: function (scope, el, attr) {
            var minDate = el.data('mindate');
            var maxDate = el.data('maxdate');
            var option = {
                dateFormat: 'yy-mm-dd'
            }

            if (angular.isDefined(minDate)) {
                option.minDate = minDate;
            }
            if (angular.isDefined(maxDate)) {
                option.maxDate = maxDate;
            }

            el.datepicker(option);
        }
    };
});

/*Timerpicker*/
socialApp.directive("timepicker", function () {
    return {
        restrict: "A",
        link: function (scope, el, attr) {
            el.timepicker({
                showSecond:false,
                showMillisec:false,
                showMicrosec:false,
                showTimezone:false
            });
        }
    };
});

/*DateTimepicker*/
socialApp.directive("datetimepicker", function () {
    return {
        restrict: "A",
        link: function (scope, el, attr) {
            el.datetimepicker({
                showSecond:false,
                showMillisec:false,
                showMicrosec:false,
                showTimezone:false,
                minDate: new Date()
            });
        }
    };
});

/*CKEDITOR*/
socialApp.directive("ckeditor", function () {
    return {
        restrict: "A",
        link: function (scope, el, attr) {
            var name = el.attr('name');
            CKEDITOR.replace(name);
        }
    };
});

/*Full Calendar*/
socialApp.directive("fullcalendar", function () {
    return {
        restrict: "A",
        link: function (scope, el, attr) {
            var $actDate = el.data('activadate');
            console.log($actDate)
            el.fullCalendar({
                defaultView: 'month'
            });

        }
    };
});
