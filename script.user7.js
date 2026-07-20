// ==UserScript==
// @name         Multi Faucet Error Redirect Chain
// @namespace    http://tampermonkey.net/
// @version      1.5
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
        "vipcoinfaucet.com": ["BTC","BCH","ETH","LTC","USDT","ZEC","TRX","DOGE","TRUMP","PEPE","DGB","BNB","SOL","DASH"],
        "mrappswala.com": ["BTC","BCH","LTC","DOGE","ETH","TON","ZEC","TRUMP","TRX","USDT","BNB","SOL","DGB","PEPE","DASH"],
        "miniappfaucet.com": ["BTC","BCH","LTC","BCH","ETH","DGB","FEY","TRX","DOGE","PEPE","DGB","BNB","SOL","DASH"],
        "linksfly.link": ["BTC","BCH","LTC","DOGE","ETH","TON","ZEC","TRUMP","TRX","USDT","BNB","SOL","DGB","PEPE","DASH"],
        "gamerlee.com": ["BTC","BCH","LTC","DOGE","ETH","TON","ZEC","TRUMP","TRX","USDT","BNB","SOL","DGB","PEPE","DASH"]
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
    let lastRedirectTime = 0;
    const MIN_REDIRECT_INTERVAL = 3000; // 3 секунды между редиректами

    function getCurrentCurrency() {
        const host = window.location.hostname;

        // Пробуем получить из URL параметров
        const params = new URLSearchParams(window.location.search);
        let currency = params.get("currency");
        if (currency) return currency.toUpperCase();

        // Пробуем получить из пути URL
        const path = window.location.pathname;
        const match = path.match(/\/currency\/([^\/?#]+)/i);
        if (match) return match[1].toUpperCase();

        // Пробуем получить из URL в целом
        const url = window.location.href;
        const match2 = url.match(/[?&]currency=([^&]+)/i);
        if (match2) return match2[1].toUpperCase();

        const match3 = url.match(/\/currency\/([^\/?#]+)/i);
        if (match3) return match3[1].toUpperCase();

        return null;
    }

    function buildNewUrl(host, currency) {
        // Сохраняем текущий путь и параметры
        const currentPath = window.location.pathname;
        const currentParams = new URLSearchParams(window.location.search);

        // Если текущий путь содержит /faucet/currency/
        if (currentPath.includes('/faucet/currency/')) {
            return `https://${host}/faucet/currency/${currency.toLowerCase()}`;
        }
        // Если текущий путь содержит /app/faucet
        else if (currentPath.includes('/app/faucet') || currentPath.includes('/faucet')) {
            const newParams = new URLSearchParams();
            // Копируем все параметры кроме currency
            for (let [key, value] of currentParams) {
                if (key.toLowerCase() !== 'currency') {
                    newParams.set(key, value);
                }
            }
            newParams.set('currency', currency.toUpperCase());
            return `https://${host}${currentPath}?${newParams.toString()}`;
        }
        // Если не знаем формат - пробуем оба
        else {
            return `https://${host}/faucet/currency/${currency.toLowerCase()}`;
        }
    }

    function getPercentageFromPage() {
        // Ищем элемент с прогресс-баром
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const style = progressBar.getAttribute('style') || '';
            const match = style.match(/width:\s*(\d+)%/);
            if (match) {
                return parseInt(match[1]);
            }
        }

        // Ищем текст с процентами
        const text = document.body.innerText;
        const percentMatch = text.match(/(\d+)%/);
        if (percentMatch) {
            return parseInt(percentMatch[1]);
        }

        return null;
    }

    function getClaimsData() {
        // Ищем текст вида "23/30" или "0/100"
        const text = document.body.innerText;
        const claimsMatch = text.match(/(\d+)\/(\d+)/);
        if (claimsMatch) {
            const current = parseInt(claimsMatch[1]);
            const total = parseInt(claimsMatch[2]);
            return { current, total };
        }

        // Ищем в HTML структуре
        const claimElements = document.querySelectorAll('h3, .card-body h3, .card h3');
        for (let el of claimElements) {
            const text = el.textContent.trim();
            const match = text.match(/(\d+)\/(\d+)/);
            if (match) {
                return {
                    current: parseInt(match[1]),
                    total: parseInt(match[2])
                };
            }
        }

        return null;
    }

    function performRedirect(host, chain, currentCurrency, reason) {
        let index = chain.indexOf(currentCurrency);
        if (index === -1) index = 0;

        let next = chain[(index + 1) % chain.length];

        const now = Date.now();
        if (redirectCount > MAX_REDIRECTS || (now - lastRedirectTime < MIN_REDIRECT_INTERVAL)) {
            console.log('Too many redirects or too fast, waiting...');
            return false;
        }

        redirectCount++;
        lastRedirectTime = now;

        const newUrl = buildNewUrl(host, next);
        console.log(`${reason}: Redirecting from ${currentCurrency} to ${next} | URL: ${newUrl}`);

        if (window.location.href !== newUrl) {
            window.location.href = newUrl;
            return true;
        }
        return false;
    }

    function checkForError() {
        const host = window.location.hostname;
        const chain = chains[host];
        if (!chain) return;

        const current = getCurrentCurrency();
        if (!current) return;

        const text = document.body.innerText;

        // Проверяем наличие ошибок
        let hasError = false;
        for (let phrase of errorPhrases) {
            if (text.includes(phrase)) {
                hasError = true;
                break;
            }
        }

        // ===== НОВАЯ ПРОВЕРКА: процент =====
        const percentage = getPercentageFromPage();
        if (percentage !== null && percentage < 1) {
            console.log(`Percentage is ${percentage}% (< 1%), switching currency...`);
            performRedirect(host, chain, current, 'Low percentage (< 1%)');
            return;
        }

        // ===== НОВАЯ ПРОВЕРКА: клеймы =====
        const claims = getClaimsData();
        if (claims && claims.current === 0 && claims.total > 0) {
            console.log(`Claims: 0/${claims.total}, switching currency...`);
            performRedirect(host, chain, current, 'Zero claims available (0/X)');
            return;
        }

        // Если ошибка на BCH - принудительно переключаем
        if (hasError && current === 'BCH') {
            console.log('BCH error detected, switching...');
            performRedirect(host, chain, current, 'BCH error');
            return;
        }

        // Обычная обработка ошибок для других валют
        if (hasError) {
            performRedirect(host, chain, current, 'Error detected');
        } else {
            // Если ошибки нет - сбрасываем счетчик
            redirectCount = 0;
        }
    }

    // Запускаем проверку с задержкой для загрузки страницы
    setTimeout(checkForError, 1500);
    setInterval(checkForError, 2000);

    // Дополнительно проверяем при изменении URL (для SPA)
    let lastUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            setTimeout(checkForError, 1000);
        }
    }, 500);

})();
