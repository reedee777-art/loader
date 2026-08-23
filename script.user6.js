// ==UserScript==
// @name         Crypto Dashboard to linksfly
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Redirect from /app/dashboard to /links/currency/ltc after 1 second
// @author       You
// @match        https://*/app/dashboard*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Проверяем, что URL содержит /app/dashboard
    if (window.location.pathname.includes('/app/dashboard')) {
        // Ждём 1 секунду
        setTimeout(function() {
            // Перенаправляем на /links/currency/ltc
            window.location.href = window.location.origin + '/app/faucet?currency=LTC';
        }, 1000);
    }
})();
