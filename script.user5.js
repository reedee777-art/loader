// ==UserScript==
// @name         Автообновление страницы каждые 60 сек
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Автоматически перезагружает страницу раз в 60 секунд
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const EXCLUDED_URLS = [
        'https://reedee777-art.github.io/loader/loader5.html',
        'https://faucetpay.io/exchange',
        'https://reedee777-art.github.io/loader/loader4a.html'
    ];

    const RELOAD_INTERVAL_SECONDS = 60;
    const NAN_CHECK_INTERVAL_MS = 2000;
    const NAN_RELOAD_DELAY_MS = 5000;

    const currentURL = location.href.split('?')[0].split('#')[0];

    // Точные исключения
    const isExcludedExact = EXCLUDED_URLS.some(url => currentURL === url);

    // Исключение всех URL вида https://любой-домен/ptc/*
    const isExcludedPTC =
        location.protocol === 'https:' &&
        location.pathname.startsWith('/ptc/');

    if (isExcludedExact || isExcludedPTC) {
        console.log('⏸ Автообновление отключено:', location.href);
        return;
    }

    let nanReloadScheduled = false;

    function checkForNaN() {
        const minuteEl = document.getElementById('minute');
        const secondEl = document.getElementById('second');

        if (!minuteEl || !secondEl) return;

        const isNaN =
            minuteEl.textContent.trim() === 'NaN' ||
            secondEl.textContent.trim() === 'NaN';

        if (isNaN && !nanReloadScheduled) {
            nanReloadScheduled = true;

            console.log(
                '⚠️ Обнаружен NaN в таймере, перезагрузка через 5 сек...'
            );

            setTimeout(function() {
                location.reload();
            }, NAN_RELOAD_DELAY_MS);
        }
    }

    // Проверяем NaN регулярно
    setInterval(checkForNaN, NAN_CHECK_INTERVAL_MS);
    checkForNaN();

    // Обычное обновление раз в 60 секунд
    setTimeout(function() {
        location.reload();
    }, RELOAD_INTERVAL_SECONDS * 1000);

})();
