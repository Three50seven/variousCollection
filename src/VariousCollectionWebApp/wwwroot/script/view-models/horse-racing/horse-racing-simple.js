(function () {
    let model = new Object;
    model.MIN_BET = 2;
    model.HorsesModel = new Object;
    model.HorsesModel.RaceCount = 0;
    model.RaceResults = 0; //TODO: make this an object so odds, etc. are kept with horse
    model.RaceResultMessage = "";
    model.HorseSelected = 0;
    model.HorseSelectedOddsMultiplier = 1;
    model.AccountBalance = 1000;
    model.BetAmount = model.MIN_BET; //TODO: Add Validation - for example, make sure amount min ($2) is met and user cannot enter non numeric, or more than they have in account.
    model.ErrorMessage = "";

    model.HorsesModel.Results = [];

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
            "HorsesModel.Results": function () {
                this.HorsesModel.RaceCount++;
            }
        },
        methods: {
            Initialize: function () {
                let data = this

                //setup a horse race (pick the horses etc.)
                data.SetupRace();               
            },
            SetupRace: function () {
                let data = this;

                console.log('setting up race...');
                
                data.HorseSelectedOddsMultiplier = 1;

                //Get horses in the race:
                data.HorsesModel.Results = [
                    {
                        "HorseId": "1",
                        "PolePosition": 1,
                        "Odds": "2-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp1"
                    },
                    {
                        "HorseId": "2",
                        "PolePosition": 2,
                        "Odds": "3-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp2"
                    },
                    {
                        "HorseId": "3",
                        "PolePosition": 3,
                        "Odds": "30-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp3"
                    },
                    {
                        "HorseId": "4",
                        "PolePosition": 4,
                        "Odds": "9-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp4"
                    },
                    {
                        "HorseId": "5",
                        "PolePosition": 5,
                        "Odds": "20-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp5"
                    }
                    ,
                    {
                        "HorseId": "6",
                        "PolePosition": 6,
                        "Odds": "5-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp6"
                    }
                    ,
                    {
                        "HorseId": "7",
                        "PolePosition": 7,
                        "Odds": "10-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp7"
                    }
                    ,
                    {
                        "HorseId": "8",
                        "PolePosition": 8,
                        "Odds": "8-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "PolePositionClass": "pp8"
                    }
                ];
            },
            Race: function () {
                let data = this,
                    betResults = 0;                    

                if (data.CheckBalance()) {
                    //determine winning horse - TODO: eventually we'll want to determine 1st, 2nd, 3rd and factor in odds and perhaps the jockey and trainer etc.
                    //TODO: base this on list of horses dynamically generated
                    data.RaceResults = UTILITIES.getRandomInt(1, 8);

                    //calculate the new account balance - TODO: make this seperate function
                    //source: https://www.twinspires.com/wagertypes
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

                //reset IsSelected to false for all horses:
                data.HorsesModel.Results.forEach(horse => {
                    if (horse.HorseId == horseSelected.HorseId) {
                        horse.IsSelected = true;
                    }
                    else
                        horse.IsSelected = false;
                });

                data.HorseSelected = horseSelected.HorseId;
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