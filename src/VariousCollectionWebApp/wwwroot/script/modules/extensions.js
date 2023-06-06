(function () {
    if (typeof String.prototype.startsWith !== 'function') {
        String.prototype.startsWith = function (str) {
            return str.length > 0 && this.substring(0, str.length) === str;
        };
    }

    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function (str) {
            return str.length > 0 && this.substring(this.length - str.length, this.length) === str;
        };
    }

    if (typeof String.prototype.includes !== 'function') {
        String.prototype.includes = function () {
            'use strict';
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    function EscapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    if (typeof String.prototype.replaceAll !== 'function') {
        // Ref - https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript

        String.prototype.replaceAll = function (search, replacement, escape) {
            if (escape === undefined || escape === null) {
                escape = true;
            }

            if (escape) {
                search = EscapeRegExp(search);
            }

            return this.replace(new RegExp(search, 'g'), replacement);
        };
    }

    if (typeof Array.prototype.includes !== 'function') {
        Array.prototype.includes = function (value) {
            return this.indexOf(value) !== -1;
        };
    }

    if (typeof Array.prototype.findItem !== 'function') {
        Array.prototype.findItem = function (value, prop) {
            if (!this.length) { return null; }

            for (var i = 0, j = this.length; i < j; i++) {
                var item = this[i];
                if (prop && item[prop] === value) {
                    return item;
                } else if (item === value) {
                    return item;
                }
            }

            return null;
        };
    }

    if (typeof Array.prototype.hasItems !== 'function') {
        Array.prototype.hasItems = function () {
            return this && this.length > 0;
        };
    }

    if (typeof Array.prototype.itemExists !== 'function') {
        Array.prototype.itemExists = function (value, prop) {
            return (this.findItem(value, prop) !== null);
        };
    }

    if (typeof Array.prototype.remove !== 'function') {
        Array.prototype.remove = function (value, prop) {
            if (!this.length) { return null; }

            var index = -1;

            for (var i = 0, j = this.length; i < j; i++) {
                var item = this[i];
                if (prop && item[prop] === value) {
                    index = i;
                    break;
                } else if (item === value) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                return this.splice(index, 1);
            }

            return null;
        };
    }

    if (typeof Array.prototype.flattenParentChildList !== 'function') {
        Array.prototype.flattenParentChildList = function (childrenProp) {
            if (!this || !this.length) { return this; }
            if (!childrenProp) { childrenProp = "Children"; }

            var list = [];
            function AddItems(items) {
                for (var i = 0; i < items.length; i++) {
                    list.push(items[i]);
                    var children = items[i][childrenProp];
                    if (children && children.length) {
                        AddItems(children);
                    }
                }
            }

            AddItems(this);
            return list;
        };
    }

    if (typeof Array.prototype.sum !== 'function') {
        Array.prototype.sum = function (options) {
            if (!this.length) { return 0; }

            var settings = $.extend({
                prop: undefined,
                decimalPlaces: 2
            }, options);

            function _getNumericValue(value, prop) {
                var trueValue = 0

                if (prop) {
                    trueValue = (($.isFunction(value[prop]) ? value[prop]() : value[prop]) || 0);
                } else {
                    trueValue = (($.isFunction(value) ? value() : value) || 0);
                }

                return (isNaN(trueValue) ? 0 : parseFloat(trueValue));
            }

            return this.reduce(function (a, b) {
                return (a + _getNumericValue(b, settings.prop));
            }, 0).toFixed(settings.decimalPlaces || 0).replace(/\.00$/, '');
        };
    }

    if (typeof Array.prototype.unique !== 'function') {
        Array.prototype.unique = function () {
            var a = this.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        };
    }

    if (typeof Array.prototype.selectMany !== 'function') {
        var flatten = Function.prototype.apply.bind(Array.prototype.concat, []);

        Array.prototype.selectMany = function (fn) {
            return flatten(this.map(fn));
        };
    }

    if (typeof Array.prototype.diff !== 'function') {
        Array.prototype.diff = function (arr) {
            if (!this || !this.length)
                return arr;

            if (!arr || !arr.length)
                return this;

            let startArray = this.length >= arr.length ? this : arr,
                diffArray = this.length >= arr.length ? arr : this;

            return startArray.filter(x => !diffArray.includes(x))
                .concat(diffArray.filter(x => !startArray.includes(x)));
        };
    }

    if (typeof Array.prototype.toSortedArray !== 'function') {
        Array.prototype.toSortedArray = function (sortBy, sortDirection) {            
            if (sortBy === undefined || sortBy === null)
                return this;

            if (sortDirection === undefined || sortDirection === null) {
                sortDirection = 'asc';
            }

            // temporary array holds objects with position and sort-value
            let mapped = this.map(function (item, i) {                
                return { index: i, value: item[sortBy] ? item[sortBy] : '' };
            })

            //need this to map back to original array
            let origArray = this;

            // sorting the mapped array containing the reduced values
            mapped.sort(function (a, b) {
                if (a.value > b.value) {
                    if (sortDirection === 'desc')
                        return -1;
                    else
                        return 1;
                }
                if (a.value < b.value) {
                    if (sortDirection === "desc")
                        return 1;
                    else
                        return -1;
                }
                return 0;
            });

            // return the sorted array
            return mapped.map(function (item) {
                return origArray[item.index];
            });
        };
    }
    if (typeof Date.prototype.getMeridiem !== 'function') {
        Date.prototype.getMeridiem = function () {
            return this.getHours() > 12 ? 'PM' : 'AM';
        }
    }

    if (typeof Date.prototype.getHours12 !== 'function') {
        Date.prototype.getHours12 = function () {
            return (this.getHours() + 11) % 12 + 1; // edited.
        }
    }
})();

(function () {
    // Ref - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round

    function Round(value, decimals) {
        if (isNaN(value)) {
            return NaN;
        }

        if (decimals === undefined || decimals === null) {
            decimals = 2;
        }

        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    if (Math.roundDecimal === undefined) {
        Math.roundDecimal = function (value, decimals) {
            return Round(value, decimals);
        };
    }

    if (Math.parseDecimal === undefined) {
        Math.parseDecimal = function (value, round, decimals) {
            value = (value || 0);
            if (isNaN(value)) {
                return 0;
            } else {
                value = parseFloat(value);

                if (round === true) {
                    value = Math.roundDecimal(value, decimals);
                }

                return value;
            }
        };
    }

    if (Math.delta === undefined) {
        Math.delta = function (targetValue, value, roundDecimals) {

            targetValue = Math.parseDecimal(targetValue);
            value = Math.parseDecimal(value);

            if (targetValue === 0 || value === 0) {
                return 0;
            } else {
                var diff = Math.abs(targetValue - value),
                    greater = (value > targetValue),
                    percentage = greater ? (diff / targetValue) : -(diff / targetValue);

                return Math.roundDecimal(percentage * 100, roundDecimals);
            }
        };
    }
})();