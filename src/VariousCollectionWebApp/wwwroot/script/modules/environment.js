MODULES.Environment = (function () {
    document.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.getElementById('theme-switch-button');
        const themeIcon = document.getElementById('switch-theme-icon');
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark

        // Apply the saved theme
        document.body.setAttribute('data-bs-theme', savedTheme);
        updateIcon(savedTheme);

        // Toggle theme on button click
        themeButton.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.body.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });

        function updateIcon(theme) {
            themeIcon.src = theme === 'dark' ? '../../images/icon/moon.svg' : '../../images/icon/sun.svg';
        }
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