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

    const INTERVAL_SECONDS = 60;

    // Проверяем, не находимся ли мы на исключённой странице
    const currentURL = location.href.split('?')[0].split('#')[0]; // без query/hash
    const isExcluded = EXCLUDED_URLS.some(url => currentURL === url);

    if (isExcluded) {
        console.log('⏸ Автообновление отключено для этой страницы:', currentURL);
        return;
    }

    setTimeout(function() {
        location.reload();
    }, INTERVAL_SECONDS * 1000);

})();
