(function () {
    let model = new Object;
    model.MIN_BET = 2;
    model.HorsesModel = new Object;
    model.HorsesModel.RaceCount = 1;
    model.RaceResults = 0; //TODO: make this an object so odds, etc. are kept with horse
    model.RaceResultMessage = "";
    model.HorseSelected = 0;
    model.HorseSelectedOddsMultiplier = 1;
    model.AccountBalance = 1000;
    model.BetAmount = model.MIN_BET; //TODO: Add Validation - for example, make sure amount min ($2) is met and user cannot enter non numeric, or more than they have in account.
    model.ErrorMessage = "";

    //TODO: get list of horses dynamically generated
    model.HorsesModel.Results = [
        {
            "HorseId": "1",
            "Odds": "2-1",            
            "HorseName": "Sparticus",
            "IsSelected": false
        },
        {
            "HorseId": "2",
            "Odds": "3-1",
            "HorseName": "Charred",
            "IsSelected": false
        },
        {
            "HorseId": "3",
            "Odds": "30-1",
            "HorseName": "Chickity China",
            "IsSelected": false
        },
        {
            "HorseId": "4",
            "Odds": "9-1",
            "HorseName": "Spitfire",
            "IsSelected": false
        },
        {
            "HorseId": "5",
            "Odds": "20-1",
            "HorseName": "Fluffy Socks",
            "IsSelected": false
        }
    ];

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
                console.log('vue horse-racing initialized', data);
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
                }
            },
            CheckBalance: function () {
                let data = this;

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

                data.ErrorMessage = "";
                return true;
            },
            SelectRow: function (horseSelected) {
                let data = this;
                console.log('horseSelected', horseSelected.HorseId);

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

                console.log('selected horse', data.HorseSelected);
                console.log('model.HorseSelectedOddsMultiplier', data.HorseSelectedOddsMultiplier);
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