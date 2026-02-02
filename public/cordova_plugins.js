
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-printer.Printer",
          "file": "plugins/cordova-plugin-printer/www/printer.js",
          "pluginId": "cordova-plugin-printer",
        "clobbers": [
          "cordova.plugins.printer"
        ]
        },
      {
          "id": "cordova-plugin-x-socialsharing.SocialSharing",
          "file": "plugins/cordova-plugin-x-socialsharing/www/SocialSharing.js",
          "pluginId": "cordova-plugin-x-socialsharing",
        "clobbers": [
          "window.plugins.socialsharing"
        ]
        },
      {
          "id": "es6-promise-plugin.Promise",
          "file": "plugins/es6-promise-plugin/www/promise.js",
          "pluginId": "es6-promise-plugin",
        "runs": true
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-printer": "0.8.0",
      "cordova-plugin-x-socialsharing": "6.0.4",
      "es6-promise-plugin": "4.2.2"
    };
    // BOTTOM OF METADATA
    });
    