// ==UserScript==
// @name         Автообновление страницы каждые 60 сек
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматически перезагружает страницу раз в 60 секунд
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    const EXCLUDED_URLS = [
        'https://reedee777-art.github.io/loader/loader4a.html'
    ];

    const RELOAD_INTERVAL_SECONDS = 60;
    const NAN_CHECK_INTERVAL_MS = 2000; // как часто проверять на NaN
    const NAN_RELOAD_DELAY_MS = 5000;   // задержка перед перезагрузкой при NaN

    const currentURL = location.href.split('?')[0].split('#')[0];
    const isExcluded = EXCLUDED_URLS.some(url => currentURL === url);

    if (isExcluded) {
        console.log('⏸ Автообновление отключено для этой страницы:', currentURL);
        return;
    }

    let nanReloadScheduled = false;

    function checkForNaN() {
        const minuteEl = document.getElementById('minute');
        const secondEl = document.getElementById('second');

        if (!minuteEl || !secondEl) return;

        const isNaN = minuteEl.textContent.trim() === 'NaN' || secondEl.textContent.trim() === 'NaN';

        if (isNaN && !nanReloadScheduled) {
            nanReloadScheduled = true;
            console.log('⚠️ Обнаружен NaN в таймере, перезагрузка через 5 сек...');
            setTimeout(function() {
                location.reload();
            }, NAN_RELOAD_DELAY_MS);
        }
    }

    // Проверяем NaN регулярно
    setInterval(checkForNaN, NAN_CHECK_INTERVAL_MS);
    checkForNaN(); // сразу при загрузке тоже проверим

    // Обычное периодическое обновление раз в 60 сек
    setTimeout(function() {
        location.reload();
    }, RELOAD_INTERVAL_SECONDS * 1000);

})();
