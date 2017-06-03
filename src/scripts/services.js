'use strict';

angular.module('irontec.simpleChat')
    .constant("baseURL", "http://localhost/opensource/symfony/web/")
    .constant("userName", "testApp")
    .constant("password", "testPass")
    .service('authFactory', ['$http', 'baseURL', 'userName', 'password', function ($http, baseURL, userName, password) {


        this.getToken = function () {
            return $http({
                method: 'POST',
                url: baseURL + 'oauth/issueToken',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: "grant_type=client_credentials&client_id="+ userName+ "&client_secret=" +password
            });

        };

        this.userLogin = function (token, n, p) {  
            var xsrf = $.param({"username": n, "password": p});          
            return $http({
                method: 'POST',
                url: baseURL + 'api/v1/login',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Bearer ' + token },                
                data: xsrf
            });
        };

    }]);