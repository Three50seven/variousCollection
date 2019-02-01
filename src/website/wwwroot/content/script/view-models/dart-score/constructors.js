//DART-SCORE CONSTRUCTORS
MODULES.Constructors.DartScore = (function () {
    return {
        UpScore: function (round, playerOneScore, playerTwoScore, playerOneErrorMessage, playerTwoErrorMessage) {
            this.round = round;
            this.playerOneScore = playerOneScore;
            this.playerTwoScore = playerTwoScore;
            this.playerOneErrorMessage = playerOneErrorMessage;
            this.playerTwoErrorMessage = playerTwoErrorMessage;
        }
    };
})();