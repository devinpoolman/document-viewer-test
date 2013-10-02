// Configuration settings that can be easily injected in your app
angular.module('doctestApp').constant(
  "config", {
    "app": {
        "name": "doctest",
        "displayName": "Doctest",
        "version":"1.0.0"
    },
    "modules": {
        "db": {
            "name": "Doctest",
            "version": "1.0",
            "description": "doctestApp Description",
            "size":   1 * 1024 * 1024
        },
        "appglu": {
            "applicationKey": "1djYoirO4IX5JMU",
            "applicationSecret": "7agEwBMWJ82Z4sRr182gPcYWBrwUeL",
            "applicationEnvironment": "production",
            "enableDebugger": true,
            "syncFiles": true,
            "autoUpdate": true,
            "autoUpdateInterval": 10*60*1000 // 10 minutes
        }
    },
    "template": {
        "splashScreen": "/resources/images/splashScreen.jpg",  //{type="spashscreen"}
        "aboutImage": "/resources/images/sample.jpg",  //{type=image,width=128,height=128}
        "backButtonIcon": "icon-chevron-left", //{type="fontawesome"}
        "toolbarVariation": "dark", //{type="variation", variations=[{name="dark",screenshot="dark.png"},{name="light",screenshot="light.png"]}
        "leftPanel": {
            "leftPanelEnabled": true, //boolean
            "leftPanelTitle": "Settings",
            "leftPanelIcon": "icon-reorder", //fontawesome
            "leftPanelVariation": "dark" //{type="variation", variations=[{name="dark",screenshot="dark.png"},{name="light",screenshot="light.png"]}
        },
        "rightPanel": {
            "rightPanelEnabled": true, //boolean
            "rightPanelTitle": "About",   
            "rightPanelIcon": "icon-info" //fontawesome   
        }
    }
  }
)
// Add these configuration settings to the $rootScope for easy binding
.run(function($rootScope,config) {
    $rootScope.config = config;
});