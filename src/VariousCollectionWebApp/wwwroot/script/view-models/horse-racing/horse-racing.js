﻿(function () {
    const ODDS_LIMITER = 99,
        MIN_HORSES = 3, //at least 3 horses are required for race, with a max of 24
        MAX_HORSES = 24,
        COMMON_MAX_HORSES = 10,
        MAX_ICON_MOVEMENT = 5,
        MIN_BET = 2,
        TRACK_LENGTH = 1000, // length of track to reach finish line
        ICON_HEIGHT = 20, //height of an icon - setting here, since elements added to DOM do not have a height, this needs to match the horse-racing.css class .pole-position height property
        RACE_INTERVAL_SPEED = 100, // controls how fast the divs move on the track (e.g. 1000 = horse is moved every second), lower numbers = faster movements, higher numbers = slower movements
        TRACK_SCROLL_SPEED = 3; // higher number makes the track scroll faster as the horse icons are moved per interval - TODO: this should be a ratio of RACE_INTERVAL_SPEED instead of just hard-coded

    let model = new Object;

    model.RaceInterval = new Object;
    model.NumberOfRaces = 10,
        model.RaceTime = 0,
        model.HorseIcons = new Object;
    model.CurrentRace = new Object;
    model.CurrentRaceResults = new Object;
    model.CurrentRaceToRun = new Object;
    model.RaceResults = 0; //TODO: make this an object so odds, etc. are kept with horse
    model.RaceResultMessage = "";
    model.HorseSelected = 0;
    model.HorseSelectedOddsMultiplier = 1;
    model.AccountBalance = 1000;
    model.BetAmount = MIN_BET; //TODO: Add Validation - for example, make sure amount min ($2) is met and user cannot enter non numeric, or more than they have in account.
    model.ErrorMessage = "";
    model.FinishOrder = [];
    model.RaceMenuIsShowing = false;
    model.RaceIsStarted = false;
    model.Races = new Object;
    model.LiveRacePositions = new Object; //TODO: left off here on 6/5/2023 - add a horseId to help with matching icon results back to horses, instead of parsing id (e.g. pp2)
    model.SortDirection = "asc";
    model.SortCount = 1;
    model.SortIcon = "&uarr;";

    /*sample component props for multi props:
     props: {
            value: {
                type: Object,
                required: true
            },
            isShowing: {
                type: Boolean,
                default: false,
            },
        },
     */

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

    let rowComponent = {
        template: "#table-row-template",
        props: ["value"],
        data: function () {
            return this.value;
        },
        methods: {
            Select: function () {
                let data = this;

                data.$emit("row-selected", data);
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

    Vue.createApp({
        data: function () {
            return model;
        },
        components: {
            "table-row": rowComponent,
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
                this.SortCount++;
            }
        },
        computed: {
            //TODO: left here for examples, for now
            FavoritesInCurrentRace: function () {
                return this.GetSortedCurrentHorses("OddsRatio", "asc");
            },
            FavoriteInCurrentRace: function () {
                return this.FavoritesInCurrentRace[0].Id;
            },
            CurrentRaceResultsIsEmpty: function () {
                return Object.keys(this.CurrentRaceResults).length === 0;
            },
            LiveRacePositionsIsEmpty: function () {
                return Object.keys(this.LiveRacePositions).length === 0;
            }
            //AnyUsersSelected: function () {
            //    return this.SelectedUsers.length;
            //},
            //SelectedUsers: function () {
            //    return this.AliasUserSearchResultModel.Results.filter(function (item) {
            //        return item.Selected;
            //    });
            //}
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

                sortDirection = ((sortDirection === "asc") ? "desc" : "asc");

                data.SortDirection = sortDirection;
                data.SortIcon = ((sortDirection === "asc") ? "&uarr;" : "&darr;");

                return data.CurrentRace.Horses = data.CurrentRace.Horses.toSortedArray(sortBy, sortDirection);
            },
            SortHorses: function (sort) {
                let data = this;

                //data.CurrentRace.Horses.Sorting.SortBy = sort.SortBy;
                //data.CurrentRace.Horses.Sorting.DirectionAbbr = sort.Direction;
                data.GetSortedCurrentHorses(sort.SortBy, sort.Direction);
            },
            SetupRaces: function () {
                let data = this,
                    allHorsesInAllRaces = [];

                data.HorseSelected = 0;
                data.HorseSelectedOddsMultiplier = 1;

                data.Races = Array(data.NumberOfRaces).fill(null).map((_, i) => {
                    return new MODULES.Constructors.HorseRacing.Race(i, i + 1, false, [], "asc", "Id");
                });

                data.Races.forEach((race, index) => {
                    let horseCount = UTILITIES.getRandomInt(MIN_HORSES, COMMON_MAX_HORSES);

                    // only make the 5th and 8th races potentially have a lot of horses to make it a bit more realistic
                    if (index == 4 || index == 7)
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
                        if (i >= horseOddsLimiter) {
                            horseOddsNumerator = UTILITIES.getRandomInt(1, ODDS_LIMITER);
                            horseOddsDenominator = 1;
                        }

                        // reduce the fraction
                        horseOddsFraction = UTILITIES.reduceFraction(horseOddsNumerator, horseOddsDenominator);

                        return new MODULES.Constructors.HorseRacing.Horse(i, pp,
                            horseOddsFraction.Numerator + '-' + horseOddsFraction.Denominator,
                            horseOddsFraction.Numerator / horseOddsFraction.Denominator,
                            horseName, false, "pole-position pp" + pp, 0);
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
                    raceFavorites = data.CurrentRaceToRun.Horses.toSortedArray("OddsRatio", "asc");

                if (data.CheckBalance()) {
                    // flag that the race has started
                    data.RaceIsStarted = true;

                    const trackContainer = document.getElementById('track-container');
                    const trackContainerScrollWidth = trackContainer.scrollWidth;

                    // check if a horse is finished
                    function isFinished(icon) {
                        return parseInt(icon.style.left) >= TRACK_LENGTH;
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

                            //keep horse moving if it's not finished yet
                            if (currentIconPosition < TRACK_LENGTH) {
                                let currentHorse = data.CurrentRaceToRun.Horses[i],
                                    currentHorseOddsRatio = currentHorse.OddsRatio,
                                    thirdHorseFavoriteOddsRatio = raceFavorites[2].OddsRatio,
                                    calculatedMaxIconMovement = MAX_ICON_MOVEMENT,
                                    newPosition = currentIconPosition;

                                //if the horse is one of the top 3 favorites and x # of intervals have gone by, they have a possibility of moving a bit faster
                                if (data.RaceTime % 100 == 0 && currentHorseOddsRatio <= thirdHorseFavoriteOddsRatio) {
                                    //TODO: Add a random number generator variable for horses with better odds, jockey, trainer, etc.
                                    //TODO: check if there can be a tie, we should allow for ties since this can happen in real life
                                    calculatedMaxIconMovement += 1;
                                }

                                newPosition = currentIconPosition + UTILITIES.getRandomInt(1, calculatedMaxIconMovement);
                                //console.log(`HorsePP: ${currentHorse.PolePosition} Odds: ${currentHorseOddsRatio} calculatedMaxIconMovement: ${calculatedMaxIconMovement} newPosition: ${newPosition}`);

                                icon.style.left = newPosition + "px";
                                currentHorse.CurrentDistance = newPosition;

                                data.LiveRacePositions = data.CurrentRaceToRun.Horses.toSortedArray("CurrentDistance", "desc");

                                // After a icon has reached the end of the track, keep it at the end of the track and add it to the FinishOrder.
                                if (isFinished(icon)) {
                                    data.FinishOrder.push(icon.id);
                                    icon.style.left = TRACK_LENGTH;
                                }
                            }

                            // After all horses have crossed the finish line, end the race:
                            if (data.HorseIcons.every(isFinished)) {
                                clearInterval(data.RaceInterval);
                                data.RaceIsStarted = false; //indicate the race has ended
                                data.LiveRacePositions = new Object;
                                data.GetRaceResults();
                                currentRaceId++;
                                if (currentRaceId <= data.NumberOfRaces - 1) {
                                    data.CurrentRaceToRun = data.Races[currentRaceId];
                                    data.SetupNextRace();
                                    trackContainer.scrollLeft = 0; //go back to beginning of track
                                }
                            }
                        });
                    }, RACE_INTERVAL_SPEED);
                }
            },
            GetRaceResults: function () {
                let data = this,
                    raceResults = [];

                if (data.FinishOrder.length > 0) {

                    data.FinishOrder.forEach((pp) => {
                        data.CurrentRaceToRun.Horses.forEach((horse) => {
                            let polePositionNumber = parseInt(pp.replace("pp", ""));

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

                    //reset finish order for next race
                    data.FinishOrder = [];

                    data.DetermineBetResults();
                }
            },
            DetermineBetResults: function () {
                let data = this,
                    betResults = 0;

                //determine winning horse - TODO: eventually we'll want to determine 1st, 2nd, 3rd and factor in odds and perhaps the jockey and trainer etc.
                //TODO: base this on list of horses dynamically generated
                data.RaceResults = data.CurrentRaceResults[0].PolePosition; //UTILITIES.getRandomInt(1, 5);

                //calculate the new account balance - TODO: make this seperate function
                if (data.RaceResults == data.HorseSelected) {
                    betResults = data.BetAmount * data.HorseSelectedOddsMultiplier + data.BetAmount;

                    data.AccountBalance = data.AccountBalance + betResults;
                    data.RaceResultMessage = "Congratulations! You won $" + betResults;
                }
                else {
                    data.AccountBalance = data.AccountBalance - data.BetAmount;
                    data.RaceResultMessage = "Sorry, your horse did not come in first, you lose $" + data.BetAmount;
                }

                data.HorseSelected = 0;
            },
            CheckBalance: function () {
                let data = this;

                // clear error message first
                data.ErrorMessage = "";

                if (data.BetAmount > data.AccountBalance) {
                    data.ErrorMessage = "Insufficient funds - please choose a lower amount to bet.";
                }

                if (data.BetAmount < MIN_BET) {
                    data.ErrorMessage = "You must bet at least $" + MIN_BET + ".";
                }

                if (data.ErrorMessage.length > 0) {
                    data.RaceResults = 0;
                    return false;
                }

                return true;
            },
            SelectRow: function (horseSelected) {
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

                //TODO: Need to get horse and race and later we'll add finish order bets etc.  But for now, we're just getting a simple horse pole position
                data.HorseSelected = horseSelected.PolePosition;
                data.HorseSelectedOddsMultiplier = horseSelected.Odds.split('-')[0];
            },
            GetNumberWithEnding: function (number) {
                return UTILITIES.getNumberWithEnding(number);
            }
        },
        mounted: function () {
            this.Initialize();
        }
    }).mount("#horse-racing-app-wrapper");
})();