/*CKEDITOR GET DATA*/

socialApp.service('CkGetData', ['$http', function ($http) {
    this.getResponse = function(name){
       var DATA = CKEDITOR.instances[name].getData()
       return DATA;
    }
}]);