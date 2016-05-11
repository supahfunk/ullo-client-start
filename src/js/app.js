﻿/*global angular,FB */

var app = angular.module('ullo', ['ngRoute']);

// config parte prima degli altri, ma abbiamo solo alcune dipendenze qua (i provider)
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    $routeProvider.when('/', {     
       controller: 'TestCtrl',
       templateUrl: 'templates/test.html',
       title: 'HomePage!'      
    }).when('/stream', {     
       controller: 'TestCtrl',
       templateUrl: 'templates/test.html',
       title: 'parametro definito da me'      
    }).when('/dishes/:dishId', {     
        controller: 'TestCtrl',
        templateUrl: 'templates/test.html',
        title: 'Dishes'
    }).when('/signin', {
        controller: 'SignInCtrl',
        templateUrl: 'templates/signin-test.html',
        title: 'Sign In'
    }).when('/404', {
       controller: 'TestCtrl',
       templateUrl: 'templates/test.html',
       title: 'Pagina non trovata!'      
    });
    
    $routeProvider.otherwise('/404');
    
    $locationProvider.html5Mode(true);
    
}]);


app.controller('SignInCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.model = {};

    $scope.signin = function () {

        $scope.busy = true;

        $http.post('http://ulloapi.wslabs.it/api/users', $scope.model).then(function (success) {
            console.log('signin', success);
        }, function (error) {
            console.log('error', error);
        }).finally(function () {
            $timeout(function () {
                $scope.busy = false;
            }, 1000);

        });


    };

}]);


app.controller('TestCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.model = {
        label: 'Carica',
    };
    
    $timeout(function() {
        $scope.model.label = 'Carica Stream';
    }, 1000);

    $scope.item = {
        id: 117,
        user: {
            userName: 'Fabio Ottaviani',
            facebookId: '10153341954226947',
            route: 'fabio-ottaviani'
        },
        dish: {
            price: 5,
            isVeganFriendly: false,
            yes: 1,
            no: 0,
            created: '2016-04-27T19:13:45.497',
            vote: {
                dishId: 19,
                like: true,
                created: '2016-04-27T19:14:00.497'
            },
            categories: [
                {
                    id: 2,
                    name: 'Piadine',
                    key: 'piadine'
                }
            ],
            id: 19,
            name: 'Pizza Margherita',
            key: 'pizzaMargherita'
        },
        picture: {
            guid: '8fe99743-4ed3-46de-ba13-2c1bd7a45ffe',
            created: '2016-04-27T19:13:41.02',
            id: 20,
            name: '8fe99743-4ed3-46de-ba13-2c1bd7a45ffe',
            route: '/Media/Files/8fe99743-4ed3-46de-ba13-2c1bd7a45ffe.jpg',
            key: '8Fe997434Ed346DeBa132C1bd7a45ffe'
        },
        created: '2016-04-27T19:13:45.497'
    };
    
    $scope.loadStream = function() {
        $http.get('http://ulloapi.wslabs.it/api/stream/anonymous').then(function(success){
            $scope.items = success.data;
        }, function(error) {
            console.log('error', error);
        });
    };

}]);

