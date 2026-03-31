// ==UserScript==
// @name         Crypto Dashboard to linksfly
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Redirect from /app/dashboard to /app/faucet?currency=LTC after 3 seconds
// @author       You
// @match        https://*/app/dashboard*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Проверяем, что URL содержит /app/dashboard
    if (window.location.pathname.includes('/app/dashboard')) {
        // Ждём 3 секунды
        setTimeout(function() {
            // Заменяем /app/dashboard на /app/faucet?currency=LTC
            var newPath = window.location.pathname.replace('/app/dashboard', '/app/faucet') + '?currency=LTC';
            window.location.href = window.location.origin + newPath;
        }, 17000);
    }
})();
