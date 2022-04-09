//DART-SCORE CONSTRUCTORS
MODULES.Constructors.DartScore = (function () {
    return {
        UpScore: function (round, playerOneDart1, playerOneDart2, playerOneDart3, playerTwoDart1, playerTwoDart2, playerTwoDart3, playerOneScore, playerTwoScore, playerOneErrorMessage, playerTwoErrorMessage) {
            this.round = round;
            this.playerOneDart1 = playerOneDart1;
            this.playerOneDart2 = playerOneDart2;
            this.playerOneDart3 = playerOneDart3;
            this.playerTwoDart1 = playerTwoDart1;
            this.playerTwoDart2 = playerTwoDart2;
            this.playerTwoDart3 = playerTwoDart3;
            this.playerOneScore = playerOneScore;
            this.playerTwoScore = playerTwoScore;
            this.playerOneErrorMessage = playerOneErrorMessage;
            this.playerTwoErrorMessage = playerTwoErrorMessage;
        },
        CricketScore: function (scoreAmount, p1Score, p1ScoreImg, p2Score, p2ScoreImg) {
            this.score = scoreAmount;
            this.p1Score = p1Score;
            this.p1ScoreImg = p1ScoreImg;
            this.p2Score = p2Score;
            this.p2ScoreImg = p2ScoreImg;
        },
        KillerScore: function (playerId, playerName, assignedNumber, livesRemaining, isKiller, isOut, errorMessage) {
            this.playerId = playerId;
            this.playerName = playerName;
            this.assignedNumber = assignedNumber;
            this.livesRemaining = livesRemaining;
            this.isKiller = isKiller;
            this.isOut = isOut;
            this.errorMessage = errorMessage;
        }
    };
})();