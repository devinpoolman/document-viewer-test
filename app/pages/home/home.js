'use strict';

angular.module('doctestApp')
  .controller('HomeCtrl', function ($scope, DocumentsRepository, $window, $filter) {

    $scope.documents = [];

    DocumentsRepository.listAll().then(function(documents) {
      $scope.documents = documents;
    });
    
    $scope.open = function(url) {
      $window.open($filter('urlToLocal')(url), '_blank', 'EnableViewPortScale=yes');
    };

    $scope.awesomeThings = [
      'AngularJS',
      'Bootstrap',
      'SASS',
      'Font Awesome',
      'Animate.css',
      'Cordova',
      'Grunt',
      'Karma'
    ];
  });
