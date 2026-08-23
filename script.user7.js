// ==UserScript==
// @name         Multi Faucet Error Redirect Chain
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Переключает валюту ТОЛЬКО при обнаружении ошибки
// @author       ChatGPT
// @match        https://vipcoinfaucet.com/*
// @match        https://mrappswala.com/*
// @match        https://miniappfaucet.com/*
// @match        https://linksfly.link/*
// @match        https://gamerlee.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================
    // ЦЕПОЧКИ ВАЛЮТ
    // =========================================================

    const chains = {
        "vipcoinfaucet.com": [
            "BTC","ETH","LTC","BCH","USDT","ZEC","TRX",
            "DOGE","TRUMP","PEPE","DGB","BNB","SOL","DASH"
        ],

        "mrappswala.com": [
            "BTC","LTC","BCH","DOGE","ETH","TON","ZEC",
            "TRUMP","TRX","USDT","BNB","SOL","DGB","PEPE","DASH"
        ],

        "miniappfaucet.com": [
            "BTC","LTC","BCH","ETH","DGB","FEY","TRX",
            "DOGE","PEPE","BNB","SOL","DASH"
        ],

        "linksfly.link": [
            "BTC","LTC","BCH","DOGE","ETH","TON","ZEC",
            "TRUMP","TRX","USDT","BNB","SOL","DGB","PEPE","DASH"
        ],

        "gamerlee.com": [
            "BTC","LTC","BCH","DOGE","ETH","TON","ZEC",
            "TRUMP","TRX","USDT","BNB","SOL","DGB","PEPE","DASH"
        ]
    };

    // =========================================================
    // ТОЛЬКО ЭТИ ФРАЗЫ СЧИТАЮТСЯ ОШИБКОЙ
    // =========================================================

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

    // =========================================================
    // ТЕКУЩАЯ ВАЛЮТА
    // =========================================================

    function getCurrentCurrency() {

        const params = new URLSearchParams(window.location.search);

        let currency = params.get('currency');

        if (currency) {
            return currency.toUpperCase();
        }

        const path = window.location.pathname;

        const match = path.match(
            /\/currency\/([^\/?#]+)/i
        );

        if (match) {
            return match[1].toUpperCase();
        }

        return null;
    }

    // =========================================================
    // СОЗДАНИЕ URL
    // =========================================================

    function buildNewUrl(host, currency) {

        const currentPath = window.location.pathname;
        const currentParams =
            new URLSearchParams(window.location.search);

        // ---------------------------------------------
        // /links/currency/XXX
        // ---------------------------------------------

        if (currentPath.includes('/links/currency/')) {

            const newPath = currentPath.replace(
                /\/currency\/[^\/]+/i,
                `/currency/${currency.toLowerCase()}`
            );

            return `https://${host}${newPath}`;
        }

        // ---------------------------------------------
        // /faucet/currency/XXX
        // ---------------------------------------------

        if (currentPath.includes('/faucet/currency/')) {

            return `https://${host}/faucet/currency/${currency.toLowerCase()}`;
        }

        // ---------------------------------------------
        // /app/faucet?currency=XXX
        // ---------------------------------------------

        if (
            currentPath.includes('/app/faucet') ||
            currentPath.includes('/faucet')
        ) {

            const newParams = new URLSearchParams();

            for (const [key, value] of currentParams) {

                if (key.toLowerCase() !== 'currency') {
                    newParams.set(key, value);
                }
            }

            newParams.set(
                'currency',
                currency.toUpperCase()
            );

            return `https://${host}${currentPath}?${newParams.toString()}`;
        }

        // ---------------------------------------------
        // Запасной вариант
        // ---------------------------------------------

        return `https://${host}/faucet/currency/${currency.toLowerCase()}`;
    }

    // =========================================================
    // ПЕРЕХОД НА СЛЕДУЮЩУЮ ВАЛЮТУ
    // =========================================================

    function performRedirect(
        host,
        chain,
        currentCurrency,
        reason
    ) {

        if (switched) {
            return;
        }

        const index = chain.indexOf(
            currentCurrency
        );

        if (index === -1) {
            console.log(
                '[Faucet] Валюта не найдена в цепочке:',
                currentCurrency
            );
            return;
        }

        const next =
            chain[(index + 1) % chain.length];

        const newUrl =
            buildNewUrl(host, next);

        console.log(
            `[Faucet] ${reason}`
        );

        console.log(
            `[Faucet] ${currentCurrency} → ${next}`
        );

        console.log(
            `[Faucet] URL: ${newUrl}`
        );

        switched = true;

        setTimeout(() => {

            // Дополнительная защита
            if (
                window.location.hostname !== host
            ) {
                return;
            }

            window.location.href = newUrl;

        }, 1000);
    }

    // =========================================================
    // ПРОВЕРКА ОШИБОК
    // =========================================================

    function checkForError() {

        if (switched) {
            return;
        }

        const host =
            window.location.hostname;

        const chain = chains[host];

        // Сайт не входит в список
        if (!chain) {
            return;
        }

        const current =
            getCurrentCurrency();

        // Валюта не определена
        if (!current) {
            return;
        }

        // =====================================================
        // ИЩЕМ ТОЛЬКО ОШИБКУ
        // =====================================================

        const text =
            document.body?.innerText || '';

        let foundPhrase = null;

        for (const phrase of errorPhrases) {

            if (
                text
                    .toLowerCase()
                    .includes(
                        phrase.toLowerCase()
                    )
            ) {

                foundPhrase = phrase;
                break;
            }
        }

        // =====================================================
        // НЕТ ОШИБКИ → НИЧЕГО НЕ ДЕЛАЕМ
        // =====================================================

        if (!foundPhrase) {
            return;
        }

        // =====================================================
        // ОШИБКА НАЙДЕНА
        // =====================================================

        console.log(
            `[Faucet] Обнаружена ошибка: "${foundPhrase}"`
        );

        console.log(
            `[Faucet] Сайт: ${host}`
        );

        console.log(
            `[Faucet] Валюта: ${current}`
        );

        performRedirect(
            host,
            chain,
            current,
            `Error: ${foundPhrase}`
        );
    }

    // =========================================================
    // ПЕРВАЯ ПРОВЕРКА
    // =========================================================

    setTimeout(() => {

        checkForError();

    }, 1500);

    // =========================================================
    // ПЕРИОДИЧЕСКАЯ ПРОВЕРКА
    // =========================================================

    setInterval(() => {

        checkForError();

    }, 2000);

    // =========================================================
    // ОТСЛЕЖИВАНИЕ SPA URL
    // =========================================================

    let lastUrl =
        window.location.href;

    setInterval(() => {

        if (
            window.location.href !== lastUrl
        ) {

            lastUrl =
                window.location.href;

            switched = false;

            setTimeout(() => {

                checkForError();

            }, 1000);
        }

    }, 500);

})();
