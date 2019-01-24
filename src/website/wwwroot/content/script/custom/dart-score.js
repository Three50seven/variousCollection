// Create date: JAN-24-2019
// Author: 		Paul Krimm

const MIN_SEED = 1;
const MAX_SEED = 20;
const DEFAULT_SCORE_TARGET = 15; //this will make a score board of 15-20 + Bull
const PLAYER_ONE = 'Player 1';
const PLAYER_TWO = 'Player 2';

function AppViewModel() {
    self.errors = ko.observable("");
    self.scoreTargetSeed = ko.observable(DEFAULT_SCORE_TARGET); //e.g. 19 will make a score board of 19 - 20 + Bull, and 1 - 20 if 1 is entered
    self.scoreTargets = ko.observableArray([]);
    self.playerOne = ko.observable(PLAYER_ONE);
    self.playerTwo = ko.observable(PLAYER_TWO);

    self.buildScoreBoard = function () {
        clearForm();

        if (isValid()) {
            var currentVal = parseFloat(self.scoreTargetSeed()); // Read the user input
            for (i = MAX_SEED; i >= currentVal; i--) {
                self.scoreTargets.push({ score: i });
            }

            //add bullseye each time
            self.scoreTargets.push({ score: 'Bull' });
        }
    };

    self.decrementScore = function (score) {
        console.log('decrease: ' + score);
    };
}


function clearForm() {
    self.scoreTargets([]);
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//Handles form validation, showing error messages, user entry etc.
function isValid() {
    var valid = false;
    var currentScoreTargetSeed = self.scoreTargetSeed();

    if (isNumber(currentScoreTargetSeed)) {
        if (currentScoreTargetSeed >= MIN_SEED && currentScoreTargetSeed <= MAX_SEED) {
            valid = true;
        }
        else {
            self.errors("You must enter a number between " + MIN_SEED + " and " + MAX_SEED);
        }
    }
    else {
        self.errors("You must enter a valid number");
    }

    if (valid) {
        self.errors("");
    }

    return valid;
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
