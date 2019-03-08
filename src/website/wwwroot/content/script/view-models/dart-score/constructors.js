//DART-SCORE CONSTRUCTORS
MODULES.Constructors.DartScore = (function () {
    return {
        UpScore: function (round, playerOneScore, playerTwoScore, playerOneErrorMessage, playerTwoErrorMessage) {
            this.round = round;
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
        KillerScore: function (playerId, playerName, assignedNumber, livesRemaining, isKiller, isOut) {
            this.playerId = playerId;
            this.playerName = playerName;
            this.assignedNumber = assignedNumber;
            this.livesRemaining = livesRemaining;
            this.isKiller = isKiller;
            this.isOut = isOut;
        }
    };
})();