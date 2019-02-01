(function ($) {
    //KO binding to set a DOM object's class
    ko.bindingHandlers['class'] = {
        'update': function (element, valueAccessor) {
            if (element['__ko__previousClassValue__']) {
                $(element).removeClass(element['__ko__previousClassValue__']);
            }
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).addClass(value);
            element['__ko__previousClassValue__'] = value;
        }
    };

    //KO function to "refresh" an observable array when a non observable item is updated. (refreshes the DOM)
    //source: https://stackoverflow.com/questions/13231738/refresh-observablearray-when-items-are-not-observables
    ko.observableArray.fn.refresh = function (item) {
        var index = this['indexOf'](item);
        if (index >= 0) {
            this.splice(index, 1);
            this.splice(index, 0, item);
        }
    };
})(jQuery);