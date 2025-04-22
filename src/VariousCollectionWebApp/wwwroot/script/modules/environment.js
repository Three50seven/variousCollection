MODULES.Environment = (function () {
    const themeButton = document.getElementById('theme-switch-button');
    const themeIcon = document.getElementById('switch-theme-icon');
    const body = document.body;

    themeButton.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.setAttribute('data-bs-theme', newTheme);

        // Update the icon based on the new theme
        themeIcon.setAttribute('src', newTheme === 'dark'
            ? '../../images/icon/moon.svg'
            : '../../images/icon/sun.svg');
    });

    //TODO: 1/31/2019 - MOST OF THIS IS NOT CUSTOMIZED FOR THIS PROJECT - other than the theme switcher above
    function IsDebug() {
        return $.toBool($("#isDebugMode").val());
    }

    function BrowserIsInternetExplorer() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // IE 12 => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }    

    return {
        IsIE: function () {
            return BrowserIsInternetExplorer();
        },
        IsDebug: function () {
            return IsDebug();
        },
        LocalWarning: function (message) {
            if (IsDebug()) {
                alert(message);
            }
        },
        Name: document.getElementById("app-environment").value
    };
})();