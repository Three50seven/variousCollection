//HORSE RACING CONSTRUCTORS
MODULES.Constructors.HorseRacing = (function () {
    return {
        Horse: function (id, polePosition, odds, oddsRatio, horseName, isSelected, classList, currentDistance, currentSpeed, finishTime, finishLengthsBack) {
            this.Id = id;
            this.PolePosition = polePosition;
            this.Odds = odds;
            this.OddsRatio = oddsRatio;
            this.HorseName = horseName;
            this.IsSelected = isSelected;
            this.ClassList = classList;
            this.CurrentDistance = currentDistance;
            this.CurrentSpeed = currentSpeed;
            this.FinishTime = finishTime;
            this.FinishLengthsBack = finishLengthsBack;
            this.RacePosition = polePosition;
            this.TotalSpeed = 0;
            this.AverageSpeed = 0;
        },
        Race: function (id, raceNumber, horses, isStarted, isCompleted, results, sortDirection, sortBy) {
            this.Id = id;
            this.RaceNumber = raceNumber;            
            this.Horses = horses;
            this.IsStarted = isStarted;
            this.IsCompleted = isCompleted;
            this.Results = results;
            this.SortDirection = sortDirection;
            this.SortBy = sortBy;
            this.SortCount = 0;
            this.Bet = ""; //TODO: temporarily hold the bet details for a race until players and bets are added (see below constructors)
            this.RaceResultMessage = ""; //TODO: temporarily hold the bet results until players and bets are added (similar to this.Bet)
        },
        //TODO: Add multiple players and bets per player
        Player: function (id, playerName, bets, accountAmount) {
            this.Id = id;
            this.PlayerName = playerName;
            this.Bets = bets;
            this.AccountAmount = accountAmount;
        },
        Bet: function (id, raceNumber, betAmount, betTypeId, horseSelected) {
            this.Id = id;
            this.RaceNumber = raceNumber;
            this.BetAmount = betAmount;
            this.betTypeId = betTypeId;
            this.horseSelected = horseSelected;
        }
    };
})();