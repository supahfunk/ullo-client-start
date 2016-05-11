﻿/*global angular,FB */

var LESSON = true;
var CONFIG = {
    CLIENT: window.location.href.indexOf('http://ulloclient.wslabs.it') === 0 ? 'http://ulloclient.wslabs.it' : 'http://dev.ullowebapp:8081',
    API: (LESSON || window.location.href.indexOf('http://ulloclient.wslabs.it') === 0) ? 'http://ulloapi.wslabs.it' : 'https://localhost:44302',
    FACEBOOK_APP_ID: window.location.href.indexOf('http://ulloclient.wslabs.it') === 0 ? '1054303094614120' : '1062564893787940',
    assetTypeEnum: {
        Unknown: 0,
        Picture: 1,
    },
    IOS: (navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false),
};

var app = angular.module('ullo', []);

app.controller('textCtrl', ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
    
    var apiUrl = 'http://ulloapi.wslabs.it';
    
    $scope.titolo = 'titolo';
    
    $timeout(function(){
        $scope.titolo = 'titolone';
    }, 2000);
    
    $http.get(apiUrl + '/api/stream/anonymous').then(function(response){
        console.log(response);
        
        $scope.items = response.data;
    }, function(error){
        
    });
    
    
    
}]);