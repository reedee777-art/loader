// ==UserScript==
// @name         https://eaglefaucet.in/dashboard
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically redirect to LTC faucet after 3 seconds
// @author       Your Name
// @match        https://eaglefaucet.in/dashboard
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Время задержки в миллисекундах (3 секунды)
    const delay = 1000;

    // URL для перехода
    const redirectUrl = 'https://eaglefaucet.in/faucet/currency/ltc';

    // Функция для перенаправления
    setTimeout(function() {
        window.location.href = redirectUrl;
    }, delay);
})();

