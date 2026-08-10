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

    const INTERVAL_SECONDS = 60;

    setTimeout(function() {
        location.reload();
    }, INTERVAL_SECONDS * 1000);

})();
