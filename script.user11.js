// ==UserScript==
// @name         Auto-redirect faucet dashboards
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Перенаправление с dashboard на faucet через 2 секунды
// @author       Your Name
// @match        https://earnsolana.xyz/dashboard
// @match        https://freeltc.fun/dashboard
// @match        https://cryptofuture.co.in/dashboard
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Функция для выполнения перенаправления через 2 секунды
    function redirectAfterDelay() {
        setTimeout(function() {
            const currentUrl = window.location.href;

            // Правила перенаправления
            const redirectRules = {
                'https://earnsolana.xyz/dashboard': 'https://earnsolana.xyz/faucet/currency/sol',
                'https://freeltc.fun/dashboard': 'https://freeltc.fun/faucet/currency/ltc',
                'https://cryptofuture.co.in/dashboard': 'https://cryptofuture.co.in/faucet/currency/LTC'
            };

            // Найти подходящее правило для текущего URL
            for (const [from, to] of Object.entries(redirectRules)) {
                if (currentUrl.startsWith(from)) {
                    window.location.href = to;
                    return;
                }
            }
        }, 2000); // 2000 миллисекунд = 2 секунды
    }

    // Запускаем перенаправление при загрузке страницы
    window.addEventListener('load', redirectAfterDelay);
    
    // Также запускаем для случаев, когда страница уже загружена
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        redirectAfterDelay();
    }
})();
