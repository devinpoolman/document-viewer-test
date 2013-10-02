define([
    'angular',
    'service/database',
    'appglu',
    'databaseConfig'
], function (a, database, AppGlu, dbConfig) {
    var app = angular.module('app', ['ngMobile','ui.bootstrap','iscroll']);
    var db = dbConfig.openDatabase();

    var appGluInstance = AppGlu({
        applicationKey: 'cHRV64ri0SyYVwr',
        applicationSecret: 'OaSanPJyDPbI0isihRsEijO7ZMYSN8',
        applicationEnvironment: 'production',
        enableDebugger: true
    });

    var syncApi = false;

    app.provider('AppGlu', function () { 
        var provider = {};

        provider.$get = function () { return appGluInstance; };

        return provider;
    });

    app.provider('AppGluSyncApi', function() {
        var provider = {};

        provider.$get = function($rootScope,$timeout) {
            
            if (syncApi === false) {
                syncApi = appGluInstance.getSyncApi({
                    'db': db,
                    syncFiles: true
                });

                $rootScope.appGluSyncStatus = {
                    active: false,
                    hasUpdateDownloaded: false,
                    title: 'No Update Available',
                    status: 'Your app is up-to-date',
                   progressPercent: 100
                };

                syncApi.doSync = function() {
                    if ($rootScope.appGluSyncStatus.active) {
                        return;
                    }

                    $timeout(function() {
                        $rootScope.appGluSyncStatus.active = true;
                        $rootScope.appGluSyncStatus.title = 'Updating App';
                        $rootScope.appGluSyncStatus.status = 'Downloading latest changes...';
                        $rootScope.appGluSyncStatus.progressPercent = 100;
                    });

                    syncApi.syncDatabase(function() {
                        $timeout(function() {
                            $rootScope.appGluSyncStatus.lastSyncDate = new Date(new Date(syncApi.lastTimeSynchronized()));
                            $rootScope.appGluSyncStatus.lastCheckDate = new Date(new Date(syncApi.lastTimeCheckedForChanges()));
                            $rootScope.appGluSyncStatus.active = false;
                            $rootScope.appGluSyncStatus.title = 'Update Complete';
                            $rootScope.appGluSyncStatus.status = 'You are now up to date';
                            $rootScope.appGluSyncStatus.hasUpdateDownloaded = false;
                            $rootScope.$broadcast('appgluSyncCompleted');
                        });
                    });
                };

                syncApi.downloadUpdates = function(auto) {
                    if ($rootScope.appGluSyncStatus.active || $rootScope.appGluSyncStatus.hasUpdateDownloaded) {
                        return;
                    }

                    if (!auto) {
                        $timeout(function() {
                            $rootScope.appGluSyncStatus.title = 'Checking for Updates';
                            $rootScope.appGluSyncStatus.status = 'Checking for latest changes now...';                            
                        });
                    }
                    syncApi.checkIfDatabaseHasChanges(function(hasChanges) {
                        $timeout(function() {
                            if (hasChanges) {
                                $rootScope.appGluSyncStatus.title = 'Downloading Update';
                                $rootScope.appGluSyncStatus.status = 'Downloading latest changes now...';
                                $rootScope.appGluSyncStatus.lastSyncDate = new Date(new Date(syncApi.lastTimeSynchronized()));
                                $rootScope.appGluSyncStatus.lastCheckDate = new Date(syncApi.lastTimeCheckedForChanges());
                                syncApi.downloadChanges(function(downloaded) {
                                    $timeout(function() {
                                        $rootScope.appGluSyncStatus.lastSyncDate = new Date(syncApi.lastTimeSynchronized());
                                        $rootScope.appGluSyncStatus.lastCheckDate = new Date(syncApi.lastTimeCheckedForChanges());
                                        if (downloaded) {
                                            $rootScope.appGluSyncStatus.title = 'Update Pending';
                                            $rootScope.appGluSyncStatus.status = 'Update ready to be applied';
                                            $rootScope.appGluSyncStatus.hasUpdateDownloaded = true;
                                        } else {
                                            $rootScope.appGluSyncStatus.title = 'Update Download Error';
                                            $rootScope.appGluSyncStatus.status = 'Unable to download update';
                                        }                                        
                                    })
                                });
                            } else {
                                $rootScope.appGluSyncStatus.lastSyncDate = new Date(syncApi.lastTimeSynchronized());
                                $rootScope.appGluSyncStatus.lastCheckDate = new Date(syncApi.lastTimeCheckedForChanges());
                                $rootScope.appGluSyncStatus.title = 'No Update Available';
                                $rootScope.appGluSyncStatus.status = 'Your app is up-to-date';
                            }
                        });
                    });
                };

                syncApi.applyUpdate = function() {
                    if ($rootScope.appGluSyncStatus.active || !$rootScope.appGluSyncStatus.hasUpdateDownloaded) {
                        return;
                    }
                    $timeout(function() {
                        $rootScope.appGluSyncStatus.active = true;
                        $rootScope.appGluSyncStatus.title = 'Applying Update';
                        $rootScope.appGluSyncStatus.status = 'Applying latest app changes now...';
                        syncApi.applyChanges(function(result) {
                            $timeout(function() {
                                $rootScope.appGluSyncStatus.active = false;
                                $rootScope.appGluSyncStatus.lastSyncDate = new Date(syncApi.lastTimeSynchronized());
                                $rootScope.appGluSyncStatus.lastCheckDate = new Date(syncApi.lastTimeCheckedForChanges());
                                if (_.isUndefined(result) || result) {
                                    $rootScope.appGluSyncStatus.title = 'No Update Available';
                                    $rootScope.appGluSyncStatus.status = 'Your app is up-to-date';
                                    $rootScope.appGluSyncStatus.hasUpdateDownloaded = false;
                                } else {
                                    $rootScope.appGluSyncStatus.title = 'Update Error';
                                    $rootScope.appGluSyncStatus.status = 'Unable to apply latest changes';
                                }
                                $rootScope.$broadcast('appgluSyncCompleted');
                            });
                        });
                    });
                };
                
                syncApi.doCheckForExisting = function (callback) {

                    syncApi.hasDownloadedChanges(function(hasChanges) {
                        $timeout( function() {
                            if (hasChanges) {
                                $rootScope.appGluSyncStatus.title = 'Update Pending';
                                $rootScope.appGluSyncStatus.status = 'Update ready to be applied';
                                $rootScope.appGluSyncStatus.hasUpdateDownloaded = true;                            
                            } else {
                                $rootScope.appGluSyncStatus.title = 'No Update Available';
                                $rootScope.appGluSyncStatus.status = 'Your app is up-to-date';
                                $rootScope.appGluSyncStatus.hasUpdateDownloaded = false;
                            }
                            
                            if (callback && typeof(callback) === "function") {
                                callback(hasChanges);
                            };
                        });
                    });

                }

                syncApi.autoUpdateInterval = setInterval(function(){
                    syncApi.downloadUpdates(true);
                },10*60*1000);
            }

            return syncApi;
        }

        return provider;
    });

    app.controller('AppCtrl',['$rootScope','$location','$timeout',function($rootScope,$location,$timeout) {

        // make sure we are doing the :active thing on Android
        document.addEventListener("touchstart", function(){}, true);

        $rootScope.animationDirection = 'none';
        $rootScope.backRequestCount = 0;
        $rootScope.backCount = 0;
        $rootScope.backDiff = 0;
        $rootScope.init = false;

        $rootScope.go = function(url) {

            //this this if you want to change the URL and add it to the history stack
            $timeout(function() {
                $location.path(url);    
            });
        
        };

        $rootScope.goBack = function() {
            $rootScope.animationDirection = 'reverse-animation';
            if (window.history.length > 1) {
                $rootScope.backRequestCount++;
                window.history.back();
            } else {
                $rootScope.backDiff++;
            }
        };

        $rootScope.doAlert = function(message, alertCallback, title, buttonName) {
            if (!_.isUndefined(navigator.notification)) {
                navigator.notification.alert(message, alertCallback, title, buttonName)
            } else {
                alert(message);
                if (alertCallback && typeof(alertCallback) === "function") {
                    alertCallback();
                }
            }
        };

        $rootScope.$on('$routeChangeStart', function(event, routeData){
            var tt = new Date().getTime();
            console.log(['$routeChangeStart',tt-window.lastUp,tt]);
            if ($rootScope.animationDirection == 'reverse-animation' && $rootScope.backRequestCount > $rootScope.backCount) {
                $rootScope.backCount++;
            } else if ($rootScope.animationDirection == 'none') {
                $rootScope.animationDirection = 'first-animation';
                if (navigator.splashscreen) {
                    $timeout(function() {
                        navigator.splashscreen.hide();    
                    },2300);
                }
            } else {
                $rootScope.backDiff = 0;
                $rootScope.animationDirection = 'forward-animation';    
            }
        });

        $rootScope.$on('$viewContentLoaded', function(event, b) {
            var tt = new Date().getTime();
            console.log(['$viewContentLoaded',tt-window.lastUp,tt]);
        });
        $rootScope.$on('$routeChangeSuccess', function(event, b) {
            var tt = new Date().getTime();
            console.log(['$routeChangeSuccess',tt-window.lastUp,tt]);
        });

        $rootScope.$on('ngRepeatDone', function(event, b) {
            var tt = new Date().getTime();
            console.log(['ngRepeatDone',tt-window.lastUp,tt]);
        });

        $rootScope.$on('ng-click', function(event, b) {
            var tt = new Date().getTime();
            console.log(['ng-click',tt-window.lastUp,tt]);
        });
        $rootScope.$on('ngClick', function(event, b) {
            var tt = new Date().getTime();
            console.log(['ng-click',tt-window.lastUp,tt]);
        });

    }]);

    return app;
});
