//HORSE RACING CONSTRUCTORS
MODULES.Constructors.HorseRacing = (function () {
    return {
        Horse: function (id, polePosition, odds, oddsRatio, horseName, isSelected, classList, currentDistance) {
            this.Id = id;
            this.PolePosition = polePosition;
            this.Odds = odds;
            this.OddsRatio = oddsRatio;
            this.HorseName = horseName;
            this.IsSelected = isSelected;
            this.ClassList = classList;
            this.CurrentDistance = currentDistance;
        },
        Race: function (id, raceNumber, horses, isCompleted, results, sortDirection, sortBy) {
            this.Id = id;
            this.RaceNumber = raceNumber;            
            this.Horses = horses;
            this.IsCompleted = isCompleted;
            this.Results = results;
            this.SortDirection = sortDirection;
            this.SortBy = sortBy;
            this.SortCount = 0;
        }
    };
})();