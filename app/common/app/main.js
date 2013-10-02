'use strict';

angular.module('doctestApp', ['ngRoute','ngTouch', 'appglu-angular', 'appglu.ace-toolbar', 'appglu.ace-slide-panels', 'ui.bootstrap'])
  .config(function() {
    // add platform specific body css as needed
    if (!_.isEmpty(window.device) && !_.isEmpty(window.device.platform)) {
        if (window.device.platform == 'iOS' && !_.isEmpty(window.device.version) && parseFloat(window.device.version) >= 7.0) {
            document.documentElement.className += ' ios-fullscreen';
      }
    } 
  })
  .config(function ($compileProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|local|filesystem):/);
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl'
      })
      .when('/home', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function (appgluProvider,config) {
    appgluProvider.init({
        applicationKey: config.modules.appglu.applicationKey,
        applicationSecret: config.modules.appglu.applicationSecret,
        applicationEnvironment: config.modules.appglu.applicationEnvironment,
        enableDebugger: config.modules.appglu.enableDebugger,
        syncFiles: config.modules.appglu.syncFiles,
        db: config.modules.db
    });
  })
  .config(function(config) {
    persistence.store.websql.config(persistence, config.modules.db.name, config.modules.db.description, config.modules.db.size);

    // @TODO: should init all the repos so the tables are there before we run sync

  })
  .run(function (appgluSync,config) {

    if (true || appgluSync.status.lastTimeSynchronized == null) { // never synchronized

      appgluSync.syncDatabase();

    } else {
      
      appgluSync.hasDownloadedChanges(function(hasChanges) {
        
        if (config.modules.appglu.autoUpdate && hasChanges) {

          appgluSync.applyChanges(); // automatically apply downloaded changes

        }
      });
    }

    if (config.modules.appglu.autoUpdate) {
      appgluSync.autoCheck(config.modules.appglu.autoUpdateInterval, function() {
        appgluSync.downloadChanges();
      });  
    }

  });