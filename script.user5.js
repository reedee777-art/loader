// ==UserScript==
// @name         VipCoinFaucet Error Redirect
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  При появлении "Failed!" или "Invalid Claim" перейти на BCH faucet
// @author       Grok
// @match        https://*/*
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
        if (pageText.includes('Similar IP range detected') || pageText.includes('IP switching')) {
            if (window.location.href !== targetUrl) {
                window.location.href = targetUrl;
            }
        }
    }
})();
