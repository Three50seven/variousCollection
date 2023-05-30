//HORSE RACING CONSTRUCTORS
MODULES.Constructors.HorseRacing = (function () {
    return {
        Horse: function (id, polePosition, odds, horseName, isSelected, classList) {
            this.Id = id;
            this.PolePosition = polePosition;
            this.Odds = odds;
            this.HorseName = horseName;
            this.IsSelected = isSelected;
            this.ClassList = classList;
        },
        Race: function (id, raceNumber, horses) {
            this.Id = id;
            this.RaceNumber = raceNumber;
            this.Horses = horses;
        }
    };
})();