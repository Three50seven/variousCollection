(function () {
    const ODDS_LIMITER = 99,
        NUMBER_OF_RACES = 10,
        MIN_HORSES = 3, // at least 3 horses are required for race, with a max of 24
        MAX_HORSES = 24,
        COMMON_MAX_HORSES = 10,
        MAX_ICON_MOVEMENT = 5,
        MIN_BET = 2,
        TRACK_LENGTH = 1000, // length of track to reach finish line
        ICON_HEIGHT = 20, // height of an icon - setting here, since elements added to DOM do not have a height, this needs to match the horse-racing.css class .pole-position height property
        ICON_WIDTH = 20, // width of horse icon - used in determining if a horse if finished with a race, this needs to match the .pole-position width
        TRACK_FINISH_LINE = TRACK_LENGTH - ICON_WIDTH, // distance a horse needs to run in order to complete a race
        RACE_INTERVAL_SPEED = 100, // controls how fast the horses move on the track (e.g. 1000 = horse is moved every second), lower numbers = faster movements, higher numbers = slower movements
        TRACK_SCROLL_SPEED = 2.9, // higher number makes the track scroll faster as the horse icons are moved per interval
        WIN_MULTIPLIER = 1, // TODO: factor in a betting or facility fee, also we may want to adjust these multipliers to make them more realistic
        PLACE_MULTIPLIER = .5,
        SHOW_MULTIPLIER = .25,
        JOCKEY_RATING_BOOST = 3, // any horse with a jockey rating >= JOCKEY_RATING_BOOST will potentially get a speed boost at certain intervals
        JOCKEY_RATING_REDUCTION = 2, // a really bad jockey rating will potentially lower the horses speed at certain intervals of the race
        TRAINER_RATING_BOOST = 3,
        TRAINER_RATING_REDUCTION = 2,
        ODDS_SPEED_REDUCTION = 20, // when a horses odds ratio is >= to ODDS_SPEED_REDUCTION, they will potentially have a speed reduction
        MAX_NUMBER_OF_PLAYERS = 100; // cap players at this amount

    let model = new Object;

    model.RaceInterval = new Object;
    model.RaceTime = 0;

    model.HorseId = 0;
    model.HorseIcons = new Object;
    model.CurrentRace = new Object;
    model.CurrentRace.SortBy = "";
    model.CurrentRace.SortDirection = "";
    model.CurrentRace.SortCount = 0;
    model.CurrentRaceResults = new Object;
    model.CurrentRaceToRun = new Object;    
    model.AccountBalance = 1000;

    // Betting properties
    model.BetAmount = MIN_BET,
        model.BetTypes = MODULES.DataSets.BET_TYPES,
        model.SelectedBetTypeId = 1,
        model.HorseSelected = 0,
        model.BetId = 1,
        model.PlayerBetsFilter = MODULES.DataSets.BET_FILTERS[0], //all
        model.BetFilters = MODULES.DataSets.BET_FILTERS;

    model.ErrorMessage = "";
    model.PlayerErrorMessage = "";
    model.FinishOrder = [];
    model.RaceMenuIsShowing = false;
    model.RaceIsStarted = false;
    model.Races = new Object;
    model.LiveRacePositions = [];
    model.RaceCounter = 0;

    //Players
    model.Players = [];
    model.NumberOfPlayers = 1;
    model.CurrentPlayer = new Object;
    model.StartingAccountBalance = 1000;
    model.PlayerMenuIsShowing = false;
    model.IsEditingPlayerName = false;

    // Custom Vue Components:
    let sortComponent = {
        template: "#sorting-column-template",
        props: {
            text: {
                type: String,
                required: true
            },
            column: {
                type: String,
                required: true
            },
            sortBy: {
                type: String,
                required: true
            },
            direction: {
                type: String,
                required: true
            }
        },
        computed: {
            IsCurrentSort: function () {
                return this.sortBy === this.column;
            },
            SortDirectionClass: function () {
                return this.FullDirection;
            },
            FullDirection: function () {
                return this.direction === "asc" ? "ascending" : "descending";
            }
        },
        methods: {
            OnClick: function () {
                let direction = this.direction;

                if (this.IsCurrentSort) {
                    direction = direction === "asc" ? "desc" : "asc";
                }

                this.$emit("sort-click", {
                    SortBy: this.column,
                    Direction: direction
                });
            }
        }
    }

    let bettingRowComponent = {
        template: "#betting-row-template",
        props: {
            value: {
                type: Object,
                required: true
            },
            raceIsStarted: {
                type: Boolean,
                required: false
            }
        },
        data: function () {
            let data = this.value;
            data.RaceIsStarted = this.raceIsStarted;

            return data;
        },
        methods: {
            Select: function () {
                let data = this;

                data.$emit("row-selected", data);
            }
        }
    }

    let payoutRowComponent = {
        template: "#payout-row-template",
        props: {
            value: {
                type: Object,
                required: true
            },
            position: {
                type: Number,
                required: true
            },
            horseCount: {
                type: Number,
                required: true
            }
        },
        data: function () {
            let data = this.value;
            data.Position = this.position;
            data.HorseCount = this.horseCount;

            return data;
        },
        computed: {
            WinPayout: function () {
                if (this.Position === 1)
                    return UTILITIES.CurrencyFormatter(MIN_BET * this.OddsRatio + MIN_BET);
                else
                    return "";
            },
            PlacePayout: function () {
                if (this.Position === 1 || this.Position === 2)
                    return UTILITIES.CurrencyFormatter(MIN_BET * this.OddsRatio * PLACE_MULTIPLIER + MIN_BET);
                else
                    return "";
            },
            ShowPayout: function () {
                if  (this.HorseCount > 3 && (this.Position === 1 || this.Position === 2 || this.Position === 3))
                    return UTILITIES.CurrencyFormatter(MIN_BET * this.OddsRatio * SHOW_MULTIPLIER + MIN_BET);
                else
                    return "";
            }
        }
    }

    let resultRowComponent = {
        template: "#result-row-template",
        props: {
            value: {
                type: Object,
                required: true
            },
            position: {
                type: Number,
                required: true
            }
        },
        data: function () {
            let data = this.value;
            data.Position = this.position;

            return data;
        },
        methods: {
            GetNumberWithEnding: function (number) {
                return UTILITIES.getNumberWithEnding(number);
            }
        }
    }

    let liveRowComponent = {
        template: "#live-row-template",
        props: {
            value: {
                type: Object,
                required: true
            }
        },
        data: function () {
            let data = this.value;
            return data;
        },
        methods: {
            GetNumberWithEnding: function (number) {
                return UTILITIES.getNumberWithEnding(number);
            }
        }
    }

    let playerMenuComponent = {
        template: "#player-menu-template",
        props: ["value"],

        data: function () {
            return this.value;
        },
        methods: {
            Select: function () {
                let data = this;

                data.$emit("player-selected", data.Id);
            }
        }
    }    

    let raceMenuComponent = {
        template: "#race-menu-template",
        props: {
            value: {
                type: Object,
                required: true
            },
            nextRace: {
                type: Object,
                required: true
            }
        },
        data: function () {
            let data = this.value;
            data.NextRace = this.nextRace;

            return data;
        },
        computed: {
            RaceIndicatorText: function () {
                if (this.IsCompleted)
                    return "official";
                else if (this.IsStarted)
                    return "OFF";
                else if (this.Id === this.nextRace.Id)
                    return "1 MTP";
                else
                    return "";
            }
        },
        methods: {
            Select: function () {
                let data = this;

                data.$emit("race-selected", data.Id);
            }
        }
    }

    let playerBetComponent = {
        template: "#player-bet-template",
        props: {
            value: {
                type: Object,
                required: true
            },
            nextRace: {
                type: Object,
                required: true
            }
        },
        data: function () {
            let data = this.value;

            return data;
        },
        computed: {
            ShowCancelButton: function () {
                return this.Payout == 0
                    && !this.nextRace.IsStarted;
            }
        },
        methods: {
            Cancel: function () {
                let data = this;

                data.$emit("bet-cancelled", data);
            },
            GetFormattedCurrency: function (number) {
                return UTILITIES.CurrencyFormatter(number);
            }
        }
    }

    // Vue.js Model:
    Vue.createApp({
        data: function () {
            return model;
        },
        components: {
            "betting-row": bettingRowComponent,
            "payout-row": payoutRowComponent,
            "result-row": resultRowComponent,
            "live-row": liveRowComponent,
            "player-menu": playerMenuComponent,
            "race-menu": raceMenuComponent,
            "sorting-column": sortComponent,
            "player-bet": playerBetComponent
        },
        watch: {
            //TODO: Leaving here for example for now
            //"CurrentRaceToRun.RaceNumber": {
            //    handler: function () {
            //        this.CurrentRaceToRun.SortCount++;
            //    },
            //    deep: true
            //},
            "CurrentRace.Horses": function () {
                this.CurrentRace.SortCount++;
            },
            "CurrentRace": function () {
                this.RaceCounter++;
            },
            "CurrentRace.IsStarted": function () {
                this.RaceCounter++;
            }
        },
        computed: {
            BetIsValid: function () {
                this.ValidateBet();

                return this.SelectedBetTypeId
                    && this.HorseSelected
                    && this.CurrentPlayer.PlayerNumber
                    && this.CurrentRace.Id >= this.CurrentRaceToRun.Id
                    && this.TotalCostOfBet <= this.CurrentPlayer.AccountBalance
                    && this.BetAmount >= MIN_BET;
            },            
            FavoritesInCurrentRace: function () {
                return this.GetSortedCurrentHorses("OddsRatio", "asc");
            },
            FavoriteInCurrentRace: function () {
                return this.FavoritesInCurrentRace[0].Id;
            },
            CurrentRaceResultsIsEmpty: function () {
                return Object.keys(this.CurrentRaceResults).length === 0;
            },
            SelectedBetType: function () {
                if (this.SelectedBetTypeId <= 0)
                    return "N/A - Bet Type Not Selected";

                return MODULES.DataSets.BET_TYPES.find(({ Id }) => Id === parseInt(this.SelectedBetTypeId));
            },
            TotalCostOfBet: function () {
                let data = this,
                    totalCostOfBet = data.BetAmount;

                if (this.SelectedBetTypeId === 4)
                    totalCostOfBet = totalCostOfBet * 3;

                return totalCostOfBet;
            },
            ActivePlayerBets: function () {
                let data = this,
                    filteredBets = [];

                if (data.CurrentPlayer && data.CurrentPlayer.Bets)
                    filteredBets = data.CurrentPlayer.Bets.filter(({ Payout }) => Payout === 0);
                
                return filteredBets;
            },
            FilteredPlayerBets: function () {                
                let data = this,
                    filteredBets = [];

                switch (data.PlayerBetsFilter.Id) {
                    case 1: //All
                        filteredBets = data.CurrentPlayer.Bets;
                        break;
                    case 2: //Active
                        filteredBets = data.CurrentPlayer.Bets.filter(({ Payout }) => Payout === 0);
                        break;
                    case 3: //Completed
                        filteredBets = data.CurrentPlayer.Bets.filter(({ Payout }) => Payout != 0);
                        break;
                    default:
                        filteredBets = [];
                        break;
                }
                if (!filteredBets)
                    filteredBets = [];

                return filteredBets;               
            },
            RaceTimeToPost: function () {
                if (this.RaceIsStarted)
                    return "OFF";
                else
                    return "1 MTP";
            },
            PreviousRaceText: function () {
                let previousRaceNumber = isNaN(this.CurrentRace.RaceNumber) ? 0 : this.CurrentRace.RaceNumber - 1;
                if (previousRaceNumber > 0)
                    return "R" + previousRaceNumber;
                else
                    return "";
            },
            NextRaceText: function () {
                let nextRaceNumber = isNaN(this.CurrentRace.RaceNumber) ? 2 : this.CurrentRace.RaceNumber + 1;
                if (nextRaceNumber <= NUMBER_OF_RACES)
                    return "R" + nextRaceNumber;
                else
                    return "";
            },
            TrackCondition: function () {
                let raceSpeedAdjInterval = this.CurrentRace.SpeedAdjustmentInterval,
                    trackConditions = [{ Id: 1, Name: "Fast" }, { Id: 2, Name: "Wet Fast" }, { Id: 3, Name: "Good" },
                        { Id: 4, Name: "Muddy" }, { Id: 5, Name: "Sloppy" }, { Id: 6, Name: "Slow" }, { Id: 7, Name: "Sealed" }];

                if (raceSpeedAdjInterval <= 50)
                    return trackConditions.find(({ Name }) => Name === "Fast").Name;
                else if (raceSpeedAdjInterval > 50 && raceSpeedAdjInterval <= 80)
                    return trackConditions.find(({ Name }) => Name === "Wet Fast").Name;
                else if (raceSpeedAdjInterval > 80 && raceSpeedAdjInterval <= 100)
                    return trackConditions.find(({ Name }) => Name === "Sealed").Name;
                else if (raceSpeedAdjInterval > 100 && raceSpeedAdjInterval <= 125)
                    return trackConditions.find(({ Name }) => Name === "Good").Name;
                else if (raceSpeedAdjInterval > 125 && raceSpeedAdjInterval <= 150)
                    return trackConditions.find(({ Name }) => Name === "Muddy").Name;
                else if (raceSpeedAdjInterval > 150 && raceSpeedAdjInterval <= 175)
                    return trackConditions.find(({ Name }) => Name === "Sloppy").Name;
                else if (raceSpeedAdjInterval > 175)
                    return trackConditions.find(({ Name }) => Name === "Slow").Name;
            }
        },
        methods: {
            Initialize: function () {
                let data = this;

                data.SetupPlayers();

                //setup a horse race (pick the horses etc.)
                data.SetupRaces();
            },
            GetSortedCurrentHorses: function (sortBy, sortDirection) {
                let data = this;

                data.CurrentRace.SortDirection = sortDirection;
                data.CurrentRace.SortBy = sortBy;

                return data.CurrentRace.Horses = data.CurrentRace.Horses.toSortedArray(sortBy, sortDirection);
            },
            SortHorses: function (sort) {
                let data = this;

                data.GetSortedCurrentHorses(sort.SortBy, sort.Direction);
            },
            AddPlayer: function () {
                let data = this,
                    addPlayerBtn = document.getElementById("add-player-btn"),
                    playerArrayLength = data.Players.length;
                                    
                if (playerArrayLength >= MAX_NUMBER_OF_PLAYERS) {
                    data.PlayerErrorMessage = "Maximum number of players reached!";
                    return;
                }

                let newPlayer = new MODULES.Constructors.HorseRacing.Player(
                    playerArrayLength,
                    playerArrayLength + 1,
                    UTILITIES.getRandomAnimalWithAdjective(true),
                    [],
                    data.StartingAccountBalance
                );

                data.AddItemTranform(addPlayerBtn);                

                data.Players.push(newPlayer);
            },
            AddItemTranform: function (element) {
                element.classList.add("transform-active");

                //remove the transform after 1s
                setTimeout(function () {
                    element.classList.remove("transform-active");
                }, 1000);   
            },
            SetupPlayers: function () {
                let data = this;

                data.Players = Array(data.NumberOfPlayers).fill(null).map((_, i) => {
                    return new MODULES.Constructors.HorseRacing.Player(i, i + 1, UTILITIES.getRandomAnimalWithAdjective(true), [], data.StartingAccountBalance);
                });

                //start with the first player
                data.CurrentPlayer = data.Players[0];
            },
            SetupRaces: function () {
                let data = this,
                    allHorsesInAllRaces = [];

                data.HorseSelected = 0;

                data.Races = Array(NUMBER_OF_RACES).fill(null).map((_, i) => {
                    let speedAdjustmentInterval = UTILITIES.getRandomInt(20, 200);
                    return new MODULES.Constructors.HorseRacing.Race(i, i + 1, speedAdjustmentInterval, [], false, false, [], "asc", "", "");
                });

                data.Races.forEach((race, index) => {
                    let horseCount = UTILITIES.getRandomInt(MIN_HORSES, COMMON_MAX_HORSES);

                    // only make the 3rd, 5th, and 8th races potentially have a lot of horses to make it a bit more realistic
                    if (index == 2 || index == 4 || index == 7)
                        horseCount = UTILITIES.getRandomInt(MIN_HORSES, MAX_HORSES);

                    race.Results = [];

                    race.Horses = Array(horseCount).fill(null).map((_, i) => {
                        let pp = i + 1,
                            horseOddsLimiter = 5,
                            oddsModRandomizer = UTILITIES.getRandomInt(1, horseOddsLimiter),
                            horseName = UTILITIES.getUniqueHorseName(UTILITIES.getRandomHorseName(), allHorsesInAllRaces, MODULES.DataSets.DERBY_WINNERS.length),
                            horseOddsNumerator = UTILITIES.getRandomInt(1, horseCount),
                            horseOddsDenominator = UTILITIES.getRandomElement([1,2,5]),
                            horseOddsFraction = null,
                            jockeyRating = UTILITIES.getRandomFloat(0, 5),
                            trainerRating = UTILITIES.getRandomFloat(0, 5);

                        // add the horses name to an array to check for uniqueness between all races (since we don't realistically want a horse racing more than once per day)
                        allHorsesInAllRaces.push(horseName);

                        // only use high odds (up to 99-1) when there are more than horseOddsLimiter horses in a race
                        // using mod with random int to randomize which horses get better and worst odds, so it's not always the same pole position in each race
                        if (i % oddsModRandomizer == 0 && horseCount > horseOddsLimiter) {
                            horseOddsNumerator = UTILITIES.getRandomInt(1, ODDS_LIMITER);
                            horseOddsDenominator = 1;
                        }

                        // reduce the fraction
                        horseOddsFraction = UTILITIES.reduceFraction(horseOddsNumerator, horseOddsDenominator);

                        data.HorseId++;

                        return new MODULES.Constructors.HorseRacing.Horse(data.HorseId, pp,
                            horseOddsFraction.Numerator + '-' + horseOddsFraction.Denominator,
                            horseOddsFraction.Numerator / horseOddsFraction.Denominator,
                            jockeyRating, trainerRating, horseName, false, "pole-position pp" + pp, 0, 0, 0, 0);                        
                    });
                });                

                //start with the first race
                data.CurrentRace = data.Races[0];
                data.CurrentRaceToRun = data.Races[0];               

                data.SelectRace(data.CurrentRace.Id);

                data.SetupNextRace();
            },
            SetupNextRace: function () {
                let data = this,
                    trackHeight = 0,
                    horseTrack = document.getElementById("horse-track"),
                    finishLine = document.createElement("div");
                //numberOfTrackMarkers = 4,
                //markerMargin = 0;

                //remove the track after a race so the next race can be setup
                horseTrack.innerHTML = "";

                //add the finish-line marker back to the track
                horseTrack.appendChild(finishLine);                

                //for each horse, create an icon (in this case a div) that represents the horse on the track
                data.HorseIcons = Array(data.CurrentRaceToRun.Horses.length).fill(null).map((_, i) => {
                    return document.createElement("div");
                });

                // Setup the icons that represent a horse.
                data.HorseIcons.forEach((icon, index) => {
                    let polePosition = index + 1;
                    icon.style.left = "0px";
                    icon.innerHTML = polePosition;
                    icon.classList.add("pole-position");
                    icon.classList.add("pp" + polePosition);
                    icon.classList.add("horse-racing-icon");
                    icon.id = "pp" + polePosition;
                    polePosition++;

                    //add the icons to the track
                    horseTrack.appendChild(icon);
                    trackHeight = trackHeight + ICON_HEIGHT;
                });

                //set the finish-line id and set the height of track with horses on it
                finishLine.id = "finish-line";
                finishLine.style.height = trackHeight;

                ////add track markers to the track                               
                //for (let i = 0; i < numberOfTrackMarkers; i++) {
                //    let trackMarker = document.createElement("span");

                //    trackMarker.className = "track-marker";
                //    markerMargin += parseInt(horseTrack.clientWidth) / numberOfTrackMarkers;
                //    trackMarker.style.marginLeft = markerMargin + "px";
                //    trackMarker.style.height = trackHeight;
                //    //trackMarker.style.left = markerMargin + "px";
                //    trackMarker.id = "track-marker-" + i;
                //    horseTrack.appendChild(trackMarker);
                //}                
            },
            NextPlayer: function () {
                let data = this,
                    currentPlayerId = data.CurrentPlayer.Id;

                currentPlayerId++;

                if (currentPlayerId <= data.NumberOfPlayers - 1)
                    data.SelectPlayer(currentPlayerId);
            },
            PreviousPlayer: function () {
                let data = this,
                    currentPlayerId = data.CurrentPlayer.Id;

                currentPlayerId--;

                if (currentPlayerId >= 0)
                    data.SelectPlayer(currentPlayerId);
            },
            ShowPlayerMenu: function () {
                let data = this;

                data.PlayerMenuIsShowing = !data.PlayerMenuIsShowing;
            },
            EditPlayerName: function () {
                let data = this;

                data.IsEditingPlayerName = !data.IsEditingPlayerName;
            },
            SelectPlayer: function (playerId) {
                let data = this;

                data.CurrentPlayer = data.Players[playerId];

                //hide the player menu if it was used to select a player
                if (data.PlayerMenuIsShowing)
                    data.PlayerMenuIsShowing = false;
            },
            NextRace: function () {
                let data = this,
                    currentRaceId = data.CurrentRace.Id;

                currentRaceId++;

                if (currentRaceId <= NUMBER_OF_RACES - 1)
                    data.SelectRace(currentRaceId);

                // show the betting tab if the user is going to the current race to run
                if (data.CurrentRaceToRun.Id == currentRaceId)
                    data.ShowBetting();
            },
            PreviousRace: function () {
                let data = this,
                    currentRaceId = data.CurrentRace.Id;

                currentRaceId--;

                if (currentRaceId >= 0)
                    data.SelectRace(currentRaceId);
            },
            ShowRaceMenu: function () {
                let data = this;

                data.RaceMenuIsShowing = !data.RaceMenuIsShowing;
            },
            SelectRace: function (raceId) {
                let data = this;

                data.CurrentRace = data.Races[raceId];
                data.CurrentRaceResults = data.CurrentRace.Results;

                //reset BetTypeId and disable Show and WPS betting when there are less than 4 horses:
                data.BetTypes.forEach((type) => {
                    if (data.CurrentRace.Horses.length < 4 && (type.Name == 'Show' || type.Name == 'WPS')) {
                        data.SelectedBetTypeId = 0;
                        type.disabled = true;
                    }
                    else
                        type.disabled = false;
                });

                //hide the race menu if it was used to select a race
                if (data.RaceMenuIsShowing)
                    data.RaceMenuIsShowing = false;
            },
            Race: function () {
                let data = this,
                    currentRaceId = data.CurrentRaceToRun.Id,
                    raceFavorites = data.CurrentRaceToRun.Horses.toSortedArray("OddsRatio", "asc"),
                    trackContainer = document.getElementById('track-container'),
                    progressIndicator = document.getElementById('race-range-progress');

                // flag that the race has started
                data.RaceIsStarted = true;
                data.CurrentRaceToRun.IsStarted = true;                

                // check if a horse is finished
                function isFinished(icon) {
                    return parseInt(icon.style.left) >= TRACK_FINISH_LINE;
                }

                console.log("speedAdjustmentInterval", data.CurrentRaceToRun.SpeedAdjustmentInterval);

                // Create an interval that will move the icons horizontally.
                data.RaceInterval = setInterval(() => {
                    data.RaceTime++;

                    data.UpdateTrackScroller(trackContainer);
                    data.UpdateRaceProgress(progressIndicator);

                    // Move each icon by a different random amount between 1 and 5.
                    data.HorseIcons.forEach((icon, i) => {
                        let currentIconPosition = parseInt(icon.style.left)

                        //add animated gif for moving horse
                        icon.classList.add("horse-racing-icon-moving");

                        //keep horse moving if it's not finished yet
                        if (currentIconPosition < TRACK_FINISH_LINE) {
                            let currentHorse = data.CurrentRaceToRun.Horses.find(({ PolePosition }) => PolePosition === parseInt(icon.id.replace("pp", ""))),
                                speedAdjustmentInterval = data.CurrentRaceToRun.SpeedAdjustmentInterval,
                                currentHorseOddsRatio = currentHorse.OddsRatio,
                                thirdHorseFavoriteOddsRatio = raceFavorites[2].OddsRatio,
                                calculatedMaxIconMovement = MAX_ICON_MOVEMENT,
                                newPosition = currentIconPosition,
                                speed = 1;

                            //if the horse odds, jockey or trainer ratings are great and x # of intervals have gone by, the horse has a possibility of moving a bit faster
                            //alternatively, they have a potential to move a bit slower if their odds, jockey, or trainer rating are poor
                            if (data.RaceTime % speedAdjustmentInterval == 0) {
                                if (currentHorseOddsRatio <= thirdHorseFavoriteOddsRatio)
                                    calculatedMaxIconMovement += 1;

                                if (currentHorseOddsRatio >= ODDS_SPEED_REDUCTION)
                                    calculatedMaxIconMovement -= 1;

                                if (currentHorse.JockeyRating >= JOCKEY_RATING_BOOST)
                                    calculatedMaxIconMovement += 1;

                                if (currentHorse.JockeyRating <= JOCKEY_RATING_REDUCTION)
                                    calculatedMaxIconMovement -= 1;

                                if (currentHorse.TrainerRating >= TRAINER_RATING_BOOST)
                                    calculatedMaxIconMovement += 1;

                                if (currentHorse.TrainerRating <= TRAINER_RATING_REDUCTION)
                                    calculatedMaxIconMovement -= 1;
                            }

                            speed = UTILITIES.getRandomInt(1, calculatedMaxIconMovement);
                            newPosition = currentIconPosition + speed;

                            if (calculatedMaxIconMovement != MAX_ICON_MOVEMENT)
                                console.log(`Horse speed for #${currentHorse.PolePosition} - ${currentHorse.HorseName} was affected. calculatedMaxIconMovement: ${calculatedMaxIconMovement} Speed:${speed}`);

                            if (speed > MAX_ICON_MOVEMENT)
                                currentHorse.Boosts++;
                            //console.log(`
                            //    HorsePP/Name: ${currentHorse.PolePosition}/${currentHorse.HorseName}) 
                            //    OddsRatio: ${currentHorseOddsRatio} thirdHorseFavoriteOddsRatio: ${thirdHorseFavoriteOddsRatio} 
                            //    calculatedMaxIconMovement: ${calculatedMaxIconMovement} newPosition: ${newPosition} 
                            //    got a boost; speed: ${speed}`);                         

                            icon.style.left = newPosition + "px";

                            currentHorse.CurrentDistance = newPosition;
                            currentHorse.CurrentSpeed = newPosition - currentIconPosition;
                            currentHorse.TotalSpeed = currentHorse.TotalSpeed + speed;

                            // update live race positions after a certain number of intervals has passed (instead of constantly; this is more visually appealing)
                            if (data.RaceTime % 20 === 0) {
                                let sortedByDistance = data.CurrentRaceToRun.Horses.toSortedArray("CurrentDistance", "desc");
                                let firstHorseDistance = sortedByDistance[0].CurrentDistance;

                                currentHorse.LengthsBack = (firstHorseDistance - currentHorse.CurrentDistance) / ICON_WIDTH;

                                //Setup additional properties for live race results:
                                sortedByDistance.forEach(function (horse, index) {
                                    horse.RacePosition = index + 1;
                                    horse.LiveClass = "pp" + horse.PolePosition;
                                    horse.LengthsBack = 0;
                                    horse.LengthsBack = (firstHorseDistance - horse.CurrentDistance) / ICON_WIDTH;
                                });
                                data.LiveRacePositions = sortedByDistance;
                            }

                            // After a icon has reached the end of the track, keep it at the end of the track and add it to the FinishOrder.
                            //TODO: check if there can be a tie, we should allow for ties since this can happen in real life
                            if (isFinished(icon)) {
                                currentHorse.FinishTime = data.RaceTime;
                                currentHorse.AverageSpeed = (currentHorse.TotalSpeed / currentHorse.FinishTime).toFixed(2);
                                data.FinishOrder.push(icon.id);
                                icon.style.left = TRACK_FINISH_LINE;
                            }
                        }

                        // After all horses have crossed the finish line, end the race:
                        if (data.HorseIcons.every(isFinished)) {
                            data.StopRace();                            
                            data.LiveRacePositions = [];
                            data.GetRaceResults();
                            data.RaceTime = 0; //reset the race time for the next race                            
                            currentRaceId++;
                            //when there are more races, setup the next race
                            if (currentRaceId <= NUMBER_OF_RACES - 1) {
                                data.RaceIsStarted = false; //indicate the race has ended
                                data.CurrentRaceToRun = data.Races[currentRaceId];
                                data.SetupNextRace();
                                trackContainer.scrollLeft = 0; //go back to beginning of track
                                progressIndicator.value = 0; //reset progress indicator
                            }
                        }
                    });
                }, RACE_INTERVAL_SPEED);
            },
            UpdateTrackScroller: function (trackContainer) {
                const trackContainerScrollWidth = trackContainer.scrollWidth;

                //scroll to end of track as horses move
                if (trackContainer.scrollLeft !== trackContainerScrollWidth) {
                    trackContainer.scrollTo(trackContainer.scrollLeft + TRACK_SCROLL_SPEED, 0);
                }
            },
            UpdateCirclePosition: function (progressValue) {
                let progressCircle = document.getElementById("progress-circle"),
                    pillTrack = document.getElementById("pill-track"),
                    pathLength = pillTrack.getTotalLength(); // Calculate total length of the path
                    reversedValue = 100 - progressValue; // move circle counter clockwise around track                

                // Convert percentage completion into path length
                const pointOnPath = (reversedValue / 100) * pathLength;

                // Get the coordinates of the point on the path
                const { x, y } = pillTrack.getPointAtLength(pointOnPath);

                // Move the circle to the calculated position
                progressCircle.setAttribute("cx", x);
                progressCircle.setAttribute("cy", y);
            },
            UpdateRaceProgress: function (progressIndicator) {
                let data = this,                    
                    progressValue = 0;

                const property = "CurrentDistance";

                // move the progress indicator - WIP - just using a range indicator for now - wish to change over to pill-shaped track SVG with dot indicator or something similar                
                let leadingHorse = data.CurrentRaceToRun.Horses.reduce((max, obj) => {
                    return obj[property] > max[property] ? obj : max;
                });

                progressValue = (leadingHorse.CurrentDistance / TRACK_FINISH_LINE) * 100;
                progressIndicator.value = progressValue; // the current value of the lead horse
                data.UpdateCirclePosition(progressValue); // update pill shape track progress
            },
            StopRace: function () {
                let data = this;

                clearInterval(data.RaceInterval);
            },
            ShowBetting: function () {
                let betTab = document.getElementById("pills-bet-tab");
                let placeBetSubTab = document.getElementById("pills-bet-placement-tab");

                //show the bet tab:
                betTab.click();
                placeBetSubTab.click();
            },
            ShowResults: function () {
                let resultsTab = document.getElementById("pills-results-tab");
                let resultsPayoutsTab = document.getElementById("pills-result-payouts-tab");

                //show the results tab:
                resultsTab.click();
                resultsPayoutsTab.click();
            },
            ShowRace: function () {
                let raceTab = document.getElementById("pills-race-tab");

                //show the race tab:
                raceTab.click();
            },
            GetRaceResults: function () {
                let data = this,
                    raceResults = [];

                if (data.FinishOrder.length > 0) {

                    data.FinishOrder.forEach((pp, i) => {
                        data.CurrentRaceToRun.Horses.forEach((horse) => {
                            let polePositionNumber = parseInt(pp.replace("pp", ""));

                            // calculate the lengths back for all horses that did not finish first
                            if (i > 0 && raceResults.length > 0) {
                                //TODO: This needs to be adjusted, not sure it should be divided by the icon-width - maybe by the icon movement avg. like 2.5 or something?
                                horse.FinishLengthsBack = (raceResults[0].FinishTime - horse.FinishTime) / ICON_WIDTH;
                            }

                            if (horse.PolePosition == polePositionNumber)
                                raceResults.push(horse);
                        });
                    });

                    data.CurrentRaceToRun.Results = raceResults;
                    data.CurrentRaceToRun.IsCompleted = true;
                    data.CurrentRaceResults = raceResults;

                    let raceToUpdate = data.Races.find(({ Id }) => Id === data.CurrentRaceToRun.Id);

                    if (raceToUpdate != undefined)
                        raceToUpdate.Results = raceResults;

                    //show the results tab:
                    data.ShowResults();

                    //reset finish order for next race
                    data.FinishOrder = [];

                    data.DetermineBetResults();
                }
            },
            DetermineBetResults: function () {
                let data = this;                    

                //loop through all the player bets for this race
                data.Players.forEach(player => {
                    let currentRaceBets = player.Bets.filter(({ RaceId }) => RaceId === data.CurrentRaceToRun.Id);

                    //loop through each bet and determine the results
                    currentRaceBets.forEach(bet => {
                        let betResults = 0,
                            betVerb = "came in",
                            betTie = "",
                            //winHorses = [],
                            //placeHorses = [],
                            //showHorses = [],
                            //firstHorse = data.CurrentRaceResults[0],
                            //secondHorse = data.CurrentRaceResults[1],
                            //thirdHorse = data.CurrentRaceResults[2],                            
                            //fourthHorse = data.CurrentRaceResults[3],
                            //fifthHorse = data.CurrentRaceResults[4],
                            horseOddsRatio = 0;

                        //TODO: Continue working on tie breaker
                        //winHorses.push(firstHorse);
                        //placeHorses.push(secondHorse);
                        //showHorses.push(thirdHorse);

                        //// check if there were any ties between win/place/show:
                        //if (firstHorse.FinishTime == secondHorse.FinishTime) {
                        //    winHorses.push(secondHorse);
                        //    showHorses = []; //reset show, since there will not be one during a tie
                        //    betTie = " (tied for 1st)";

                        //    if (firstHorse.FinishTime == thirdHorse.FinishTime) { //3-way ties are unlikely, but accounted for nonetheless
                        //        winHorses.push(thirdHorse);
                        //        placeHorses = []; //reset place, since there will not be one during a tie
                        //        betTie = " (tied for 1st)";
                        //    }
                        //}
                        //if (secondHorse.FinishTime == thirdHorse.FinishTime) {
                        //    placeHorses.push(thirdHorse);
                        //    showHorses = []; //reset show, since there will not be one during a tie
                        //    betTie = " (tied for 2nd)";

                        //    if (secondHorse.FinishTime == fourthHorse.FinishTime) { //3-way ties are unlikely, but accounted for nonetheless
                        //        placeHorses.push(fourthHorse);
                        //        betTie = " (tied for 2nd)";
                        //    }
                        //}
                        //if (thirdHorse.FinishTime == fourthHorse.FinishTime) {
                        //    showHorses.push(fourthHorse);
                        //    betTie = " (tied for 3rd)";

                        //    if (thirdHorse.FinishTime == fifthHorse.FinishTime) { //3-way ties are unlikely, but accounted for nonetheless
                        //        placeHorses.push(fifthHorse);
                        //        betTie = " (tied for 3rd)";
                        //    }
                        //}

                        // now set win/place/show after factoring in any ties:
                        let winHorse = data.CurrentRaceResults[0], //winHorses.find(({ PolePosition }) => PolePosition === bet.HorseSelected),
                            placeHorse = data.CurrentRaceResults[1], //placeHorses.find(({ PolePosition }) => PolePosition === bet.HorseSelected),
                            showHorse = data.CurrentRaceResults[2]; //showHorses.find(({ PolePosition }) => PolePosition === bet.HorseSelected);


                        // get the odds ratio for bet calculations
                        if (winHorse.PolePosition == bet.HorseSelected) {
                            horseOddsRatio = winHorse.OddsRatio;
                            betVerb = "won";
                        }
                        else if (placeHorse.PolePosition == bet.HorseSelected) {
                            horseOddsRatio = placeHorse.OddsRatio;
                            betVerb = "placed";
                        }
                        else if (showHorse.PolePosition == bet.HorseSelected) {
                            horseOddsRatio = showHorse.OddsRatio;
                            betVerb = "showed";
                        }      

                        switch (bet.BetType.Id) {
                            case 1: //Win
                                if (winHorse.PolePosition == bet.HorseSelected) {
                                    betResults = bet.BetAmount * horseOddsRatio * WIN_MULTIPLIER + bet.BetAmount;
                                }
                                break;
                            case 2: //Place
                                if (winHorse.PolePosition == bet.HorseSelected || placeHorse.PolePosition == bet.HorseSelected) {
                                    betResults = bet.BetAmount * horseOddsRatio * PLACE_MULTIPLIER + bet.BetAmount;
                                }
                                break;
                            case 3: //Show
                                if (winHorse.PolePosition == bet.HorseSelected
                                    || placeHorse.PolePosition == bet.HorseSelected
                                    || showHorse.PolePosition == bet.HorseSelected) {
                                    betResults = bet.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + bet.BetAmount;
                                }
                                break;
                            case 4: //WPS
                                if (winHorse.PolePosition == bet.HorseSelected) {
                                    betResults = (bet.BetAmount * horseOddsRatio * WIN_MULTIPLIER + bet.BetAmount)
                                        + (bet.BetAmount * horseOddsRatio * PLACE_MULTIPLIER + bet.BetAmount)
                                        + (bet.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + bet.BetAmount);
                                }
                                else if (placeHorse.PolePosition == bet.HorseSelected)
                                    betResults = (bet.BetAmount * horseOddsRatio * PLACE_MULTIPLIER + bet.BetAmount)
                                        + (bet.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + bet.BetAmount);
                                else if (showHorse.PolePosition == bet.HorseSelected)
                                    betResults = bet.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + bet.BetAmount;
                                break;
                            default:
                                data.ErrorMessage = "Error: Invalid Bet Type detected!";
                                break;
                        }

                        //calculate the new account balance, update bet payout and result-message
                        if (betResults > 0) {
                            player.AccountBalance = player.AccountBalance + betResults;
                            bet.Payout = betResults;
                            bet.BetResultMessage = "Congratulations! Horse #" + bet.HorseSelected + " " + betVerb + betTie + "! You won " + data.GetFormattedCurrency(betResults) + " on Race #" + data.CurrentRaceToRun.RaceNumber + ".";
                        }
                        else {
                            bet.Payout = bet.TotalCost * -1;
                            bet.BetResultMessage = "Sorry, your horse, #" + bet.HorseSelected + ", did not " + bet.BetType.Name + " in Race #" + data.CurrentRaceToRun.RaceNumber + ". You lost " + data.GetFormattedCurrency(bet.Payout) + ".";
                        }
                    });                        
                });                
            },
            ValidateBet: function () {
                let data = this;

                // clear error message first
                data.ErrorMessage = "";

                if (data.SelectedBetTypeId <= 0) {
                    data.ErrorMessage = "Please choose a Bet Type.";
                }

                if (data.HorseSelected <= 0) {
                    data.ErrorMessage = "Please choose a Horse for Race #" + data.CurrentRace.RaceNumber + ".";
                }

                if (data.TotalCostOfBet > data.CurrentPlayer.AccountBalance) {
                    data.ErrorMessage = "Insufficient funds - please choose a lower amount to bet.";
                }

                if (data.BetAmount < MIN_BET) {
                    data.ErrorMessage = "You must bet at least " + data.GetFormattedCurrency(MIN_BET) + ".";
                }

                return !data.ErrorMessage.length;
            },            
            PlaceBet: function () {
                let data = this;

                if (data.BetIsValid) {
                    let newBet = new MODULES.Constructors.HorseRacing.Bet(data.BetId++, data.CurrentRace.Id, data.CurrentRace.RaceNumber, data.BetAmount, data.TotalCostOfBet, data.SelectedBetType, data.HorseSelected, 0),
                        playerBetTab = document.getElementById("pills-bet-player-tab");

                    //deduct the amount for the bet
                    data.CurrentPlayer.AccountBalance = data.CurrentPlayer.AccountBalance - data.TotalCostOfBet;
                    
                    newBet.BetDisplayText = "Bet: " + newBet.Id + " " + data.GetFormattedCurrency(data.BetAmount) + " to " + data.SelectedBetType.Name +
                        " on Horse #" + data.HorseSelected + " for Race " + data.CurrentRace.RaceNumber + ".  Total Cost of Bet: " +
                        data.GetFormattedCurrency(data.TotalCostOfBet);

                    data.AddItemTranform(playerBetTab);  

                    //Add the bet to the player's bets
                    data.CurrentPlayer.Bets.unshift(newBet);

                    //reset the horse selected for the next race/bet
                    data.SelectHorse(0);

                    //data.ShowRace();
                }
            },
            CancelBet: function (bet, index) {
                let data = this;

                if (!data.CurrentRaceToRun.IsStarted
                    && !data.CurrentRaceToRun.IsCompleted
                    && bet.RaceNumber >= data.CurrentRaceToRun.RaceNumber) {
                    //refund bet to player account
                    data.CurrentPlayer.AccountBalance = data.CurrentPlayer.AccountBalance + bet.TotalCost;                    

                    //remove the bet from player bets
                    data.CurrentPlayer.Bets.splice(index, 1);
                }                    
            },
            SelectHorse: function (horseSelected) {
                let data = this;

                //reset IsSelected to false for all horses:
                data.Races.forEach(race => {
                    race.Horses.forEach(horse => {
                        if (horse.Id == horseSelected.Id) {
                            horse.IsSelected = true;
                        }
                        else
                            horse.IsSelected = false;
                    });
                });

                data.HorseSelected = horseSelected.PolePosition;
            },
            GetNumberWithEnding: function (number) {
                return UTILITIES.getNumberWithEnding(number);
            },
            GetFormattedCurrency: function (number) {
                return UTILITIES.CurrencyFormatter(number);
            },
            FilterPlayerBets: function (filterId) {
                let data = this;

                data.PlayerBetsFilter = data.BetFilters.find(({ Id }) => Id === parseInt(filterId));
            }
        },
        mounted: function () {
            this.Initialize();
        }
    }).mount("#horse-racing-app-wrapper");
})();