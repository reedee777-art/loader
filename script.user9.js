// ==UserScript==
// @name         VipCoinOnly limit 41 claim!
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Redirect to about:blank if claim limit reached
// @author       Grok
// @match        https://vipcoinfaucet.com/*
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const targetUrl = 'about:blank';

    // 🔹 Фразы, при которых будет редирект
    const triggerPhrases = [
        'Only limit 40 claim!',
        'Only limit 41 claim!',
        'Daily claim limit reached',
        'claim limit',
        'Please come back tomorrow'
    ];

    // Проверяем сразу после загрузки
    checkForError();

    // Проверяем каждые 2 секунды (на случай динамического появления сообщения)
    setInterval(checkForError, 2000);

    function checkForError() {
        const pageText = document.body.innerText;

        for (let phrase of triggerPhrases) {
            if (pageText.includes(phrase)) {
                if (window.location.href !== targetUrl) {
                    window.location.href = targetUrl;
                }
                break;
            }
        }
    }
})();
