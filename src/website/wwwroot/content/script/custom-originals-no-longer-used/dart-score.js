// Create date: JAN-24-2019
// Author: 		Paul Krimm

const MIN_SEED = 1;
const MAX_SEED = 20;
const DEFAULT_SCORE_TARGET = 15; //this will make a score board of 15-20 + Bull
const PLAYER_ONE = 'Player 1';
const PLAYER_TWO = 'Player 2';

var GameEnum = {
    Cricket: 'Cricket',
    FiveOne: '501 up',
    Killer: 'Killer'
};

var Game501Enum = {
    Five: 501,
    Three: 301
};

// Constructor for an object with two properties
var UpScore = function (round, playerOneScore, playerTwoScore) {
    this.round = round;
    this.playerOneScore = playerOneScore;
    this.playerTwoScore = playerTwoScore;
};

$("#slider-control").click(function () {
    if ($("#slider").is(":hidden")) {
        $("#slider").slideDown("slow");
        $("#slider-control").text('------- hide -------');
    } else {
        $("#slider").slideUp("slow");
        $("#slider-control").text('------- show -------');        
    }
});

function AppViewModel() {
    self.errors = ko.observable("");
    self.upErrors = ko.observable("");
    self.winningPlayer = ko.observable("");
    self.availableGames = ko.observableArray([GameEnum.Cricket, GameEnum.FiveOne, GameEnum.Killer]);
    self.availableUpGames = ko.observableArray([Game501Enum.Five, Game501Enum.Three]);
    self.gameStarted = ko.observable(false);
    self.playerOne = ko.observable(PLAYER_ONE);
    self.playerTwo = ko.observable(PLAYER_TWO);
    
    self.selectedGame = ko.observable("");
    self.scoreTargetSeed = ko.observable(DEFAULT_SCORE_TARGET); //e.g. 19 will make a score board of 19 - 20 + Bull, and 1 - 20 if 1 is entered    
    self.score501 = ko.observable(Game501Enum.Five);
    self.scoreTargets = ko.observableArray([]);
    self.scoreUpGame = ko.observableArray([]);
    self.currentUpRound = ko.observable(1);
    self.isEditingUpScore = ko.observable(false);
    self.currentPlayerOneUpScore = ko.observable(self.score501());
    self.currentPlayerTwoUpScore = ko.observable(self.score501());
    self.playerOneUpRoundScoreEntered = ko.observable(0);
    self.playerTwoUpRoundScoreEntered = ko.observable(0);
}

resetGame = function () {
    location.reload();
};

upGameChanged = function () {
    self.currentPlayerOneUpScore(self.score501());
    self.currentPlayerTwoUpScore(self.score501());
};

buildScoreboard = function () {
    self.gameStarted(true); //first time building scoreboard, the game has started
    clearForm();

    if (isValidCurrentScoreTargetSeed()) {
        var currentVal = parseFloat(self.scoreTargetSeed()); // Read the user input
        for (i = MAX_SEED; i >= currentVal; i--) {
            self.scoreTargets.push({ score: i });
        }

        //add bullseye each time
        self.scoreTargets.push({ score: 'Bull' });
    }
};

incrementScore = function (score, playerId) {
    console.log('increase: ' + score + ' for player:' + playerId);
};

decrementScore = function (score, playerId) {
    console.log('decrease: ' + score + ' for player:' + playerId);
};

function clearForm() {
    self.scoreTargets([]);
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//Handles form validation, showing error messages, user entry etc.
function isValid(errorMessage) {
    let valid = false;

    if (errorMessage === '')
        valid = true;
    else
        self.errors(errorMessage);

    if (valid) {
        self.errors('');
    }

    return valid;
}

function isValidCurrentScoreTargetSeed() {
    let errorMessage = '';

    var currentScoreTargetSeed = self.scoreTargetSeed();

    if (isNumber(currentScoreTargetSeed)) {
        if (currentScoreTargetSeed >= MIN_SEED && currentScoreTargetSeed <= MAX_SEED) {
            errorMessage = '';
        }
        else {
            errorMessage = 'You must enter a number between ' + MIN_SEED + ' and ' + MAX_SEED;
        }
    }
    else {
        errorMessage = 'You must enter a valid number';
    }

    return isValid(errorMessage);
}

function isValidUpScoreEntered() {
    let errorMessage = '';
    const MAX_UP_SCORE = 150;
    const MIN_UP_SCORE = 0;

    let scoresEntered = [];
    scoresEntered.push({ playerName: self.playerOne(), scoreEntered: self.playerOneUpRoundScoreEntered() });
    scoresEntered.push({ playerName: self.playerTwo(), scoreEntered: self.playerTwoUpRoundScoreEntered() });

    for (var i = 0; i < scoresEntered.length; i++) {
        if (isNumber(scoresEntered[i].scoreEntered)) {
            if (scoresEntered[i].scoreEntered >= MIN_UP_SCORE && scoresEntered[i].scoreEntered <= MAX_UP_SCORE) {
                errorMessage += '';
            }
            else {
                errorMessage += scoresEntered[i].playerName + ' must enter a number between ' + MIN_UP_SCORE + ' and ' + MAX_UP_SCORE;
            }
        }
        else {
            errorMessage += scoresEntered[i].playerName + ' must enter a valid number';
        }
    }    

    if (errorMessage !== '')
        self.upErrors(errorMessage);
    else
        return true;
}

function checkUpScore(playerName, newScore) {
    let validMessage = '';
    let isValid = false;
    
    //show winner
    if (newScore === 0) {
        self.winningPlayer(playerName);
        isValid = true;
    }
    else if (newScore > 1)
        isValid = true;
    else {
        validMessage = playerName + " is bust!";
        self.upErrors((self.upErrors() + ' ' + validMessage).trim());
    }

    return isValid;
}

function enterUpScore() {
    self.gameStarted(true); //first time score is entered, the game has started
    self.upErrors(''); //reset errors for this game

    if (isValidUpScoreEntered()) {
        let newP1Score = self.currentPlayerOneUpScore() - self.playerOneUpRoundScoreEntered();
        let newP2Score = self.currentPlayerTwoUpScore() - self.playerTwoUpRoundScoreEntered();

        if (checkUpScore(self.playerOne(), newP1Score))
            self.currentPlayerOneUpScore(newP1Score);
        else
            self.playerOneUpRoundScoreEntered(0);

        if (checkUpScore(self.playerTwo(), newP2Score))
            self.currentPlayerTwoUpScore(newP2Score);
        else
            self.playerTwoUpRoundScoreEntered(0);

        //create and add a new score record for this round
        let roundScore = new UpScore(self.currentUpRound(), self.playerOneUpRoundScoreEntered().toString(), self.playerTwoUpRoundScoreEntered().toString());
        self.scoreUpGame.unshift(roundScore); //add score to beginning of array

        //reset entries after recording
        self.playerOneUpRoundScoreEntered(0);
        self.playerTwoUpRoundScoreEntered(0);

        self.currentUpRound(self.currentUpRound() + 1);
    }    
}

function editUpScore(data) {
    console.log(data);
    self.isEditingUpScore(true);
}

function saveAllUpScore(data) {
    console.log(data);
    self.isEditingUpScore(false);
    //var tempOrderCsv = '';
    //$.each(self.sections(), function (i, section) {
    //    $.each(section.subSections(), function (j, subSection) {
    //        tempOrderCsv += section.sectionId + ',' + subSection.subSectionId + '|';
    //    });
    //});

    //tempOrderCsv = tempOrderCsv.substring(0, tempOrderCsv.length - 1);

    //var data = { displayOrderDelimited: tempOrderCsv, stakeholderId: userId };

    //$.ajax({
    //    type: "POST",
    //    contentType: "application/json; charset=utf-8",
    //    url: "/services/Campaigns.asmx/updateDisplayOrder",
    //    dataType: "json",
    //    data: JSON.stringify(data),
    //    async: true,
    //    success: function (result) {
    //        $.each(self.sections(), function (i, section) {
    //            section.editing(false);
    //            section.displayOrder(section.displayOrderTemp());
    //            $.each(section.subSections(), function (j, subsection) {
    //                subsection.editing(false);
    //                subsection.displayOrder(subsection.displayOrderTemp());
    //            });
    //        });
    //        self.orderChanged(false);
    //        self.editing(false);
    //    },
    //    error: function (jqXHR) {
    //        alert(jqXHR.statusText + ": Your changes could not be saved. Please try again.");
    //    }
    //});
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
