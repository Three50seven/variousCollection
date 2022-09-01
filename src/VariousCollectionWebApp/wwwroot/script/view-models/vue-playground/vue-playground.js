(function () {    
    let model = new Object;
    model.TestModel = new Object;
    model.TestModel.SearchCount = 1;
    model.DeleteCount = 1;
    model.TestModel.Results = [
        {
            "UserId": "1",
            "ProfileId": "2",
            "UserName": "User 1 Name",
            "ProfileName": "Profile 2 Name",
            "ProfileEmail": "Profile2@someplace.com"
        },
        {
            "UserId": "1",
            "ProfileId": "3",
            "UserName": "User 1 Name",
            "ProfileName": "Profile 3 Name",
            "ProfileEmail": "Profile3@someplace.com"
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
            Delete: function () {
                let data = this;
                data.$emit("row-deleted", data);
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
            //"AliasUserSearchResultModel.Filter": {
            //    handler: function () {
            //        this.AliasUserSearchResultModel.FilterChanged = true;
            //    },
            //    deep: true
            //},
            "TestModel.Results": function () {
                this.TestModel.SearchCount++;
            }
        },
        computed: {
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
                console.log('vue playground initialized', data);
                //this.SetActiveTabName(this.Tabs[0].Name);
                //this.SetActiveTabName(this.SubTabs[0].Name);
                //this.SearchAliases();
            },
            Search: function () {
                let data = this;

                data.TestModel.Results = [
                    {
                        "UserId": "3",
                        "ProfileId": "6",
                        "UserName": "User 2 Name",
                        "ProfileName": "Profile 3 Name",
                        "ProfileEmail": "Searched1@someplace.com"
                    },
                    {
                        "UserId": "4",
                        "ProfileId": "5",
                        "UserName": "User 3 Name",
                        "ProfileName": "Profile 4 Name",
                        "ProfileEmail": "Searched2@someplace.com"
                    }
                ];
            },
            DeleteRow: function () {
                let data = this;

                console.log('delete row clicked');
                data.DeleteCount++;
                console.log('delete count: ', data.DeleteCount);
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
    }).mount("#playground-app-wrapper");

})();