var UTILITIES = {
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    getNumberWithEnding: function (number) {
        //just return 0 if anything less than 1 is passed in
        if (number <= 0)
            return 0;
        //get the 'th' numbers first since this covers the majority:
        if (number % 100 === 10 || number % 100 === 11 || number % 100 === 12 || number % 100 === 13
            || number % 10 === 4 || number % 10 === 5 || number % 10 === 6 || number % 10 === 7
            || number % 10 === 8 || number % 10 === 9 || number % 10 === 0)
            return number.toString() + 'th';
        if (number % 10 === 1)
            return number.toString() + 'st';
        if (number % 10 === 2)
            return number.toString() + 'nd';
        if (number % 10 === 3)
            return number.toString() + 'rd';
    },
    //note, only works for minutes/seconds as of writing of function and needs at the time
    getTimeDisplay: function (timeSeconds) {
        console.log('timeSeconds: %s', timeSeconds);
        if (timeSeconds > 0) {
            var minutes = Math.floor(timeSeconds / 60);
            var seconds = timeSeconds - minutes * 60;
            return this.strPadLeft(minutes, '0', 2) + ':' + this.strPadLeft(seconds, '0', 2);
        }
        else {
            return '00:00';
        }
    },
    strPadLeft: function (string, pad, length) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    },
    titleCase: function (str) {
        let splitStr = '';

        if (str) {
            splitStr = str.toLowerCase().split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                // You do not need to check if i is larger than splitStr length, as your for does that for you
                // Assign it back to the array
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
            }
            splitStr = splitStr.join(' ');
        }
        // Directly return the joined string
        return splitStr;
    },
    splitCamelCase: function (str) {
        if (str)
            return str.replace(/([A-Z]+)/g, "$1").replace(/([A-Z][a-z])/g, " $1"); //split on capital letters first (camel case strings) , e.g. thisString = this String       
        else
            return '';
    },
    splitAndTitleCase: function (str) {
        return this.titleCase(UTILITIES.splitCamelCase(str));
    },
    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    getRandomElement: function (list) {
        var i = this.getRandomInt(0, list.length - 1);
        return list[i];
    },
    getRandomAnimal: function (useTitleCase) {
        let animals = MODULES.DataSets.ANIMALS;

        let animal = this.getRandomElement(animals);

        return useTitleCase ? this.titleCase(animal) : animal;
    },
    getRandomAnimalWithAdjective: function (useTitleCase) {
        let adjectives = MODULES.DataSets.ADJECTIVES;

        let name = this.getRandomElement(adjectives) + ' ' + this.getRandomAnimal(useTitleCase);

        return useTitleCase ? this.titleCase(name) : name;
    },
    getRandomHorseName: function (useTitleCase) {
        let derbyWinners = MODULES.DataSets.DERBY_WINNERS;

        let name = this.getRandomElement(derbyWinners); //TODO: eventually we'll just pull a random noun adjective, etc. and make up the horse names'

        return useTitleCase ? this.titleCase(name) : name;
    },
    testNameCombos: function () {
        let animals = MODULES.DataSets.ANIMALS;
        let adjectives = MODULES.DataSets.ADJECTIVES;
        let i = 0;

        adjectives.forEach(function (a1) {
            animals.forEach(function (a2) {
                i += 1;
                console.log(i + ": " + a1 + " " + a2);
            });
        });
    },
    ElementRevolver = (function () {
        /**references:
         * https://stackoverflow.com/questions/69712325/move-elements-around-semicircle-orbit-div-around-parent
         * https://stackoverflow.com/questions/10990942/moving-a-div-along-a-circular-path-using-html-javascript-css
         * http://jsfiddle.net/nN7ct/
         * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion
         * */
        function getPosition(settings, ellapsedTime) {
            let angle = getAngle(settings, ellapsedTime);
            return {
                x: Math.round(settings.center.x + settings.radius * Math.cos(angle)) + 2,
                y: Math.round(settings.center.y + settings.radius * Math.sin(angle)) + 2
            };
        }

        function getAngle(settings, ellapsedTime) {
            return ellapsedTime / settings.interval * 2 * Math.PI * settings.direction - settings.startPositionRad;
        }        

        function start(id, settings) {
            
            let el = document.getElementById(id),
                startTime = (new Date()).getTime(),
                width = el.offsetWidth,
                height = el.offsetHeight;

            if (el["#rev:tm"] !== null) stop(id);
            el.style.position = settings.cssPosition || "absolute";
            if (!settings.startPositionRad) settings.startPositionRad = settings.startPositionDeg / 180 * Math.PI;
            el["#rev:tm"] = setInterval(function () {
                let pos = getPosition(settings, (new Date()).getTime() - startTime);
                el.style.left = (pos.x - Math.round(width / 2)) + "px";
                el.style.top = (pos.y - Math.round(height / 2)) + "px";               
            }, settings.updateInterval);
            if (settings.iterations > -1) setTimeout(function () {
                stop(id);
            }, settings.iterations * settings.interval);
        }

        function stop(id) {
            let el = document.getElementById(id);
            if (el["#rev:tm"] === null) return;
            clearInterval(el["#rev:tm"]);
            el["#rev:tm"] = null;
        }

        return {
            start: start,
            stop: stop
        };

    })(),
    OrbitAnimation = (function () {        
        /*reference: https://www.the-art-of-web.com/javascript/animate-curved-path/            
            Original JavaScript code by Chirp Internet: www.chirpinternet.eu
            Please acknowledge use of this code by including this header.
            Custom edits of: https://potatodie.nl/diffuse-write-ups/move-a-dot-along-a-path/ => https://github.com/potatoDie/move-dot
            //SVG Editor: https://yqnn.github.io/svg-path-editor/?ref=awesomeindie.com
            https://jsfiddle.net/vjhzysr9/
            https://jsfiddle.net/56pbc4Ly/
            https://jsfiddle.net/8pjaqc7g/2/
            https://jsfiddle.net/3gd75kLs/2/
        */
        function orbit(id, settings) {
            // Get the div
            var div = document.getElementById(id);

            // Get the current position of the div
            var x = div.style.left;
            var y = div.style.top;

            // Calculate the new position of the div
            var newX = x + settings.speed * Math.cos(settings.direction * Math.PI / 180);
            var newY = y + settings.speed * Math.sin(settings.direction * Math.PI / 180);

            // Set the new position of the div
            div.style.left = newX + "px";
            div.style.top = newY + "px";

            // If the div has reached the stop position, then stop the animation
            if (newX === settings.stopPosition && newY === settings.stopPosition) {
                return;
            }

            // Call the function again after a delay
            window.setTimeout(orbit, 1000 / 60); // 60 frames per second
        }       

        return {
            orbit: orbit
        };
    })()
};