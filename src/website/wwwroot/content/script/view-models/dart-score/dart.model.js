(function ($) {
    var self = this;

    self.errors = ko.observable("");
    self.upErrors = ko.observable("");
    self.winningPlayer = ko.observable("");
    self.availableGames = ko.observableArray([MODULES.LookupTypes.DartScore.GameEnum.Cricket, MODULES.LookupTypes.DartScore.GameEnum.FiveOne, MODULES.LookupTypes.DartScore.GameEnum.Killer]);
    self.availableUpGames = ko.observableArray([MODULES.LookupTypes.DartScore.Game501Enum.Five, MODULES.LookupTypes.DartScore.Game501Enum.Three]);
    self.gameStarted = ko.observable(false);
    self.playerOne = ko.observable(MODULES.Constants.DartScore.PLAYER_ONE);
    self.playerTwo = ko.observable(MODULES.Constants.DartScore.PLAYER_TWO);

    self.selectedGame = ko.observable("");
    self.scoreTargetSeed = ko.observable(MODULES.Constants.DartScore.DEFAULT_SCORE_TARGET); //e.g. 19 will make a score board of 19 - 20 + Bull, and 1 - 20 if 1 is entered    
    self.score501 = ko.observable(MODULES.LookupTypes.DartScore.Game501Enum.Five);
    self.scoreTargets = ko.observableArray([]);
    self.scoreUpGame = ko.observableArray([]);
    self.currentUpRound = ko.observable(1);
    self.isEditingUpScore = ko.observable(false);
    self.currentPlayerOneUpScore = ko.observable(self.score501());
    self.currentPlayerTwoUpScore = ko.observable(self.score501());
    self.playerOneUpRoundScoreEntered = ko.observable(0);
    self.playerTwoUpRoundScoreEntered = ko.observable(0);
})(jQuery);