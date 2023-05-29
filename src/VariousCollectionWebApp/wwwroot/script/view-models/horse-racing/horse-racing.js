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
    model.FinishOrder = [];

    model.HorsesModel.Results = [];

    //SVG Animation Controls - TODO: Cleanup
    model.dot = new Object;
    model.anim = new Object;
    model.run_animation = false;
    model.svganim = new Object;

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

                //Setup animations
                data.svganim = document.getElementById("svgobject");
                data.dot = document.getElementById("dot");

                console.log('svganim', data.svganim);
                data.svganim.pauseAnimations();

                //Setup horses
                let horseTrack = document.getElementById("horse-track");
                //let finishLine = document.getElementById("finish-line");
                let polePosition = 1;
                let horseCount = 24;

                // Create an array of divs. MAX=24 (max number of horse pole positions per: https://www.horseracingnation.com/content/ntra_saddle_towel_colors)
                const divs = Array(horseCount).fill(null).map((_, i) => {
                    return document.createElement("div");
                });

                // Set the divs' width and height.
                divs.forEach((div) => {
                    div.style.left = "0px";
                    div.innerHTML = polePosition;
                    div.classList.add("pole-position");
                    div.classList.add("pp" + polePosition);
                    div.id = "pp" + polePosition;
                    polePosition++;
                });

                //// Set the divs' positions.
                //divs.forEach((div, i) => {
                //    div.style.left = i * 100 + "px";
                //});

                // Add the divs to the track area.
                divs.forEach((div) => {
                    horseTrack.appendChild(div);
                });

                //set the finish-line to the height of track with horses on it
                //document.getElementById("finish-line").style.height = horseTrack.style.height;

                // check if a horse is finished
                const isFinished = (currentValue) => currentValue >= 1000;

                // Create an interval that will move the divs horizontally.
                const interval = setInterval(() => {
                    // Move each div by a different random amount between 1 and 5.
                    divs.forEach((div, i) => {
                        let newPosition = parseInt(div.style.left) + UTILITIES.getRandomInt(1, 5);
                        //TODO: Add a random number generator variable for horses with better odds, jockey, trainer, etc.
                        //TODO: check if there can be a tie, we should allow for ties since this can happen in real life

                        div.style.left = newPosition + "px";
                        console.log("left", div.style.left);

                        //// After a div has reached the end of the track, keep it at the end of the track and add it to the FinishOrder.
                        //if (newPosition >= 1000) {
                        //    if (!divs.includes(div.id)) {
                        //        data.FinishOrder.unshift(div.id);
                        //    }
                        //    div.style.left = 1000;
                        //}

                        //// After all horses have crossed the finish line, end the race:
                        //if (divs.every(isFinished)) {
                        //    clearInterval(interval);
                        //}

                        // After a div has reached the end of the track, stop animation.
                        if (newPosition >= 1000) {
                            clearInterval(interval);
                        }
                    });                    
                }, 100);

                // When the user clicks on the document, clear the interval.
                document.addEventListener("click", () => {
                    clearInterval(interval);
                });
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

                var starting_position = 0; //TODO: degree of starting position on track

                data.run_animation = !data.run_animation
                console.log('toggle', data.run_animation);
                if (data.run_animation) {
                    data.svganim.unpauseAnimations();
                }
                else {
                    data.svganim.pauseAnimations();
                }        

                //UTILITIES.OrbitAnimation.orbit("horse-position-img", {                    
                //    radius: 200, // The radius of the discorectangle
                //    angle: 0, // The current angle of the div
                //    speed: 0.1, // The speed of the div in degrees per second
                //    direction: 1, // The direction of the orbit, 1=clockwise, -1=counter-clockwise
                //    start: 0, // The start angle
                //    stopPosition: 360, // The stop angle
                //});

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