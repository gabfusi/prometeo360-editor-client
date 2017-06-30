define(function () {
    "use strict";

    return {

        generateUid: function () {

            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /**
         * hh:mm:ss.mmm to milliseconds
         * @param hmsm
         */
        stringToMilliseconds: function (hmsm) {
            var a = hmsm.split(':'),
                b = a[2].split('.');

            if (!(a[0])) a[0] = 0;
            if (!(a[1])) a[1] = 0;
            if (!(b[0])) b[0] = 0;
            if (!(b[1])) b[1] = 0;

            return ( ( (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+b[0]) ) * 1000 ) + (+b[1]);
        },

        millisecondsToString: function (duration) {

            var milliseconds = parseInt((duration % 1000) / 100)
                , seconds = parseInt((duration / 1000) % 60)
                , minutes = parseInt((duration / (1000 * 60)) % 60)
                , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
        },

        formatTime: function (millisec) {

            var seconds = (millisec / 1000).toFixed(1);
            var minutes = (millisec / (1000 * 60)).toFixed(1);
            var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
            var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

            if (seconds < 60) {
                return seconds + " s";
            } else if (minutes < 60) {
                return minutes + " m";
            } else if (hours < 24) {
                return hours + " h";
            } else {
                return days + " d"
            }
        },

        timeAgo: function (timeStamp) {

            timeStamp = new Date(timeStamp * 1000);

            var now = new Date(),
                day, month, year,
                s, m, h,
                secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;

            if (secondsPast < 60) {
                s = parseInt(secondsPast);
                return s + ( s > 1 ? ' secondi' : ' secondo') + ' fa';
            }
            if (secondsPast < 3600) {
                s = parseInt(secondsPast / 60);
                return s + ( s > 1 ? ' minuti' : ' minuto') + ' fa';

            }
            if (secondsPast <= 86400) {
                s = parseInt(secondsPast / 3600);
                return s + ( s > 1 ? ' ore' : ' ora') + ' fa';
            }
            if (secondsPast > 86400) {
                day = timeStamp.getDate();
                month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
                year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
                return day + " " + month + year;
            }
        },

        formatBytes: function (bytes) {
            var units = ['B', 'KB', 'MB', 'GB', 'TB'],
                i;

            for (i = 0; bytes >= 1024 && i < 4; i++) {
                bytes /= 1024;
            }

            return bytes.toFixed(2) + units[i];
        },

        nl2br: function (str) {
            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
        },

        br2nl: function (str) {
            return str.replace(/<br>/g, "\r");
        },

        stripTags: function (str) {
            return str.replace(/<\/?[^>]+>/g, '').trim();
        },

        debounce: function (func, wait, immediate) {
            var timeout;
            return function () {
                var context = this,
                    args = arguments;

                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };

                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait || 100);
                if (callNow) func.apply(context, args);
            };
        }

    };

});