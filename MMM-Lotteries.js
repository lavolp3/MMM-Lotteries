
/* global Module */

/* Magic Mirror
 * Module: MMM-LotteryResults
 * By lavolp3
 */

Module.register("MMM-Lotteries",{
    // Default module config.
    defaults: {
        apiBase: "https://www.magayo.com/api/results.php",
        apiKey: "",
        games: [
            {
                game: "euromillions",
                tickets: [ 
                    [1, 5, 6, 10, 16, 17],
                    [2, 8, 20, 22, 28, 45],
                    [2, 8, 16, 23, 37, 50]
                ],
            }
        ],
        updateInterval: 5 * 24 * 60 * 60 * 1000,
        debug: false
    },


    start: function() {
        console.log("Starting module: " + this.name);
        this.loaded = false;
        this.sendSocketNotification("LOTTERY_REQUEST", this.config);
        this.games = this.config.games;
    },


    // Define required styles.
    getStyles: function() {
        return [this.file("MMM-Lotteries.css")];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            nl: "translations/nl.json",
            de: "translations/de.json"
        };
    },

    socketNotificationReceived: function(notification, payload) {
        this.log("Socket Notification received: " + notification);
        console.log(payload);
        if (notification === "LOTTERY_DATA") {
            var index = this.games.findIndex(el => { return el.game === payload.game });
            this.games[index].result = payload.result
            this.log("Games: " + JSON.stringify(this.games));
            //if (this.results.length > 0) { this.loaded = true; };
            this.loaded = true;
            this.updateDom();
        }
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "lottery-wrapper";
        
        if (!this.loaded) {
            wrapper.innerHTML = "Loading numbers...";
        } else {
            for (var g = 0; g < this.games.length; g++) {
                var game = this.games[g];
                var resWrapper = document.createElement("div");
                resWrapper.className = "numbers-wrapper small";
                    var numWrapperHeader = document.createElement("span")
                    numWrapperHeader.innerHTML = game.game;
                resWrapper.appendChild(numWrapperHeader);
                    var results = document.createElement("div");
                    results.className = "numbers-ticket";
                    results.innerHTML = "Drawing date: " + game.result.draw + ":\n"; 
                    var numLine = document.createElement("div");
                    numLine.className = "numbers-line";
                    for (var i = 0; i < game.result.results.length; i++) {
                        var number = document.createElement("div");
                        number.className = "number";
                        number.innerHTML = game.result.results[i];
                        numLine.appendChild(number);
                    }
                    results.appendChild(numLine);
                resWrapper.appendChild(results);
            wrapper.appendChild(resWrapper);
                var ticketWrapper = document.createElement("div");
                ticketWrapper.className = "numbers-wrapper small";
                    var ticketWrapperHeader = document.createElement("span")
                    ticketWrapperHeader.innerHTML = game.game;
                    ticketWrapperHeader.innerHTML = "Tickets: "
                ticketWrapper.appendChild(ticketWrapperHeader);
                    var ticketLines = document.createElement("div");
                    ticketLines.className = "numbers-ticket";
                    for (var n = 0; n < game.tickets.length; n++) {
                        var numLine = document.createElement("div");
                        numLine.className = "numbers-line";
                        for (var i = 0; i < game.tickets[n].length; i++) {
                            var number = document.createElement("div");
                            number.className = "number";
                            number.innerHTML = game.tickets[n][i];
                            var hit = (game.result.results.includes(game.tickets[n][i])) ? "hit" : "no-hit";
                            number.classList.add(hit);
                            numLine.appendChild(number);
                        }
                        ticketLines.appendChild(numLine);
                    }
                ticketWrapper.appendChild(ticketLines);
            }
            wrapper.appendChild(ticketWrapper);            
        }
        return wrapper;
    },

    
    log: function (msg) {
        if (this.config && this.config.debug) {
            console.log(this.name + ": ", (msg));
        }
    }
});
