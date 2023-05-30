(function () {
    let model = new Object;

    model.RaceInterval = new Object;
    model.MIN_BET = 2;
    model.NumberOfRaces = 1, //TODO: this can bet set to any int, but for testing purposes it is set to 10
    model.RaceTime = 0,
    model.HorsesModel = new Object;
    model.HorsesModel.RaceCount = 0;
    model.RaceResults = 0; //TODO: make this an object so odds, etc. are kept with horse
    model.RaceResultMessage = "";
    model.HorseSelected = 0;
    model.HorseSelectedOddsMultiplier = 1;
    model.AccountBalance = 1000;
    model.BetAmount = model.MIN_BET; //TODO: Add Validation - for example, make sure amount min ($2) is met and user cannot enter non numeric, or more than they have in account.
    model.ErrorMessage = "";
    model.FinishOrder = [];

    model.HorsesModel.Results = [];
    model.Races = new Object;

    //initialize variables
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

    Vue.createApp({
        data: function () {
            return model;
        },
        components: {
            "table-row": rowComponent
        },
        watch: {
            //TODO: Left here for examples for now
            //"AliasUserSearchResultModel.Filter": {
            //    handler: function () {
            //        this.AliasUserSearchResultModel.FilterChanged = true;
            //    },
            //    deep: true
            //},
            "HorsesModel.Results": function () {
                this.HorsesModel.RaceCount++;
            }
        },
        computed: {
            //TODO: left here for examples, for now
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
            SetupRaces: function () {
                let data = this,
                    trackHeight = 0,
                    trackLength = 1000, //length of track to reach finish line
                    finishLineHeight = 20, //height of a div - setting here, since elements added to DOM do not have a height
                    horseTrack = document.getElementById("horse-track"),
                    horseCount = UTILITIES.getRandomInt(3, 24); //at least 3 horses are required for race, with a max of 24


                console.log('setting up race...');

                data.HorseSelected = 0;
                data.HorseSelectedOddsMultiplier = 1;

                data.Races = Array(data.NumberOfRaces).fill(null).map((_, i) => {
                    return new MODULES.Constructors.HorseRacing.Race(i, i + 1, []);
                });

                data.Races.forEach((race, index) => {
                    //TODO: make sure a horse name is not added more than once to a race or group of horses in a race
                    race.Horses = Array(horseCount).fill(null).map((_, i) => {
                        let pp = i + 1;
                        return new MODULES.Constructors.HorseRacing.Horse(i, pp, UTILITIES.getRandomInt(1, 99) + '-1', UTILITIES.getRandomHorseName(), false, "pole-position pp" + pp);
                    });
                });

                console.log('(data.Races[0].Horses', data.Races[0].Horses);

                //for each horse, create a div that represents the horse on the track
                const divs = Array(horseCount).fill(null).map((_, i) => {
                    return document.createElement("div");
                    //return new MODULES.Constructors.HorseRacing.Horse(i, i + 1, UTILITIES.getRandomInt(1, 99) + '-1', UTILITIES.getRandomHorseName(), false, "pole-position pp" + i + 1);
                });

                // Setup the divs that represent a horse.
                divs.forEach((div, index) => {
                    let polePosition = index + 1;
                    div.style.left = "0px";
                    div.innerHTML = polePosition;
                    div.classList.add("pole-position");
                    div.classList.add("pp" + polePosition);
                    div.id = "pp" + polePosition;
                    polePosition++;
                });                

                // Add the divs to the track area.
                divs.forEach((div) => {
                    horseTrack.appendChild(div);
                    trackHeight = trackHeight + finishLineHeight;
                });

                //set the finish-line to the height of track with horses on it
                document.getElementById("finish-line").style.height = trackHeight;

                // check if a horse is finished
                function isFinished(div) {
                    return parseInt(div.style.left) >= trackLength;
                }

                // Create an interval that will move the divs horizontally.
                data.RaceInterval = setInterval(() => {
                    data.RaceTime++;
                    // Move each div by a different random amount between 1 and 5.
                    divs.forEach((div, i) => {
                        let currentDivPosition = parseInt(div.style.left)

                        //keep horse moving if it's not finished yet'
                        if (currentDivPosition < trackLength) {
                            let newPosition = currentDivPosition + UTILITIES.getRandomInt(1, 5);
                            //TODO: Add a random number generator variable for horses with better odds, jockey, trainer, etc.
                            //TODO: check if there can be a tie, we should allow for ties since this can happen in real life

                            div.style.left = newPosition + "px";

                            // After a div has reached the end of the track, keep it at the end of the track and add it to the FinishOrder.
                            if (isFinished(div)) {
                                data.FinishOrder.push(div.id);
                                div.style.left = trackLength;
                            }
                        }

                        // After all horses have crossed the finish line, end the race:
                        if (divs.every(isFinished)) {
                            clearInterval(data.RaceInterval);
                        }
                    });
                }, 100);   
            },
            Race: function () {
                let data = this,
                    betResults = 0;                    

                if (data.CheckBalance()) {
                    //determine winning horse - TODO: eventually we'll want to determine 1st, 2nd, 3rd and factor in odds and perhaps the jockey and trainer etc.
                    //TODO: base this on list of horses dynamically generated
                    data.RaceResults = UTILITIES.getRandomInt(1, 5);

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
                }                
            },            
            CheckBalance: function () {
                let data = this;

                // clear error message first
                data.ErrorMessage = "";

                if (data.BetAmount > data.AccountBalance) {
                    data.ErrorMessage = "Insufficient funds - please choose a lower amount to bet.";                                        
                }

                if (data.BetAmount < data.MIN_BET) {
                    data.ErrorMessage = "You must bet at least $" + data.MIN_BET + ".";                    
                }

                if (data.ErrorMessage.length > 0) {
                    data.RaceResults = 0;
                    return false;
                }

                return true;
            },
            SelectRow: function (horseSelected) {
                let data = this;

                console.log('horseSelected', horseSelected.Id);

                //reset IsSelected to false for all horses:
                data.Races[0].Horses.forEach(horse => {
                    if (horse.Id == horseSelected.Id) {
                        horse.IsSelected = true;
                    }
                    else
                        horse.IsSelected = false;
                });

                data.HorseSelected = horseSelected.PolePosition;
                data.HorseSelectedOddsMultiplier = horseSelected.Odds.split('-')[0];
            }
            //ShowUsersSelected: function () {
            //    let data = this;

            //    data.SearchAliases();
            //    data.SetActiveTabName('alias-manage-container');
            //}
        },
        mounted: function () {
            this.Initialize();
        }
    }).mount("#horse-racing-app-wrapper");

})();