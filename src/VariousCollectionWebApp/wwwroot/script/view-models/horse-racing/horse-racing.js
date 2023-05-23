﻿(function () {
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
    model.dot = new Object;
    model.anim = new Object;

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
                let data = this

                //TODO: Setup multiple players (allow user to choose the number) so they can compete on who wins the most money after X number of races

                //setup a horse race (pick the horses etc.)
                data.SetupRace();
            },
            SetupRace: function () {
                let data = this,
                numberOfHorses = 2; //TODO: eventually we'll auto generate horse list and odds, but for now it's statically set to 5

                //numberOfHorses = getRandomInt //2-20 horses

                console.log('setting up race...');

                data.HorseSelected = 0;
                data.HorseSelectedOddsMultiplier = 1;

                //Get horses in the race:
                data.HorsesModel.Results = [
                    {
                        "HorseId": "1",
                        "PolePosition": 1,
                        "Odds": "2-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "BackgroundColor": "#e13838",
                        "FontColor": "#ffffff"
                    },
                    {
                        "HorseId": "2",
                        "PolePosition": 2,
                        "Odds": "3-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "BackgroundColor": "#f5f5f5",
                        "FontColor": "#000000"
                    },
                    {
                        "HorseId": "3",
                        "PolePosition": 3,
                        "Odds": "30-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "BackgroundColor": "#295fcc",
                        "FontColor": "#ffffff"
                    },
                    {
                        "HorseId": "4",
                        "PolePosition": 4,
                        "Odds": "9-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "BackgroundColor": "#fff200",
                        "FontColor": "#000000"
                    },
                    {
                        "HorseId": "5",
                        "PolePosition": 5,
                        "Odds": "20-1",
                        "HorseName": UTILITIES.getRandomHorseName(),
                        "IsSelected": false,
                        "BackgroundColor": "#4d801a",
                        "FontColor": "#ffffff"
                    }
                ];                

                /*
                // reference: https://potatodie.nl/diffuse-write-ups/move-a-dot-along-a-path/
                let dot = document.getElementById('dot');
                let curve = document.getElementById('curve');
                let totalLength = curve.getTotalLength();

                let u = 0.5;
                let p = curve.getPointAtLength(u * totalLength);

                dot.setAttribute("transform", `translate(${p.x}, ${p.y})`);

                data.dot = {
                    sprite: null,
                    track: null,

                    // Initialize the dot: connect sprite and track properties with supplied SVG elements
                    init: function (sprite, track) {
                        this.sprite = document.getElementById(sprite);
                        this.track = document.getElementById(track);
                    },

                    // Put the dot on its spot
                    move: function (u) {
                        const p = this.track.getPointAtLength(u * this.track.getTotalLength());
                        this.sprite.setAttribute("transform", `translate(${p.x}, ${p.y})`);
                    }
                };

                data.anim = {
                    start: function (duration) {
                        this.duration = duration;
                        this.tZero = Date.now();

                        requestAnimationFrame(() => this.run());
                    },

                    run: function () {
                        let u = Math.min((Date.now() - this.tZero) / this.duration, 1);

                        if (u < 1) {
                            // Keep requesting frames, till animation is ready
                            requestAnimationFrame(() => this.run());
                        } else {
                            this.onFinish();
                        }

                        data.dot.move(u);
                    },

                    onFinish: function () {
                        // Schedule the animation to restart
                        setTimeout(() => this.start(this.duration), 1000);
                    }
                };

                data.dot.init('dot', 'curve');
                data.anim.start(300000);
                */
            },
            Race: function () {
                let data = this,
                    betResults = 0;                    

                if (data.CheckBalance()) {
                    data.MoveHorse();

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

                    data.SetupRace(); //setup a new race
                }                
            },
            MoveHorse: function () {                
                let data = this;

                console.log('moving horse');    

                UTILITIES.OrbitAnimation.setup("track-img","horse-position-img", {                    
                    // time in seconds for one revolution
                    duration: 10,
                    // direction = 1 for clockwise, -1 for counterclockwise
                    direction: -1,
                    // number of times to animate the revolution (-1 for infinite)
                    iterations: 1,
                    // pixels - size of field
                    gridSize: 100
                });

                //UTILITIES.ElementRevolver.start("horse-position-img", {
                //    radius: 80,
                //    center: { x: 150, y: 150 },
                //    // time in milliseconds for one revolution
                //    interval: 5000,
                //    // direction = 1 for clockwise, -1 for counterclockwise
                //    direction: -1,
                //    // number of times to animate the revolution (-1 for infinite)
                //    iterations: 1,
                //    // startPosition can be a degree angle
                //    // (0 = right, 90 = top, 180 = left, 270 = bottom)
                //    startPositionDeg: 90,
                //    // how often (in milliseconds) the position of the
                //    // circle should be attempted to be updated
                //    updateInterval: 50
                //});

                //TODO: get a track distance, and for each horse calculate the distance they run within each second (or other time interval)
                // Use a multiplier based on the horse odds to determine how much the horse ran
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