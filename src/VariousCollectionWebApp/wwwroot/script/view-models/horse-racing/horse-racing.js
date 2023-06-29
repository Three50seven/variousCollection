(function () {
    const ODDS_LIMITER = 99,
        MIN_HORSES = 3, //at least 3 horses are required for race, with a max of 24
        MAX_HORSES = 24,
        COMMON_MAX_HORSES = 10,
        MAX_ICON_MOVEMENT = 5,
        MIN_BET = 2,
        TRACK_LENGTH = 1000, // length of track to reach finish line
        ICON_HEIGHT = 20, //height of an icon - setting here, since elements added to DOM do not have a height, this needs to match the horse-racing.css class .pole-position height property
        ICON_WIDTH = 20, //width of horse icon - used in determining if a horse if finished with a race, this needs to match the .pole-position width
        RACE_INTERVAL_SPEED = 100, // controls how fast the divs move on the track (e.g. 1000 = horse is moved every second), lower numbers = faster movements, higher numbers = slower movements
        TRACK_SCROLL_SPEED = 3, // higher number makes the track scroll faster as the horse icons are moved per interval - TODO: this should be a ratio of RACE_INTERVAL_SPEED instead of just hard-coded
        WIN_MULTIPLIER = 1, //TODO: factor in a betting or facility fee, also we may want to adjust these multipliers to make them more realistic
        PLACE_MULTIPLIER = .5,
        SHOW_MULTIPLIER = .25;


    let model = new Object;

    model.RaceInterval = new Object;
    model.NumberOfRaces = 10,
        model.RaceTime = 0;

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
        model.SelectedBetTypeId = 0,
        model.HorseSelected = 0;

    model.ErrorMessage = "";
    model.FinishOrder = [];
    model.RaceMenuIsShowing = false;
    model.RaceIsStarted = false;
    model.Races = new Object;
    model.LiveRacePositions = [];
    model.RaceCounter = 0;

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
            }
        },
        data: function () {
            let data = this.value;
            data.Position = this.position;

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
                if (this.Position === 1 || this.Position === 2 || this.Position === 3)
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

    let raceMenuComponent = {
        template: "#race-menu-template",
        props: ["value"],

        data: function () {
            return this.value;
        },
        methods: {
            Select: function () {
                let data = this;

                data.$emit("race-selected", data.Id);
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
            "race-menu": raceMenuComponent,
            "sorting-column": sortComponent
        },
        watch: {
            //TODO: Left here for examples for now
            //"AliasUserSearchResultModel.Filter": {
            //    handler: function () {
            //        this.AliasUserSearchResultModel.FilterChanged = true;
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
                    && this.TotalCostOfBet <= this.AccountBalance
                    && this.BetAmount >= MIN_BET
                    && this.CurrentRace.Id == this.CurrentRaceToRun.Id;
            },
            PlayerHasBet: function () {
                return this.CurrentRace.Id == this.CurrentRaceToRun.Id
                    && this.CurrentRace.Bet ? this.CurrentRace.Bet.length : false;
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
            }
        },
        methods: {
            Initialize: function () {
                let data = this;

                //TODO: Setup multiple players (allow user to choose the number) so they can compete on who wins the most money after X number of races                

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
            SetupRaces: function () {
                let data = this,
                    allHorsesInAllRaces = [];

                data.HorseSelected = 0;

                data.Races = Array(data.NumberOfRaces).fill(null).map((_, i) => {
                    return new MODULES.Constructors.HorseRacing.Race(i, i + 1, [], false, false, [], "asc", "", "");
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
                            horseName = UTILITIES.getUniqueHorseName(UTILITIES.getRandomHorseName(), allHorsesInAllRaces), //TODO: Need to make sure this is working - it looks like it is still adding the same horse more than once to all the races
                            horseOddsNumerator = UTILITIES.getRandomInt(1, horseCount),
                            horseOddsDenominator = UTILITIES.getRandomInt(1, horseOddsLimiter),
                            horseOddsFraction = null;

                        // add the horses name to an array to check for uniqueness between all races (since we don't realistically want a horse racing more than once per day)
                        allHorsesInAllRaces.push(horseName);

                        // only use high odds (up to 99-1) when there are more than horseOddsLimiter horses in a race
                        if (i % 3 == 0 && i >= horseOddsLimiter) {
                            horseOddsNumerator = UTILITIES.getRandomInt(1, ODDS_LIMITER);
                            horseOddsDenominator = 1;
                        }

                        // reduce the fraction
                        horseOddsFraction = UTILITIES.reduceFraction(horseOddsNumerator, horseOddsDenominator);

                        return new MODULES.Constructors.HorseRacing.Horse(i, pp,
                            horseOddsFraction.Numerator + '-' + horseOddsFraction.Denominator,
                            horseOddsFraction.Numerator / horseOddsFraction.Denominator,
                            horseName, false, "pole-position pp" + pp, 0, 0, 0, 0);
                    });
                });

                //start with the first race
                data.CurrentRace = data.Races[0];
                data.CurrentRaceToRun = data.Races[0];                

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

                //reset BetTypeId and disable Show and WPS betting when there are less than 4 horses:
                data.BetTypes.forEach((type, index) => {                    
                    if (data.CurrentRaceToRun.Horses.length < 4 && (type.Name == 'Show' || type.Name == 'WPS')) {
                        data.SelectedBetTypeId = 0;
                        type.disabled = true;
                    }                        
                    else
                        type.disabled = false;
                });

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
            NextRace: function () {
                let data = this,
                    currentRaceId = data.CurrentRace.Id;

                currentRaceId++;

                if (currentRaceId <= data.NumberOfRaces - 1)
                    data.SelectRace(currentRaceId);

                // show the betting tab if the user is going to the current race to run
                if (data.CurrentRaceToRun.Id == currentRaceId)
                    data.ShowBetting();

                return;
            },
            PreviousRace: function () {
                let data = this,
                    currentRaceId = data.CurrentRace.Id;

                currentRaceId--;

                if (currentRaceId >= 0)
                    data.SelectRace(currentRaceId);

                return;
            },
            ShowRaceMenu: function () {
                let data = this;

                data.RaceMenuIsShowing = !data.RaceMenuIsShowing;
            },
            SelectRace: function (raceId) {
                let data = this;

                data.CurrentRace = data.Races[raceId];
                data.CurrentRaceResults = data.CurrentRace.Results;

                //hide the race menu if it was used to select a race
                if (data.RaceMenuIsShowing)
                    data.RaceMenuIsShowing = false;
            },
            Race: function () {
                let data = this,
                    currentRaceId = data.CurrentRaceToRun.Id,
                    raceFavorites = data.CurrentRaceToRun.Horses.toSortedArray("OddsRatio", "asc"),
                    trackFinishLine = TRACK_LENGTH - ICON_WIDTH;

                // flag that the race has started
                data.RaceIsStarted = true;
                data.CurrentRace.IsStarted = true;                    

                const trackContainer = document.getElementById('track-container');
                const trackContainerScrollWidth = trackContainer.scrollWidth;

                // check if a horse is finished
                function isFinished(icon) {
                    return parseInt(icon.style.left) >= trackFinishLine;
                }

                // Create an interval that will move the icons horizontally.
                data.RaceInterval = setInterval(() => {
                    data.RaceTime++;

                    //scroll to end of track as horses move
                    if (trackContainer.scrollLeft !== trackContainerScrollWidth) {
                        trackContainer.scrollTo(trackContainer.scrollLeft + TRACK_SCROLL_SPEED, 0);
                    }

                    // Move each icon by a different random amount between 1 and 5.
                    data.HorseIcons.forEach((icon, i) => {
                        let currentIconPosition = parseInt(icon.style.left)

                        //add animated gif for moving horse
                        icon.classList.add("horse-racing-icon-moving");

                        //keep horse moving if it's not finished yet
                        if (currentIconPosition < trackFinishLine) {
                            let currentHorse = data.CurrentRaceToRun.Horses.find(({ PolePosition }) => PolePosition === parseInt(icon.id.replace("pp", ""))),
                                //currentHorse = data.CurrentRaceToRun.Horses[i],
                                currentHorseOddsRatio = currentHorse.OddsRatio,
                                thirdHorseFavoriteOddsRatio = raceFavorites[2].OddsRatio,
                                calculatedMaxIconMovement = MAX_ICON_MOVEMENT,
                                newPosition = currentIconPosition,
                                speed = 1;

                            //if the horse is one of the top 3 favorites and x # of intervals have gone by, they have a possibility of moving a bit faster
                            if (data.RaceTime % 20 == 0 && currentHorseOddsRatio <= thirdHorseFavoriteOddsRatio) {
                                //TODO: Add a random number generator variable for horses with better odds, jockey, trainer, etc.
                                //TODO: check if there can be a tie, we should allow for ties since this can happen in real life
                                calculatedMaxIconMovement += 1;                               
                            }

                            speed = UTILITIES.getRandomInt(1, calculatedMaxIconMovement);
                            newPosition = currentIconPosition + speed;

                            if (speed >= MAX_ICON_MOVEMENT + 1)
                                console.log(`
                                    HorsePP/Name: ${currentHorse.PolePosition}/${currentHorse.HorseName}) 
                                    OddsRatio: ${currentHorseOddsRatio} thirdHorseFavoriteOddsRatio: ${thirdHorseFavoriteOddsRatio} 
                                    calculatedMaxIconMovement: ${calculatedMaxIconMovement} newPosition: ${newPosition} 
                                    got a boost; speed: ${speed}`);                         

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
                            if (isFinished(icon)) {
                                currentHorse.FinishTime = data.RaceTime;
                                currentHorse.AverageSpeed = (currentHorse.TotalSpeed / currentHorse.FinishTime).toFixed(2);
                                data.FinishOrder.push(icon.id);
                                icon.style.left = trackFinishLine;
                            }
                        }

                        // After all horses have crossed the finish line, end the race:
                        if (data.HorseIcons.every(isFinished)) {
                            data.StopRace();
                            data.RaceIsStarted = false; //indicate the race has ended
                            data.LiveRacePositions = [];
                            data.GetRaceResults();
                            data.RaceTime = 0; //reset the race time for the next race
                            currentRaceId++;
                            if (currentRaceId <= data.NumberOfRaces - 1) {
                                data.CurrentRaceToRun = data.Races[currentRaceId];
                                data.SetupNextRace();
                                trackContainer.scrollLeft = 0; //go back to beginning of track
                            }
                        }
                    });
                }, RACE_INTERVAL_SPEED);
            },
            StopRace: function () {
                let data = this;
                
                clearInterval(data.RaceInterval);
            },
            ShowBetting: function () {
                let betTab = document.getElementById("pills-bet-tab");

                //show the bet tab:
                betTab.click();
            },
            ShowResults: function () {
                let resultsTab = document.getElementById("pills-results-tab");
                let resultsDetailsTab = document.getElementById("pills-result-details-tab");
                let resultsPayoutsTab = document.getElementById("pills-result-payouts-tab");

                //show the results tab:
                resultsTab.click();
                resultsDetailsTab.click(); //click details first so that payouts becomes "active", otherwise grid will not display right away in DOM
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

                    if (data.PlayerHasBet)
                        data.DetermineBetResults();
                }
            },
            DetermineBetResults: function () {
                let data = this,
                    betResults = 0,
                    betVerb = "came in",
                    winHorse = data.CurrentRaceResults[0],
                    placeHorse = data.CurrentRaceResults[1],
                    showHorse = data.CurrentRaceResults[2],
                    horseOddsRatio = 0;

                // get the odds ratio for bet calculations
                if (winHorse.PolePosition == data.HorseSelected) {
                    horseOddsRatio = winHorse.OddsRatio;
                    betVerb = "won";
                }
                else if (placeHorse.PolePosition == data.HorseSelected) {
                    horseOddsRatio = placeHorse.OddsRatio;
                    betVerb = "placed";
                }
                else if (showHorse.PolePosition == data.HorseSelected) {
                    horseOddsRatio = showHorse.OddsRatio;
                    betVerb = "showed";
                }                    

                //TODO: Need to make sure these are right - Still showing congratulations when horse is chosen to win, but only places or shows
                switch (data.SelectedBetTypeId) {
                    case 1: //Win
                        if (winHorse.PolePosition == data.HorseSelected) {
                            betResults = data.BetAmount * horseOddsRatio * WIN_MULTIPLIER + data.BetAmount;
                        }
                        break;
                    case 2: //Place
                        if (winHorse.PolePosition == data.HorseSelected || placeHorse.PolePosition == data.HorseSelected) {
                            betResults = data.BetAmount * horseOddsRatio * PLACE_MULTIPLIER + data.BetAmount;
                        }
                        break;
                    case 3: //Show
                        if (winHorse.PolePosition == data.HorseSelected
                            || placeHorse.PolePosition == data.HorseSelected
                            || showHorse.PolePosition == data.HorseSelected) {
                            betResults = data.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + data.BetAmount;
                        }
                        break;
                    case 4: //WPS
                        if (winHorse.PolePosition == data.HorseSelected) {
                            betResults = (data.BetAmount * horseOddsRatio * WIN_MULTIPLIER + data.BetAmount)
                                + (data.BetAmount * horseOddsRatio * PLACE_MULTIPLIER + data.BetAmount)
                                + (data.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + data.BetAmount);
                        }
                        else if (placeHorse.PolePosition == data.HorseSelected)
                            betResults = (data.BetAmount * horseOddsRatio * PLACE_MULTIPLIER + data.BetAmount)
                                + (data.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + data.BetAmount);
                        else if (showHorse.PolePosition == data.HorseSelected)
                            betResults = data.BetAmount * horseOddsRatio * SHOW_MULTIPLIER + data.BetAmount;
                        break;
                    default:
                        data.CurrentRace.RaceResultMessage = "Error: Invalid Bet Type detected!";
                        break;
                }
                
                //calculate the new account balance - TODO: make this seperate function
                if (betResults > 0) {                    
                    data.AccountBalance = data.AccountBalance + betResults;
                    data.CurrentRace.RaceResultMessage = "Congratulations! Horse #" + data.HorseSelected + " " + betVerb + "! You won " + UTILITIES.CurrencyFormatter(betResults) + " on Race #" + data.CurrentRace.RaceNumber + ".";
                }
                else {
                    data.CurrentRace.RaceResultMessage = "Sorry, your horse, #" + data.HorseSelected + ", did not " + data.SelectedBetType.Name + " in Race #" + data.CurrentRace.RaceNumber + ". You lost " + data.GetFormattedCurrency(data.TotalCostOfBet) + ".";
                }

                //reset the horse selected for the next race/bet
                data.HorseSelected = 0;
                data.SelectHorse(0);
            },
            ValidateBet: function () {
                let data = this;

                // clear error message first
                data.ErrorMessage = "";

                if (data.SelectedBetTypeId <= 0) {
                    data.ErrorMessage = "Please choose a Bet Type.";
                }

                if (data.HorseSelected <= 0) {
                    data.ErrorMessage = "Please choose a Horse for Race #" + data.CurrentRaceToRun.RaceNumber + ".";
                }

                if (data.TotalCostOfBet > data.AccountBalance) {
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
                    //deduct the amount for the bet
                    data.AccountBalance = data.AccountBalance - data.TotalCostOfBet;

                    data.CurrentRace.Bet = "Bet: " + data.GetFormattedCurrency(data.BetAmount) + " to " + data.SelectedBetType.Name +
                        " on Horse #" + data.HorseSelected + " for Race " + data.CurrentRaceToRun.RaceNumber + ".  Total Cost of Bet: " +
                        data.GetFormattedCurrency(data.TotalCostOfBet);  

                    data.ShowRace();
                }
            },
            CancelBet: function () {
                let data = this;

                if (!data.RaceIsStarted && data.PlayerHasBet) {
                    data.AccountBalance = data.AccountBalance + data.TotalCostOfBet;
                    data.CurrentRace.Bet = "";
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

                //TODO: Need to get horse and race But for now, we're just getting a simple horse pole position for the current race to run
                if (data.CurrentRace.Id == data.CurrentRaceToRun.Id)
                    data.HorseSelected = horseSelected.PolePosition;
            },
            GetNumberWithEnding: function (number) {
                return UTILITIES.getNumberWithEnding(number);
            },
            GetFormattedCurrency: function (number) {
                return UTILITIES.CurrencyFormatter(number);
            }
        },
        mounted: function () {
            this.Initialize();
        }
    }).mount("#horse-racing-app-wrapper");
})();