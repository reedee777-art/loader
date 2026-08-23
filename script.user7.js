// ==UserScript==
// @name         Multi Faucet Error Redirect Chain
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  При ошибке переключает валюты на faucet сайтах + проверка процентов и клеймов
// @author       ChatGPT
// @match        https://vipcoinfaucet.com/*
// @match        https://mrappswala.com/*
// @match        https://miniappfaucet.com/*
// @match        https://linksfly.link/*
// @match        https://gamerlee.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

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

    let redirectCount = 0;

    const MAX_REDIRECTS = 30;
    const MIN_REDIRECT_INTERVAL = 3000;

    let lastRedirectTime = 0;


    // =========================================================
    // Получение текущей валюты
    // =========================================================

    function getCurrentCurrency() {
        // 1. Из параметра ?currency=XXX
        const params = new URLSearchParams(window.location.search);

        let currency = params.get("currency");

        if (currency) {
            return currency.toUpperCase();
        }


        // 2. Из /currency/XXX
        const path = window.location.pathname;

        const match = path.match(/\/currency\/([^\/?#]+)/i);

        if (match) {
            return match[1].toUpperCase();
        }


        // 3. Из полного URL
        const url = window.location.href;

        const match2 = url.match(/[?&]currency=([^&]+)/i);

        if (match2) {
            return decodeURIComponent(match2[1]).toUpperCase();
        }


        // 4. Из /currency/XXX в полном URL
        const match3 = url.match(/\/currency\/([^\/?#]+)/i);

        if (match3) {
            return match3[1].toUpperCase();
        }


        return null;
    }


    // =========================================================
    // Специальная проверка DASH
    // =========================================================

    function isDashCurrency(currency) {
        return currency &&
               currency.toUpperCase() === 'DASH';
    }


    // =========================================================
    // НОВЫЙ ФОРМАТ URL
    //
    // ВСЕГДА:
    // https://домен/app/faucet?currency=XXX
    // =========================================================

    function buildNewUrl(host, currency) {

        return `https://${host}/app/faucet?currency=${encodeURIComponent(
            currency.toUpperCase()
        )}`;
    }


    // =========================================================
    // Получение процента
    // =========================================================

    function getPercentageFromPage() {

        // Ищем progress-bar
        const progressBar = document.querySelector('.progress-bar');

        if (progressBar) {

            const style =
                progressBar.getAttribute('style') || '';

            const match =
                style.match(/width:\s*(\d+)%/);

            if (match) {
                return parseInt(match[1]);
            }
        }


        // Ищем процент в тексте страницы
        const text = document.body.innerText;

        const percentMatch =
            text.match(/(\d+)%/);

        if (percentMatch) {
            return parseInt(percentMatch[1]);
        }


        return null;
    }


    // =========================================================
    // Получение количества клеймов
    // =========================================================

    function getClaimsData() {

        const text = document.body.innerText;

        // Например:
        // 23/30
        // 0/100
        const claimsMatch =
            text.match(/(\d+)\/(\d+)/);

        if (claimsMatch) {

            const current =
                parseInt(claimsMatch[1]);

            const total =
                parseInt(claimsMatch[2]);

            return {
                current,
                total
            };
        }


        // Проверяем HTML элементы
        const claimElements =
            document.querySelectorAll(
                'h3, .card-body h3, .card h3'
            );

        for (let el of claimElements) {

            const text =
                el.textContent.trim();

            const match =
                text.match(/(\d+)\/(\d+)/);

            if (match) {

                return {
                    current: parseInt(match[1]),
                    total: parseInt(match[2])
                };
            }
        }


        return null;
    }


    // =========================================================
    // Выполнение редиректа
    // =========================================================

    function performRedirect(
        host,
        chain,
        currentCurrency,
        reason
    ) {

        let index =
            chain.indexOf(currentCurrency);


        // Если валюты нет в цепочке
        // начинаем с первой
        if (index === -1) {
            index = 0;
        }


        // Следующая валюта
        let next =
            chain[(index + 1) % chain.length];


        // =====================================================
        // СПЕЦИАЛЬНО:
        // DASH -> LTC
        //
        // Теперь тоже:
        // /app/faucet?currency=LTC
        // =====================================================

        const currentPath =
            window.location.pathname;

        if (
            currentPath.includes('/links/currency/') &&
            isDashCurrency(currentCurrency)
        ) {

            next = 'LTC';

            console.log(
                `Special redirect: ${currentCurrency} -> ${next}`
            );
        }


        // =====================================================
        // Защита от слишком частых редиректов
        // =====================================================

        const now = Date.now();

        if (
            redirectCount > MAX_REDIRECTS ||
            (now - lastRedirectTime <
             MIN_REDIRECT_INTERVAL)
        ) {

            console.log(
                'Too many redirects or too fast, waiting...'
            );

            return false;
        }


        redirectCount++;

        lastRedirectTime = now;


        // =====================================================
        // Создаём новый URL
        // =====================================================

        const newUrl =
            buildNewUrl(host, next);


        console.log(
            `${reason}: ` +
            `${currentCurrency} -> ${next}`
        );

        console.log(
            `Redirect URL: ${newUrl}`
        );


        // =====================================================
        // Переход
        // =====================================================

        if (
            window.location.href !== newUrl
        ) {

            window.location.href =
                newUrl;

            return true;
        }


        return false;
    }


    // =========================================================
    // Основная проверка
    // =========================================================

    function checkForError() {

        const host =
            window.location.hostname;


        const chain =
            chains[host];


        if (!chain) {
            return;
        }


        // Получаем текущую валюту
        const current =
            getCurrentCurrency();


        if (!current) {
            return;
        }


        const text =
            document.body.innerText;


        const currentPath =
            window.location.pathname;


        // =====================================================
        // СПЕЦИАЛЬНЫЙ СЛУЧАЙ:
        // /links/currency/DASH
        //
        // DASH -> LTC
        // =====================================================

        if (
            currentPath.includes('/links/currency/') &&
            isDashCurrency(current)
        ) {

            console.log(
                `Found ${current} on /links/currency/ page`
            );

            console.log(
                'Redirecting to LTC...'
            );


            performRedirect(
                host,
                chain,
                current,
                `${current} on /links/currency/ page`
            );

            return;
        }


        // =====================================================
        // Проверка ошибок
        // =====================================================

        let hasError = false;


        for (
            let phrase of errorPhrases
        ) {

            if (
                text.includes(phrase)
            ) {

                hasError = true;

                console.log(
                    `Error phrase detected: ${phrase}`
                );

                break;
            }
        }


        // =====================================================
        // ПРОВЕРКА ПРОЦЕНТА
        // =====================================================

        const percentage =
            getPercentageFromPage();


        if (
            percentage !== null &&
            percentage < 1
        ) {

            console.log(
                `Percentage is ${percentage}% (< 1%), switching currency...`
            );


            performRedirect(
                host,
                chain,
                current,
                'Low percentage (< 1%)'
            );

            return;
        }


        // =====================================================
        // ПРОВЕРКА КЛЕЙМОВ
        // =====================================================

        const claims =
            getClaimsData();


        if (
            claims &&
            claims.current === 0 &&
            claims.total > 0
        ) {

            console.log(
                `Claims: 0/${claims.total}, switching currency...`
            );


            performRedirect(
                host,
                chain,
                current,
                'Zero claims available (0/X)'
            );

            return;
        }


        // =====================================================
        // ЕСЛИ ОШИБКА НА BCH
        // =====================================================

        if (
            hasError &&
            current === 'BCH'
        ) {

            console.log(
                'BCH error detected, switching...'
            );


            performRedirect(
                host,
                chain,
                current,
                'BCH error'
            );

            return;
        }


        // =====================================================
        // ОБЫЧНАЯ ОБРАБОТКА ОШИБОК
        // =====================================================

        if (hasError) {

            performRedirect(
                host,
                chain,
                current,
                'Error detected'
            );

        } else {

            // Ошибки нет — сбрасываем счётчик
            redirectCount = 0;
        }
    }


    // =========================================================
    // Первый запуск через 1.5 секунды
    // =========================================================

    setTimeout(
        checkForError,
        1500
    );


    // =========================================================
    // Проверка каждые 2 секунды
    // =========================================================

    setInterval(
        checkForError,
        2000
    );


    // =========================================================
    // Отслеживание изменения URL
    // Для SPA
    // =========================================================

    let lastUrl =
        window.location.href;


    setInterval(() => {

        if (
            window.location.href !== lastUrl
        ) {

            lastUrl =
                window.location.href;


            setTimeout(
                checkForError,
                1000
            );
        }

    }, 500);

})();
