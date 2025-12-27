// ==UserScript==
// @name         VipCoinOnly limit 41 claim!
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  При появлении Only limit 41 claim!
// @author       Grok
// @match        https://vipcoinfaucet.com/*
// @match        https://miniappfaucet.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const targetUrl = 'about:blank';

    // Проверяем сразу после загрузки
    checkForError();

    // Затем проверяем каждые 2 секунды (на случай динамического появления сообщения)
    setInterval(checkForError, 2000);

    function checkForError() {
        const pageText = document.body.innerText;
        if (pageText.includes('Only limit 40 claim!') || pageText.includes('Only limit 41 claim!')) {
            if (window.location.href !== targetUrl) {
                window.location.href = targetUrl;
            }
        }
    }
})();