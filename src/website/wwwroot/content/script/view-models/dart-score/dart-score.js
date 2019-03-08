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
                self.scoreTargets.push({
                    score: i,
                    p1Score: 0,
                    p1ScoreImg: '',
                    p2Score: 0,
                    p2ScoreImg: ''
                });
            }

            //add bullseye each time
            self.scoreTargets.push({
                score: 'Bull',
                p1Score: 0,
                p1ScoreImg: '',
                p2Score: 0,
                p2ScoreImg: ''
            });
        }
    };
    incrementScore = function (score, playerId) {
        updateCricketScore(score, playerId, 1);
    };
    decrementScore = function (score, playerId) {
        updateCricketScore(score, playerId, -1);
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
    getValidUpScoreError = function (isSingleDart = false, score, playerName, dartMsg) {
        const MAX_UP_SCORE = isSingleDart ? 60 : 180; //3 triple 20s = 3*20*3 = 180 - highest score in throw/round
        const MIN_UP_SCORE = 0;
        let errorMessage = '';

        if (UTILITIES.isNumber(score)) {
            if (score >= MIN_UP_SCORE && score <= MAX_UP_SCORE) {
                errorMessage = '';
            }
            else {
                errorMessage = ' must enter a number between ' + MIN_UP_SCORE + ' and ' + MAX_UP_SCORE;
            }
        }
        else {
            errorMessage = ' must enter a valid number';
        }

        //format the error message, if there is one
        if (errorMessage.length > 0) {            
            errorMessage = '- ' + playerName + errorMessage + ' for ' + dartMsg + '</br>';
        }
        
        return errorMessage;
    };
    isValidUpScoreEntered = function () {
        let errorMessage = '';

        let scoresEntered = [];
        scoresEntered.push({ playerName: self.playerOne(), scoreEntered: self.playerOneUpRoundScore1Entered(), dartMsg: 'first dart' });
        scoresEntered.push({ playerName: self.playerOne(), scoreEntered: self.playerOneUpRoundScore2Entered(), dartMsg: 'second dart' });
        scoresEntered.push({ playerName: self.playerOne(), scoreEntered: self.playerOneUpRoundScore3Entered(), dartMsg: 'third dart' });
        scoresEntered.push({ playerName: self.playerTwo(), scoreEntered: self.playerTwoUpRoundScore1Entered(), dartMsg: 'first dart' });
        scoresEntered.push({ playerName: self.playerTwo(), scoreEntered: self.playerTwoUpRoundScore2Entered(), dartMsg: 'second dart' });
        scoresEntered.push({ playerName: self.playerTwo(), scoreEntered: self.playerTwoUpRoundScore3Entered(), dartMsg: 'third dart' });

        for (var i = 0; i < scoresEntered.length; i++) {
            let score = scoresEntered[i].scoreEntered;
            let playerName = scoresEntered[i].playerName;
            let dartMsg = scoresEntered[i].dartMsg;
            let scoreErrorMsg = getValidUpScoreError(true, score, playerName, dartMsg);
            errorMessage += scoreErrorMsg;
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
            let roundP1Score = parseFloat(self.playerOneUpRoundScore1Entered()) + parseFloat(self.playerOneUpRoundScore2Entered()) + parseFloat(self.playerOneUpRoundScore3Entered());
            let roundP2Score = parseFloat(self.playerTwoUpRoundScore1Entered()) + parseFloat(self.playerTwoUpRoundScore2Entered()) + parseFloat(self.playerTwoUpRoundScore3Entered());
            let newP1Score = parseFloat(self.currentPlayerOneUpScore()) - roundP1Score;
            let newP2Score = parseFloat(self.currentPlayerTwoUpScore()) - roundP2Score;

            if (checkUpScore(self.playerOne(), newP1Score))
                self.currentPlayerOneUpScore(newP1Score);
            else {
                self.playerOneUpRoundScore1Entered(0);
                self.playerOneUpRoundScore2Entered(0);
                self.playerOneUpRoundScore3Entered(0);
            }                

            if (checkUpScore(self.playerTwo(), newP2Score))
                self.currentPlayerTwoUpScore(newP2Score);
            else {
                self.playerTwoUpRoundScore1Entered(0);
                self.playerTwoUpRoundScore2Entered(0);
                self.playerTwoUpRoundScore3Entered(0);
            }

            //create and add a new score record for this round
            let roundScore = new MODULES.Constructors.DartScore.UpScore(self.currentUpRound(), roundP1Score.toString(), roundP2Score.toString(),'','');
            self.scoreUpGame.unshift(roundScore); //add score to beginning of array

            //reset entries after recording
            self.playerOneUpRoundScore1Entered(0);
            self.playerOneUpRoundScore2Entered(0);
            self.playerOneUpRoundScore3Entered(0);
            self.playerTwoUpRoundScore1Entered(0);
            self.playerTwoUpRoundScore2Entered(0);
            self.playerTwoUpRoundScore3Entered(0);

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
            scoreRecord.playerOneErrorMessage = getValidUpScoreError(false, scoreRecord.playerOneScore, playerOne(), 'all darts combined in this round');
            scoreRecord.playerTwoErrorMessage = getValidUpScoreError(false, scoreRecord.playerTwoScore, playerTwo(), 'all darts combined in this round');
            
            if (scoreRecord.playerOneErrorMessage !== '' || scoreRecord.playerTwoErrorMessage !== '')
                hasErrors = true;
            else {
                p1Total += parseFloat(scoreRecord.playerOneScore);
                p2Total += parseFloat(scoreRecord.playerTwoScore);
            }

            self.scoreUpGame.refresh(scoreRecord); //refresh observable array
        });        

        if (!hasErrors) {
            self.isEditingUpScore(false);            

            self.currentPlayerOneUpScore(self.score501() - p1Total);
            self.currentPlayerTwoUpScore(self.score501() - p2Total);
        }            
    };
    getCricketScoreImagePath = function (score) {
        var path = '';
        switch (score) {
            case 1:
                path = MODULES.Constants.DartScore.IMG_1_SLASH_T_PATH;
                break;
            case 2:
                path = MODULES.Constants.DartScore.IMG_2_X_T_PATH;
                break;
            case 3:
                path = MODULES.Constants.DartScore.IMG_3_X_CIRCLED_T_PATH;
        }
        return path;
    };
    updateCricketScore = function (scoreId, playerId, scoreChanger) {
        var match = ko.utils.arrayFirst(self.scoreTargets(), function (item) {
            return item.score === scoreId;
        });

        if (playerId === 1) {
            if (match.p1Score + scoreChanger >= 0 && match.p1Score + scoreChanger <= 3) {
                match.p1Score += scoreChanger;
                match.p1ScoreImg = getCricketScoreImagePath(match.p1Score);                
            }
            else            
                self.cricketP1Score(self.cricketP1Score() + tallyCricketScore(scoreId, match.p1Score, match.p2Score) * scoreChanger);
        }
        else {
            if (match.p2Score + scoreChanger >= 0 && match.p2Score + scoreChanger <= 3) {
                match.p2Score += scoreChanger;
                match.p2ScoreImg = getCricketScoreImagePath(match.p2Score);
            }
            else
                self.cricketP2Score(self.cricketP2Score() + tallyCricketScore(scoreId, match.p2Score, match.p1Score) * scoreChanger);
        }

        self.scoreTargets.refresh(match); //refresh observable array

        checkCricketWinner();
    };
    tallyCricketScore = function (scoreAmount, scorerMarks, opponentMarks) {
        var tally = 0;

        //if keeping score - tally up total when the other player has not closed out the number yet:
        if (self.keepCricketScore() && scorerMarks === 3 && opponentMarks < 3) {
            if (scoreAmount === 'Bull')
                tally = 25;
            else if (UTILITIES.isNumber(scoreAmount))
                tally = parseFloat(scoreAmount);            
        }

        return tally;
    };
    checkCricketWinner = function () {
        var winnersName = '';

        //check if every score equals 3, then this player is a winnerCandidate
        var allP1IsChecked = self.scoreTargets().every(function (scoreRecord) {
            return scoreRecord.p1Score === 3;
        });

        var allP2IsChecked = self.scoreTargets().every(function (scoreRecord) {
            return scoreRecord.p2Score === 3;
        });
        
        if (allP1IsChecked || allP2IsChecked) {
            //if keeping score, see who has the biggest score (or if tied, whoever goes out first)
            if (self.keepCricketScore() && self.cricketP1Score() !== self.cricketP2Score()) {
                if (self.cricketP1Score() > self.cricketP2Score())
                    winnersName = self.playerOne();
                else
                    winnersName = self.playerTwo();
            }
            else {
                //otherwise, just see who checks out first
                if (allP1IsChecked)
                    winnersName = self.playerOne();
                else
                    winnersName = self.playerTwo();
            }

            self.winningPlayer(winnersName);
        }        
    };

})(jQuery);

$(function () {
    ko.applyBindings();
}); //END DOCUMENT READY FUNCTION