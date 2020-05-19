var NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');


module.exports = NodeHelper.create({

    config: Object.create(null),

    // Override start method.
    start: function() {
        console.log("Starting node helper for: " + this.name);
        return;
    },

    // Override socketNotificationReceived method.
    socketNotificationReceived: function (notification, payload) {
        this.log("Socket Notification received. Payload: " + payload);
        if (notification == "LOTTERY_REQUEST") {
            this.config = payload;
            var self = this;
            this.getData();
            setInterval(function() {
                self.getData();
            }, payload.updateInterval);
        }
    },

    getData: function() {
        var self = this;
        var game = this.config.games[0].game.toLowerCase();
        var url = this.config.apiBase + "?api_key="+ this.config.apiKey + "&game=" + game;
        this.log("Call url: " + url);
        request( {url: url, method: 'GET'}, function(error, response, body) {
            self.processData(game, error, response, body);
        });
    },

    processData: function(game, error, response, body) {
        // First handle server side errors
        if (error) {
            console.error(error);
            this.sendSocketNotification("ERROR", {
                error: "Error ",
            })
        } else if (response.statusCode != 200) {
            console.error(body);
            this.sendSocketNotification("ERROR", {
                error: body,
            });
        } else {
            var results = JSON.parse(body);
            if (results.error == "303") {
                console.error("API Quota exceeded! Using Dummy values!")
                results = {
                    error: "303",
                    draw: "18.05.2020",
                    results: "6, 10, 23, 25, 37, 45"
                }
            }
            results.results = results.results.split(",");
            results.results = results.results.map(Number);
            this.log(results);
            this.sendSocketNotification('LOTTERY_DATA', { 
                game: game, 
                result: results
            });
        }
    },

    log: function (msg) {
        if (this.config && this.config.debug) {
            console.log(this.name + ": ", (msg));
        }
    }

});
