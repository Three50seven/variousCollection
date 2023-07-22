//HORSE RACING CONSTRUCTORS
MODULES.Constructors.HorseRacing = (function () {
    return {
        Horse: function (id, polePosition, odds, oddsRatio, jockeyRating, trainerRating, horseName, isSelected, classList, currentDistance, currentSpeed, finishTime, finishLengthsBack) {
            this.Id = id;
            this.PolePosition = polePosition;
            this.Odds = odds;
            this.OddsRatio = oddsRatio;
            this.JockeyRating = jockeyRating;
            this.TrainerRating = trainerRating;
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
            this.Boosts = 0;
        },
        Race: function (id, raceNumber, speedAdjustmentInterval, horses, isStarted, isCompleted, results, sortDirection, sortBy) {
            this.Id = id;
            this.RaceNumber = raceNumber;
            this.SpeedAdjustmentInterval = speedAdjustmentInterval; //At this interval, a horses speed will potentially get a boost or reduction, depending on ratings and odds - this value is used to determine the TrackCondition
            this.Horses = horses;
            this.IsStarted = isStarted;
            this.IsCompleted = isCompleted;
            this.Results = results;
            this.SortDirection = sortDirection;
            this.SortBy = sortBy;
            this.SortCount = 0;
        },
        //TODO: Add multiple players and bets per player
        Player: function (id, playerNumber, playerName, bets, accountBalance) {
            this.Id = id;
            this.PlayerNumber = playerNumber;
            this.PlayerName = playerName;
            this.Bets = bets;
            this.AccountBalance = accountBalance;
        },
        Bet: function (id, raceId, raceNumber, betAmount, totalCost, betType, horseSelected, payout) {
            this.Id = id;
            this.RaceId = raceId;
            this.RaceNumber = raceNumber;
            this.BetAmount = betAmount;
            this.TotalCost = totalCost;
            this.BetType = betType;
            this.HorseSelected = horseSelected;
            this.Payout = payout;
            this.BetDisplayText = ""; //hold the bet details, e.g.; $2.00 to WPS on Horse #1 for Race 1. Total Cost of Bet: $6.00
            this.BetResultMessage = ""; //holds the bet results in friendly text, e.g. Congratulations! Horse #1 placed! You won $3.40 on Race #1.
        }
    };
})();