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

        if (isValidCurrentScoreTargetSeed(self.scoreTargetSeed())) {
            var currentVal = parseFloat(self.scoreTargetSeed()); // Read the user input
            for (i = MODULES.Constants.DartScore.MAX_SEED; i >= currentVal; i--) {
                self.scoreTargets.push(new MODULES.Constructors.DartScore.CricketScore(i, 0, '', 0, ''));
            }

            //add bullseye each time
            self.scoreTargets.push(new MODULES.Constructors.DartScore.CricketScore('Bull', 0, '', 0, ''));
        }
    };
    incrementScore = function (score, playerId) {
        updateCricketScore(score, playerId, 1);
    };
    decrementScore = function (score, playerId) {
        updateCricketScore(score, playerId, -1);
    };
    incrementLives = function (playerId) {        
        updateKillerScore(playerId, 1);
    };
    decrementLives = function (playerId) {
        updateKillerScore(playerId, -1);
    };
    resurrectPlayer = function (playerId) {
        let confirmMessage = 'Are you sure you want to bring this player back?';
        let match = ko.utils.arrayFirst(self.killerScores(), function (item) {
            return item.playerId === playerId;
        });

        if (match) {
            if (match.isOut) {
                if (confirm(confirmMessage)) {
                    //reset player if confirmed
                    match.isOut = false;
                    match.livesRemaining = 0;

                    self.killerScores.refresh(match); //refresh observable array
                }
                else
                    return false;
            }
            else
                return false;
        }
    };
    buildKillerScoreboard = function () {        
        clearForm();

        if (isValidCurrentScoreTargetSeed(self.numberOfKillerPlayers()) && isValidCurrentScoreTargetSeed(self.numberOfKillerLives())) {
            var currentVal = parseFloat(self.numberOfKillerPlayers()); // Read the user input
            for (i = 0; i < currentVal; i++) {
                self.killerScores.push(new MODULES.Constructors.DartScore.KillerScore(i, UTILITIES.getRandomAnimalWithAdjective(true), i+1, 0, false, false,''));
            }
        }
    };
    startKillerGame = function () {
        if (!killerSetupHasErrors()) {
            self.errors(''); //clear errors
            self.gameStarted(true); //indicator flag that the game has started
        }
    };
    isPlayersTurn = function (playerId) {
        return self.currentKillerPlayersTurn() === playerId;
    };
    jumpToPlayer = function (playerId) {
        if (gameStarted()) {
            let match = ko.utils.arrayFirst(self.killerScores(), function (item) {
                return item.playerId === playerId && !item.isOut;
            });

            if (match)
                self.currentKillerPlayersTurn(match.playerId);
        }
    };
    changeKillerPlayer = function (changer) {
        if (gameStarted()) {
            let currentPlayerID = self.currentKillerPlayersTurn();

            //get an array of all players still alive
            let playersStillAlive = self.killerScores().filter(function (record) {
                return !record.isOut;
            });

            if (playersStillAlive.length > 0) {
                let minPlayerId = playersStillAlive[0].playerId;
                let maxPlayerId = playersStillAlive[playersStillAlive.length - 1].playerId;
                let currentPlayerIndex = playersStillAlive.map(function (player) { return player.playerId; }).indexOf(currentPlayerID);
                                               
                if (self.currentKillerPlayersTurn() + changer > maxPlayerId) {                
                    currentPlayerID = minPlayerId; //reset to first active player after last player's turn
                }
                else if (currentPlayerID + changer < minPlayerId) {
                    currentPlayerID = maxPlayerId; //when pressing prev. on first active player, change to last active player
                }
                else {
                    let newIndex = currentPlayerIndex += changer;
                    currentPlayerID = playersStillAlive[newIndex].playerId;
                }
            }

            /*old logic
                if (self.currentKillerPlayersTurn() + changer >= self.numberOfKillerPlayers())
                    currentPlayerID = 0; //reset to first player after last player's turn
                else if (currentPlayerID + changer < 0)
                    currentPlayerID = self.numberOfKillerPlayers() - 1; //when pressing prev. on player 1, change to last player
                else
                    currentPlayerID += changer;
            */

            self.currentKillerPlayersTurn(currentPlayerID);
        }
    };
    currentKillerPlayersName = function () {
        if (self.killerScores().length > 0) {
            let match = ko.utils.arrayFirst(self.killerScores(), function (item) {
                return item.playerId === self.currentKillerPlayersTurn();
            });

            if (match)
                return match.playerName;
        }
    };
    canDecrementLives = function (playerId) {
        //current player can only decrement anyone's lives only if they are a killer, or they are decreasing their own lives
        let currentThrowerIsKiller = false;
        let hasLives = false;
        let match = ko.utils.arrayFirst(self.killerScores(), function (item) {
            return item.playerId === self.currentKillerPlayersTurn();
        });
        if (match) {
            currentThrowerIsKiller = match.isKiller;
            hasLives = match.livesRemaining > 0 || self.allowSuicideInKiller(); //if allowing suicide, player will "always" have lives
        }                          

        return self.gameStarted() && (playerId === self.currentKillerPlayersTurn() && hasLives || currentThrowerIsKiller);
    };
    clearForm = function () {
        self.killerScores([]);
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
    validateDartNumber = function (number) {
        let errorMessage = '';

        if (UTILITIES.isNumber(number)) {
            if (number >= MODULES.Constants.DartScore.MIN_SEED && number <= MODULES.Constants.DartScore.MAX_SEED) {
                errorMessage = '';
            }
            else {
                errorMessage = 'You must enter a number between ' + MODULES.Constants.DartScore.MIN_SEED + ' and ' + MODULES.Constants.DartScore.MAX_SEED;
            }
        }
        else {
            errorMessage = 'You must enter a valid number';
        }

        return errorMessage;
    };
    isValidCurrentScoreTargetSeed = function (currentScoreTargetSeed) {
        let errorMessage = validateDartNumber(currentScoreTargetSeed);

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
            let roundScore = new MODULES.Constructors.DartScore.UpScore(self.currentUpRound(), parseFloat(self.playerOneUpRoundScore1Entered()), parseFloat(self.playerOneUpRoundScore2Entered()), parseFloat(self.playerOneUpRoundScore3Entered()),
                parseFloat(self.playerTwoUpRoundScore1Entered()), parseFloat(self.playerTwoUpRoundScore2Entered()), parseFloat(self.playerTwoUpRoundScore3Entered()),
                roundP1Score, roundP2Score, '', '');

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
    cancelEditingUpScore = function () {
        self.isEditingUpScore(false);
    };
    saveAllUpScore = function () {        
        let hasErrors = false;
        let p1Total = 0;
        let p2Total = 0;

        $.each(self.scoreUpGame(), function (j, scoreRecord) {
            let errorMessageP1 = '';
            let errorMessageP2 = '';
            let scoresEnteredP1 = [];
            let scoresEnteredP2 = [];
            scoresEnteredP1.push({ playerName: self.playerOne(), scoreEntered: scoreRecord.playerOneDart1, dartMsg: 'first dart' });
            scoresEnteredP1.push({ playerName: self.playerOne(), scoreEntered: scoreRecord.playerOneDart2, dartMsg: 'second dart' });
            scoresEnteredP1.push({ playerName: self.playerOne(), scoreEntered: scoreRecord.playerOneDart3, dartMsg: 'third dart' });
            scoresEnteredP2.push({ playerName: self.playerTwo(), scoreEntered: scoreRecord.playerTwoDart1, dartMsg: 'first dart' });
            scoresEnteredP2.push({ playerName: self.playerTwo(), scoreEntered: scoreRecord.playerTwoDart2, dartMsg: 'second dart' });
            scoresEnteredP2.push({ playerName: self.playerTwo(), scoreEntered: scoreRecord.playerTwoDart3, dartMsg: 'third dart' });

            for (var i = 0; i < scoresEnteredP1.length; i++) {
                let score = scoresEnteredP1[i].scoreEntered;
                let playerName = scoresEnteredP1[i].playerName;
                let dartMsg = scoresEnteredP1[i].dartMsg;
                let scoreErrorMsg = getValidUpScoreError(true, score, playerName, dartMsg);
                errorMessageP1 += scoreErrorMsg;
            }

            for (var i = 0; i < scoresEnteredP2.length; i++) {
                let score = scoresEnteredP2[i].scoreEntered;
                let playerName = scoresEnteredP2[i].playerName;
                let dartMsg = scoresEnteredP2[i].dartMsg;
                let scoreErrorMsg = getValidUpScoreError(true, score, playerName, dartMsg);
                errorMessageP2 += scoreErrorMsg;
            }

            scoreRecord.playerOneErrorMessage = errorMessageP1;
            scoreRecord.playerTwoErrorMessage = errorMessageP2;
            
            if (scoreRecord.playerOneErrorMessage !== '' || scoreRecord.playerTwoErrorMessage !== '')
                hasErrors = true;
            else {
                scoreRecord.playerOneScore = parseFloat(scoreRecord.playerOneDart1) + parseFloat(scoreRecord.playerOneDart2) + parseFloat(scoreRecord.playerOneDart3);
                scoreRecord.playerTwoScore = parseFloat(scoreRecord.playerTwoDart1) + parseFloat(scoreRecord.playerTwoDart2) + parseFloat(scoreRecord.playerTwoDart3);

                p1Total += parseFloat(scoreRecord.playerOneScore);
                p2Total += parseFloat(scoreRecord.playerTwoScore);

                if (!checkUpScore(self.playerOne(), parseFloat(self.currentPlayerOneUpScore()) - p1Total)) {
                    hasErrors = true;
                }

                if (!checkUpScore(self.playerTwo(), parseFloat(self.currentPlayerOneUpScore()) - p2Total)) {
                    hasErrors = true;
                }
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
        let match = ko.utils.arrayFirst(self.scoreTargets(), function (item) {
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
        let tally = 0;

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
        let winnersName = '';

        //check if every score equals 3, then this player is a winnerCandidate
        let allP1IsChecked = self.scoreTargets().every(function (scoreRecord) {
            return scoreRecord.p1Score === 3;
        });

        let allP2IsChecked = self.scoreTargets().every(function (scoreRecord) {
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
    updateKillerScore = function (playerId, countChanger) {
        let match = ko.utils.arrayFirst(self.killerScores(), function (item) {
            return item.playerId === playerId;
        });

        //only add until max is hit
        if (match.livesRemaining + countChanger <= self.numberOfKillerLives()) {
            match.livesRemaining += countChanger;
        }

        //determine if player is killer
        if (match.livesRemaining === self.numberOfKillerLives()) {
            match.isKiller = true;
        }
        else {
            match.isKiller = false;
        }

        //determine if player is out
        if (match.livesRemaining < 0) {
            match.isOut = true;
        }

        self.killerScores.refresh(match); //refresh observable array

        checkKillerWinner();     
    };
    killerSetupHasErrors = function () {
        //check if every assigned number is within the allowed range and make sure the player name is not blank
        let hasErrors = false;

        $.each(self.killerScores(), function (i, record) {
            let assigned = record.assignedNumber;
            record.errorMessage = validateDartNumber(assigned);

            if (record.playerName.trim() === '') {
                record.errorMessage = record.errorMessage + "</br>Player Name cannot be blank.";
            }
            
            //check if every player has a unique assigned number
            let otherPlayers = self.killerScores().filter(function (r) { return r.playerId !== record.playerId; });
            let isUnique = otherPlayers.every(function (unique) {
                return parseFloat(unique.assignedNumber) !== parseFloat(assigned);
            });

            if (!isUnique) {
                record.errorMessage = record.errorMessage + "</br>This number is already assigned to another player.";
            }

            if (record.errorMessage !== '')
                hasErrors = true;

            self.killerScores.refresh(record); //refresh observable array to show errors
        });  

        return hasErrors;
    };
    checkKillerWinner = function () {
        let winnersName = '';

        //get an array of all players still alive
        let playersStillAlive = self.killerScores().filter(function (record) {
            return !record.isOut;
        });

        if (playersStillAlive.length === 1) {
            winnersName = playersStillAlive[0].playerName;
            self.winningPlayer(winnersName);
        }
    };

})(jQuery);

$(function () {
    ko.applyBindings();
}); //END DOCUMENT READY FUNCTION