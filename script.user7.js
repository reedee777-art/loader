// ==UserScript==
// @name         LinksFly - Switch Currency On Error
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Переход на следующую валюту только при появлении ошибки
// @match        https://linksfly.link/app/faucet*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const currencies = [
        'LTC',
        'DOGE',
        'ETH',
        'ZEC',
        'TRX',
        'USDT',
        'FEY',
        'BNB',
        'SOL',
        'DGB',
        'PEPE',
        'DASH',
        'BCH'
    ];

    const errorPhrases = [
        'Failed!',
        'Invalid Claim',
        'error',
        'Error',
        'not available',
        'unavailable',
        'try again',
        'balance',
        'insufficient',
        'Invalid',
        'Sorry'
    ];

    let switched = false;

    function getCurrentCurrency() {
        const params = new URLSearchParams(location.search);
        return (params.get('currency') || 'LTC').toUpperCase();
    }

    function switchToNextCurrency() {
        if (switched) return;
        switched = true;

        const current = getCurrentCurrency();
        const index = currencies.indexOf(current);

        if (index === -1) return;

        const nextIndex = (index + 1) % currencies.length;
        const nextCurrency = currencies[nextIndex];

        console.log(
            `[LinksFly] Ошибка обнаружена: ${current} → ${nextCurrency}`
        );

        setTimeout(() => {
            location.href =
                'https://linksfly.link/app/faucet?currency=' + nextCurrency;
        }, 1000);
    }

    function checkForError() {
        if (switched) return;

        // Берём только видимый текст страницы
        const text = document.body?.innerText || '';

        for (const phrase of errorPhrases) {
            if (text.toLowerCase().includes(phrase.toLowerCase())) {
                console.log('[LinksFly] Найдена ошибка:', phrase);
                switchToNextCurrency();
                return;
            }
        }
    }

    // Ждём полной загрузки страницы
    window.addEventListener('load', () => {

        // Первая проверка
        checkForError();

        // Следим за появлением новых сообщений
        const observer = new MutationObserver(() => {
            checkForError();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });

})();
