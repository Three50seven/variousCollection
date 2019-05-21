// Create date: JAN-28-2017
// Author: 		Paul Krimm
// Notes:		Source for Easter date algorithm - http://www.whydomath.org/Reading_Room_Material/ian_stewart/2000_03.html
// Updates: 	SEP-11-2018 - Added calculations for Christmas dates and other easter dates
//				SEP-13-2018 - Added calculations for days after pentecost, and buttons to increment/decrement year; fixed bugs; refactored
(function ($) {
    const MIN_YEAR = 100;
    const MAX_YEAR = 99999;
    var self = this;    
    var currentYear = new Date().getFullYear(); //default to current year

    self.easterDate = null;
    self.liturgicalDates = ko.observableArray([]);
    self.yearToCalculate = ko.observable(currentYear);
    self.errors = ko.observable("");

    self.prevYear = function () {
        let year = self.yearToCalculate();

        if (UTILITIES.isNumber(year))
            self.yearToCalculate(parseFloat(year) - 1);

        self.getLiturgicalYear();
    };

    self.nextYear = function () {
        let year = self.yearToCalculate();

        if (UTILITIES.isNumber(year))
            self.yearToCalculate(parseFloat(year) + 1);

        self.getLiturgicalYear();
    };

    self.getLiturgicalYear = function () {
        clearForm();

        if (isValid()) {
            var currentVal = parseFloat(self.yearToCalculate()); // Read the user input

            getEasterSeasonDates(currentVal);
            getNumberOfSundaysAfterPentecost(self.easterDate);
            getChristmasSeasonDates(currentVal);
            //now get dates for next year since Liturgical year carries over into civil year
            currentVal = parseFloat(currentVal + 1);
            getEasterSeasonDates(currentVal);

            console.log(self.liturgicalDates());

            var sortDirection = 'desc';
            sortCalendar(sortDirection);
        }
    };

    sortCalendar = function (sortDirection) {
        self.liturgicalDates.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            if (sortDirection === 'desc') {
                return new Date(a.eventDate) - new Date(b.eventDate);
            }
            else {
                return new Date(b.eventDate) - new Date(a.eventDate);
            }
        });
    };

    getEasterDate = function (currentVal) {
        //1. Divide x by 19 to get a quotient (which we ignore) and a remainder A. This is the year’s position in the 19-year lunar cycle. (A + 1 is the year’s Golden Number.)
        var remainderA = currentVal % 19;

        //2. Divide x by 100 to get a quotient B and a remainder C.
        var quotientB = Math.floor(currentVal / 100);
        var remainderC = currentVal % 100;

        //3. Divide B by 4 to get a quotient D and a remainder E.
        var quotientD = Math.floor(quotientB / 4);
        var remainderE = quotientB % 4;

        //4. Divide 8B + 13 by 25 to get a quotient G and a remainder (which we ignore).
        var quotientG = Math.floor((8 * quotientB + 13) / 25);

        //5. Divide 19A + B – D – G + 15 by 30 to get a quotient (which we ignore) and a remainder H.
        //(The year’s Epact is 23 – H when H is less than 24 and 53 – H otherwise.)
        var remainderH = ((19 * remainderA) + quotientB - quotientD - quotientG + 15) % 30;

        //6. Divide A + 11H by 319 to get a quotient M and a remainder (which we ignore).
        var quotientM = Math.floor((remainderA + (11 * remainderH)) / 319);

        //7. Divide C by 4 to get a quotient J and a remainder K.
        var quotientJ = Math.floor(remainderC / 4);
        var remainderK = remainderC % 4;

        //8. Divide 2E + 2J – K – H + M + 32 by 7 to get a quotient (which we ignore) and a remainder L.
        var remainderL = ((2 * remainderE) + (2 * quotientJ) - remainderK - remainderH + quotientM + 32) % 7;

        //9. Divide H – M + L + 90 by 25 to get a quotient N and a remainder (which we ignore).
        var quotientN = Math.floor((remainderH - quotientM + remainderL + 90) / 25);

        //10. Divide H – M + L + N + 19 by 32 to get a quotient (which we ignore) and a remainder P.
        var remainderP = (remainderH - quotientM + remainderL + quotientN + 19) % 32;

        //Easter Sunday is the Pth day of the Nth month (N can be either 3 for March or 4 for April). The year’s dominical 
        //letter can be found by dividing 2E + 2J – K by 7 and taking the remainder (a remainder of 0 is equivalent to the 
        //letter A, 1 is equivalent to B, and so on).
        var finalEasterDate = quotientN + "/" + remainderP + "/" + currentVal;
        //CHECK: Let’s try this method for x = 2001: (1) A = 6; (2) B = 20, C = 1; (3) D = 5, E = 0; (4) G = 6; (5) H = 18; (6) M = 0; (7) J = 0, K = 1; (8) L = 6; (9) N = 4; (10) P = 15. So Easter 2001 is April 15.				

        self.easterDate = finalEasterDate;

        return finalEasterDate;
    };

    getNumberOfSundaysAfterPentecost = function (finalEasterDate) {
        var easter = new Date(finalEasterDate);
        var pentecost = new Date(easter.setDate(easter.getDate() + 49));

        //number of sundays after pentecost
        //get first sunday advent of current year, and subtract sundays between pentecost and first sunday of advent
        var yearToCalculate = parseFloat(self.yearToCalculate());
        var firstSundayOfAdvent = getFirstSundayOfAdvent(yearToCalculate);
        var millsecondsAfterPentecost = Math.abs(pentecost - firstSundayOfAdvent); //milliseconds

        console.log('pentecost= ' + pentecost.toLocaleDateString() + 'firstSundayOfAdvent = ' + firstSundayOfAdvent + 'millsecondsAfterPentecost = ' + millsecondsAfterPentecost);

        var sundaysAfterPentecost = (Math.round(millsecondsAfterPentecost / 1000 / 60 / 60 / 24 / 7) - 1);
        self.liturgicalDates.push({ eventName: 'Sundays After Pentecost (' + yearToCalculate + ')', eventDate: sundaysAfterPentecost });
    };

    getEasterSeasonDates = function (currentVal) {
        currentVal = parseFloat(currentVal);
        console.log('currentVal= ' + currentVal);
        var finalEasterDate = getEasterDate(parseFloat(currentVal));
        console.log('finalEasterDate= ' + finalEasterDate);

        var septuagesima = getNewFeastDayBasedOnEaster(finalEasterDate, -63);
        var sexagesima = getNewFeastDayBasedOnEaster(finalEasterDate, -56);
        var quinquagesima = getNewFeastDayBasedOnEaster(finalEasterDate, -49);		
        var ashWednesday = getNewFeastDayBasedOnEaster(finalEasterDate, -46);
        var goodShep = getNewFeastDayBasedOnEaster(finalEasterDate, 21);
        var ascension = getNewFeastDayBasedOnEaster(finalEasterDate, 39);        
        var pentecost = getNewFeastDayBasedOnEaster(finalEasterDate, 49);
        var trinity = getNewFeastDayBasedOnEaster(finalEasterDate, 56);
        var corpus = getNewFeastDayBasedOnEaster(finalEasterDate, 60);
        var corpusObs = getNewFeastDayBasedOnEaster(finalEasterDate, 63);

        self.liturgicalDates.push({ eventName: 'Septuagesima Sunday', eventDate: septuagesima.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Sexagesima Sunday', eventDate: sexagesima.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Quinquagesima Sunday', eventDate: quinquagesima.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Ash Wednesday', eventDate: ashWednesday.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Easter Sunday', eventDate: finalEasterDate });
        self.liturgicalDates.push({ eventName: 'Good Shepherd Sunday (2nd Sunday after Easter)', eventDate: goodShep.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Ascension Thursday', eventDate: ascension.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Pentecost Sunday', eventDate: pentecost.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Trinity Sunday', eventDate: trinity.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Corpus Christi', eventDate: corpus.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Corpus Christi (Sunday observed)', eventDate: corpusObs.toLocaleDateString() });
    };

    getNewFeastDayBasedOnEaster = function (finalEasterDate, daysToAddToEaster) {
        var easter = new Date(finalEasterDate); //reset value to calculate new date since javascript passes by reference
        return new Date(easter.setDate(easter.getDate() + daysToAddToEaster));
    };

    getFirstSundayOfAdvent = function (yearToCalculate) {
        var lastSundayOfAdvent = new Date('12/25/' + yearToCalculate);
        var dayOfWeek = 1;
        var daysToSubtract = 21;

        //while day of week is not Sunday, subtract a day until the Sunday before Christmas if found
        while (dayOfWeek !== 0) {
            lastSundayOfAdvent = new Date(lastSundayOfAdvent.setDate(lastSundayOfAdvent.getDate() - 1));
            dayOfWeek = lastSundayOfAdvent.getDay();
        }

        var firstSundayOfAdvent = new Date(lastSundayOfAdvent.setDate(lastSundayOfAdvent.getDate() - daysToSubtract));

        return firstSundayOfAdvent;
    };

    getChristmasSeasonDates = function (yearToCalculate) {
        var floatYear = parseFloat(yearToCalculate);
        var DEFAULT_CHRISTMAS_DATE = new Date('12/25/' + yearToCalculate);
        //var christmas = new Date('12/25/' + yearToCalculate);
        var newYears = new Date('1/1/' + parseFloat(floatYear + 1));

        var firstSundayOfAdvent = getFirstSundayOfAdvent(yearToCalculate);

        self.liturgicalDates.push({ eventName: 'First Sunday of Advent', eventDate: firstSundayOfAdvent.toLocaleDateString() });
        self.liturgicalDates.push({ eventName: 'Christmas', eventDate: getDayOfWeekName(DEFAULT_CHRISTMAS_DATE.getDay()) + ', 12/25/' + yearToCalculate });
        self.liturgicalDates.push({ eventName: 'New Years/Solemnity of Mary', eventDate: getDayOfWeekName(newYears.getDay()) + ', ' + newYears.toLocaleDateString() });
    };

    clearForm = function () {
        self.liturgicalDates([]);
    };

    getDayOfWeekName = function (weekDayNumber) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return days[weekDayNumber];
    };

    //Handles form validation, showing error messages, user entry etc.
    isValid = function () {
        var valid = false;
        var currentDateEntered = self.yearToCalculate();

        if (UTILITIES.isNumber(currentDateEntered)) {
            if (currentDateEntered >= MIN_YEAR && currentDateEntered <= MAX_YEAR) {
                valid = true;
            }
            else {
                self.errors("You must enter a year between " + MIN_YEAR + " and " + MAX_YEAR);
            }
        }
        else {
            self.errors("You must enter a valid year");
        }

        if (valid) {
            self.errors("");
        }

        return valid;
    };
    resetCalendar = function () {
        location.reload();
    };

})(jQuery);

$(function () {
    ko.applyBindings();
}); //END DOCUMENT READY FUNCTION