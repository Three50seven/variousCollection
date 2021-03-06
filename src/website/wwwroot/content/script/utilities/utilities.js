﻿var UTILITIES = {
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
    testNameCombos: function (){
        let animals = MODULES.DataSets.ANIMALS;
        let adjectives = MODULES.DataSets.ADJECTIVES;
        let i = 0;

        adjectives.forEach(function (a1) {
            animals.forEach(function (a2) {
                i += 1;
                console.log(i + ": " + a1 + " " + a2);
            });
        });
    }
};