// Create date: JAN-24-2019
// Author: 		Paul Krimm
(function ($) {
    var self = this;

    HideOtherInfo = $("#slider-control").click(function () {
        if ($("#slider").is(":hidden")) {
            $("#slider").slideDown("slow");
            $("#slider-control").text('------- hide -------');
        } else {
            $("#slider").slideUp("slow");
            $("#slider-control").text('------- show -------');
        }
    });
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
            for (i = MODULES.Constants.DartScore.MAX_SEED; i >= currentVal; i--) {
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
    clearForm = function () {
        self.scoreTargets([]);
    };
    isValid = function (errorMessage) {
        let valid = false;

        if (errorMessage === '')
            valid = true;
        else
            self.errors(errorMessage);

        if (valid) {
            self.errors('');
        }

        return valid;
    };
    isValidCurrentScoreTargetSeed = function () {
        let errorMessage = '';

        var currentScoreTargetSeed = self.scoreTargetSeed();

        if (UTILITIES.isNumber(currentScoreTargetSeed)) {
            if (currentScoreTargetSeed >= MODULES.Constants.DartScore.MIN_SEED && currentScoreTargetSeed <= MODULES.Constants.DartScore.MAX_SEED) {
                errorMessage = '';
            }
            else {
                errorMessage = 'You must enter a number between ' + MODULES.Constants.DartScore.MIN_SEED + ' and ' + MODULES.Constants.DartScore.MAX_SEED;
            }
        }
        else {
            errorMessage = 'You must enter a valid number';
        }

        return isValid(errorMessage);
    };
    getValidUpScoreError = function (score, playerName) {
        const MAX_UP_SCORE = 180; //3 triple 20s = 3*20*3 = 180
        const MIN_UP_SCORE = 0;
        let errorMessage = '';

        if (UTILITIES.isNumber(score)) {
            if (score >= MIN_UP_SCORE && score <= MAX_UP_SCORE) {
                errorMessage = '';
            }
            else {
                errorMessage = playerName + ' must enter a number between ' + MIN_UP_SCORE + ' and ' + MAX_UP_SCORE;
            }
        }
        else {
            errorMessage = playerName + ' must enter a valid number';
        }
        
        return errorMessage;
    };
    isValidUpScoreEntered = function () {
        let errorMessage = '';

        let scoresEntered = [];
        scoresEntered.push({ playerName: self.playerOne(), scoreEntered: self.playerOneUpRoundScoreEntered() });
        scoresEntered.push({ playerName: self.playerTwo(), scoreEntered: self.playerTwoUpRoundScoreEntered() });

        for (var i = 0; i < scoresEntered.length; i++) {
            let score = scoresEntered[i].scoreEntered;
            let playerName = scoresEntered[i].playerName;
            errorMessage += (errorMessage.length > 0 ? getValidUpScoreError(score, playerName) + ' ' : getValidUpScoreError(score, playerName));
        }

        if (errorMessage !== '') {
            self.upErrors(errorMessage);
            return false;
        }
        else
            return true;
    };
    checkUpScore = function (playerName, newScore) {
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
    };
    enterUpScore = function () {
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
            let roundScore = new MODULES.Constructors.DartScore.UpScore(self.currentUpRound(), self.playerOneUpRoundScoreEntered().toString(), self.playerTwoUpRoundScoreEntered().toString(),'','');
            self.scoreUpGame.unshift(roundScore); //add score to beginning of array

            //reset entries after recording
            self.playerOneUpRoundScoreEntered(0);
            self.playerTwoUpRoundScoreEntered(0);

            self.currentUpRound(self.currentUpRound() + 1);
        }
    };
    editUpScore = function () {
        self.isEditingUpScore(true);
    };
    saveAllUpScore = function () {
        let hasErrors = false;
        let p1Total = 0;
        let p2Total = 0;

        $.each(self.scoreUpGame(), function (i, scoreRecord) {
            scoreRecord.playerOneErrorMessage = getValidUpScoreError(scoreRecord.playerOneScore, playerOne());
            scoreRecord.playerTwoErrorMessage = getValidUpScoreError(scoreRecord.playerTwoScore, playerTwo());
            
            if (scoreRecord.playerOneErrorMessage !== '' || scoreRecord.playerTwoErrorMessage !== '')
                hasErrors = true;
            else {
                p1Total += parseFloat(scoreRecord.playerOneScore);
                p2Total += parseFloat(scoreRecord.playerTwoScore);
            }

            self.scoreUpGame.refresh(scoreRecord); //refresh observable
        });        

        if (!hasErrors) {
            self.isEditingUpScore(false);            

            self.currentPlayerOneUpScore(self.score501() - p1Total);
            self.currentPlayerTwoUpScore(self.score501() - p2Total);
        }            
    };

})(jQuery);

$(function () {
    ko.applyBindings();
}); //END DOCUMENT READY FUNCTION