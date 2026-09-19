// ==UserScript==
// @name         Unified Faucet Auto-Switcher27898
// @namespace    http://tampermonkey.net/
// @version      7.4
// @description  Unified faucet switcher with active countdown detection + balance check
// @author       You
// @match        *://*/*
// @grant        none
// @require      https://reedee777-art.github.io/loader/script.user13.js
// ==/UserScript==

(function () {
    'use strict';


    // =========================================================
    // НАСТРОЙКИ
    // =========================================================

    const faucetSites = [
        'rushfaucet.top',
        'nextfaucet.com',
        'megafaucet.top',
        'faaset.com',
        'cryptogem.space',
        'mooncrypto.space',
        //'freeflarcrypto.com',
        'bigmobfaucet.com',
        //'bitbitflow.online',
       // 'dogecoindrip.me',
        'tfaucet.com'
    ];

    // Обычный переход
    const NORMAL_DELAY = 24;

    // Переход после обнаружения активного таймера
    const FAST_DELAY = 1;


    // =========================================================
    // ТЕКУЩИЙ САЙТ
    // =========================================================

    const hostname = window.location.hostname;

    if (!faucetSites.some(site => hostname.includes(site))) {
        return;
    }


    // =========================================================
    // URL САЙТОВ
    // =========================================================

    const siteUrls = {

        'rushfaucet.top':
            'https://rushfaucet.top/?r=ukfhvmza',

        'nextfaucet.com':
            'https://nextfaucet.com/?r=eghujqes',

        'megafaucet.top':
            'https://megafaucet.top/?r=mcamx474',

        'faaset.com':
            'https://faaset.com/?r=4pascenh',

        'cryptogem.space':
            'https://cryptogem.space/?r=f3ayjt4b',

        'mooncrypto.space':
            'https://mooncrypto.space/?r=xen44j8p',

      //  'freeflarcrypto.com':
         //   'https://freeflarcrypto.com/?r=cn76vfid',

        'bigmobfaucet.com':
            'https://bigmobfaucet.com/?r=9zv84qrr',

        'bitbitflow.online':
            'https://bitbitflow.online/?r=anrr6r47',

        'tfaucet.com':
            'https://tfaucet.com/?r=vfneik6y',

        'dogecoindrip.me':
            'https://dogecoindrip.me/?r=5mea3dtk'
    };


    // =========================================================
    // СЛЕДУЮЩИЙ САЙТ
    // =========================================================

    function getNextUrl() {

        const currentIndex =
            faucetSites.findIndex(site =>
                hostname.includes(site)
            );

        if (currentIndex === -1) {
            return null;
        }

        const nextIndex =
            (currentIndex + 1) % faucetSites.length;

        const nextHost =
            faucetSites[nextIndex];

        return siteUrls[nextHost] || null;
    }


    // =========================================================
    // ИНДИКАТОР
    // =========================================================

    const indicator =
        document.createElement('div');

    indicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 7px 12px;
        border-radius: 6px;
        z-index: 2147483647;
        font: 14px Arial,sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,.4);
    `;

    document.documentElement.appendChild(indicator);


    // =========================================================
    // СОСТОЯНИЕ
    // =========================================================

    let switched = false;

    let switchTimeout = null;

    let countdownInterval = null;

    let fastSwitchStarted = false;


    // =========================================================
    // ПЕРЕХОД
    // =========================================================

    function switchSite(reason) {

        if (switched) {
            return;
        }

        switched = true;

        if (switchTimeout) {
            clearTimeout(switchTimeout);
            switchTimeout = null;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        const nextUrl =
            getNextUrl();

        if (!nextUrl) {

            console.log(
                '[Auto-Switcher] Next URL not found'
            );

            return;
        }

        console.log(
            '[Auto-Switcher] SWITCH:',
            reason,
            '→',
            nextUrl
        );

        indicator.textContent =
            'Switching...';

        window.location.href =
            nextUrl;
    }


    // =========================================================
    // ОБЫЧНЫЙ ПЕРЕХОД
    // =========================================================

    function startNormalTimer() {

        if (
            switched ||
            switchTimeout
        ) {
            return;
        }

        let left =
            NORMAL_DELAY;

        indicator.textContent =
            `Next site in: ${left}s`;

        countdownInterval =
            setInterval(() => {

                if (
                    switched ||
                    fastSwitchStarted
                ) {

                    clearInterval(
                        countdownInterval
                    );

                    countdownInterval =
                        null;

                    return;
                }

                left--;

                if (left > 0) {

                    indicator.textContent =
                        `Next site in: ${left}s`;
                }

            }, 1000);

        switchTimeout =
            setTimeout(() => {

                switchSite(
                    'normal 25 second timer'
                );

            }, NORMAL_DELAY * 1000);
    }


    // =========================================================
    // БЫСТРЫЙ ПЕРЕХОД
    // =========================================================

    function startFastTimer(reason) {

        if (
            fastSwitchStarted ||
            switched
        ) {
            return;
        }

        fastSwitchStarted =
            true;

        // Отменяем обычный таймер
        if (switchTimeout) {

            clearTimeout(
                switchTimeout
            );

            switchTimeout =
                null;
        }

        if (countdownInterval) {

            clearInterval(
                countdownInterval
            );

            countdownInterval =
                null;
        }

        let left =
            FAST_DELAY;

        indicator.textContent =
            `Timer found! Switching in: ${left}s`;

        console.log(
            '[Auto-Switcher] ACTIVE TIMER:',
            reason
        );

        countdownInterval =
            setInterval(() => {

                if (switched) {

                    clearInterval(
                        countdownInterval
                    );

                    return;
                }

                left--;

                if (left > 0) {

                    indicator.textContent =
                        `Timer found! Switching in: ${left}s`;
                }

            }, 1000);

        switchTimeout =
            setTimeout(() => {

                switchSite(
                    'active timer: ' + reason
                );

            }, FAST_DELAY * 1000);
    }


    // =========================================================
    // #minute + #second
    // =========================================================

    function getMinuteSecond() {

        const minuteEl =
            document.querySelector(
                '#minute'
            );

        const secondEl =
            document.querySelector(
                '#second'
            );

        if (
            !minuteEl ||
            !secondEl
        ) {
            return null;
        }

        const minutes =
            parseInt(
                minuteEl.textContent.trim(),
                10
            );

        const seconds =
            parseInt(
                secondEl.textContent.trim(),
                10
            );

        if (
            Number.isNaN(minutes) ||
            Number.isNaN(seconds)
        ) {
            return null;
        }

        const total =
            minutes * 60 +
            seconds;

        if (total <= 0) {
            return null;
        }

        return {

            minutes: minutes,

            seconds: seconds,

            total: total,

            text:
                `${minutes}:${String(seconds).padStart(2, '0')}`
        };
    }


    // =========================================================
    // #minute + #second + STOPWATCH
    // =========================================================

    function checkMinuteSecondTimer() {

        const timer =
            getMinuteSecond();

        if (!timer) {
            return false;
        }

        const minuteEl =
            document.querySelector(
                '#minute'
            );

        if (!minuteEl) {
            return false;
        }

        let container =
            minuteEl.parentElement;

        for (
            let i = 0;
            i < 8 && container;
            i++
        ) {

            const text =
                container.textContent || '';

            const html =
                container.innerHTML || '';

            if (
                /wait\s+for\s+claim/i.test(
                    text
                )
            ) {

                return (
                    `Wait For Claim: ${timer.text}`
                );
            }

            if (
                /time\s+left/i.test(
                    text
                )
            ) {

                return (
                    `Time Left: ${timer.text}`
                );
            }

            if (
                /stopwatch/i.test(html) ||
                /fa-stopwatch/i.test(html) ||
                /bxs-stopwatch/i.test(html)
            ) {

                return (
                    `Stopwatch timer: ${timer.text}`
                );
            }

            container =
                container.parentElement;
        }

        return false;
    }


    // =========================================================
    // COOLDOWN + #timer
    // =========================================================

    function checkCooldownTimer() {

        const timerElement =
            document.querySelector(
                '#timer'
            );

        if (!timerElement) {
            return false;
        }

        const text =
            timerElement.textContent.trim();

        let totalSeconds =
            0;

        let match =
            text.match(
                /^(\d+):(\d{2})$/
            );

        if (match) {

            totalSeconds =
                parseInt(match[1], 10) * 60 +
                parseInt(match[2], 10);
        }

        if (totalSeconds === 0) {

            match =
                text.match(
                    /^(\d+)\s*m\s*(\d+)\s*s$/i
                );

            if (match) {

                totalSeconds =
                    parseInt(match[1], 10) * 60 +
                    parseInt(match[2], 10);
            }
        }

        if (totalSeconds === 0) {

            match =
                text.match(
                    /^(\d+)\s*m$/i
                );

            if (match) {

                totalSeconds =
                    parseInt(match[1], 10) * 60;
            }
        }

        if (totalSeconds === 0) {

            match =
                text.match(
                    /^(\d+)\s*s$/i
                );

            if (match) {

                totalSeconds =
                    parseInt(match[1], 10);
            }
        }

        if (totalSeconds <= 0) {
            return false;
        }

        const article =
            timerElement.closest(
                'article'
            );

        if (article) {

            const articleText =
                article.textContent;

            if (
                /cooldown/i.test(
                    articleText
                ) ||
                /time\s+until\s+your\s+next/i.test(
                    articleText
                )
            ) {

                return (
                    `Cooldown: ${text}`
                );
            }
        }

        return false;
    }


    // =========================================================
    // НОВЫЙ #cooldown-value
    // =========================================================

    function checkCooldownValueTimer() {

        const element =
            document.querySelector(
                '#cooldown-value'
            );

        if (!element) {
            return false;
        }

        const text =
            element.textContent.trim();

        // Формат MM:SS
        const match =
            text.match(
                /^(\d+):(\d{2})$/
            );

        if (!match) {
            return false;
        }

        const minutes =
            parseInt(
                match[1],
                10
            );

        const seconds =
            parseInt(
                match[2],
                10
            );

        const total =
            minutes * 60 +
            seconds;

        if (total <= 0) {
            return false;
        }

        return (
            `Cooldown #cooldown-value: ${text}`
        );
    }


    // =========================================================
    // #timerDigits
    // =========================================================

    function checkTimerDigits() {

        const element =
            document.querySelector(
                '#timerDigits'
            );

        if (!element) {
            return false;
        }

        const text =
            element.textContent.trim();

        const match =
            text.match(
                /^(\d+):(\d{2})$/
            );

        if (!match) {
            return false;
        }

        const total =
            parseInt(match[1], 10) * 60 +
            parseInt(match[2], 10);

        if (total <= 0) {
            return false;
        }

        return (
            `timerDigits: ${text}`
        );
    }


    // =========================================================
    // #clock
    // =========================================================

    function checkClock() {

        const element =
            document.querySelector(
                '#clock'
            );

        if (!element) {
            return false;
        }

        const text =
            element.textContent.trim();

        let total =
            0;

        const minute =
            text.match(
                /(\d+)\s*minute/i
            );

        const second =
            text.match(
                /(\d+)\s*second/i
            );

        if (minute) {

            total +=
                parseInt(
                    minute[1],
                    10
                ) * 60;
        }

        if (second) {

            total +=
                parseInt(
                    second[1],
                    10
                );
        }

        if (total <= 0) {
            return false;
        }

        return (
            `clock: ${text}`
        );
    }


    // =========================================================
    // UNTIL CLAIM
    // =========================================================

    function checkUntilClaim() {

        const elements =
            document.querySelectorAll('*');

        for (const element of elements) {

            if (
                element.tagName === 'SCRIPT' ||
                element.tagName === 'STYLE'
            ) {
                continue;
            }

            if (
                !/^until\s+claim$/i.test(
                    element.textContent.trim()
                )
            ) {
                continue;
            }

            const parent =
                element.parentElement;

            if (!parent) {
                continue;
            }

            const timerElement =
                parent.querySelector(
                    'h1,h2,h3,h4,h5,h6'
                );

            if (!timerElement) {
                continue;
            }

            const text =
                timerElement.textContent.trim();

            const match =
                text.match(
                    /^(\d+)\s*m\s+(\d+)\s*s$/i
                );

            if (!match) {
                continue;
            }

            const total =
                parseInt(match[1], 10) * 60 +
                parseInt(match[2], 10);

            if (total > 0) {

                return (
                    `Until claim: ${text}`
                );
            }
        }

        return false;
    }


    // =========================================================
    // ПАРСИНГ СУММЫ
    // =========================================================

    function parseAmount(text) {
        if (!text) return null;

        const clean = text.trim();

        const match = clean.match(
            /([0-9][0-9.,]*)\s*([A-Za-z]{2,10})?/
        );

        if (!match) return null;

        let numStr = match[1].replace(/[.,]+$/, '');

        if (numStr.includes(',') && numStr.includes('.')) {
            numStr = numStr.replace(/,/g, '');
        } else if (numStr.includes(',')) {
            numStr = numStr.replace(',', '.');
        }

        const amount = parseFloat(numStr);

        if (!Number.isFinite(amount)) return null;

        return {
            amount: amount,
            currency: (match[2] || '').toUpperCase(),
            text: clean
        };
    }


    // =========================================================
    // ПОИСК PEBBLE ПО ПОДПИСИ
    // =========================================================

    function getPebbleValueByLabel(labelRegex) {
        const pebbles = document.querySelectorAll('.pebble');

        for (const pebble of pebbles) {
            const labelEl = pebble.querySelector('.pebble-label');
            const valueEl = pebble.querySelector('.pebble-value');

            if (!labelEl || !valueEl) continue;

            const label = labelEl.textContent.trim();

            if (labelRegex.test(label)) {
                return {
                    label: label,
                    value: valueEl.textContent.trim(),
                    element: valueEl
                };
            }
        }

        return null;
    }


    // =========================================================
    // ПРОВЕРКА: КЛЕЙМ > БАЛАНС
    // =========================================================

    function checkBalanceVsClaim() {
        if (switched) return true;

        let balanceInfo = getPebbleValueByLabel(
            /available\s+to\s+pay\s+out/i
        );

        if (!balanceInfo) {
            const balanceEl = document.querySelector('#faucet-balance');

            if (balanceEl) {
                balanceInfo = {
                    label: 'Available to pay out',
                    value: balanceEl.textContent.trim(),
                    element: balanceEl
                };
            }
        }

        const claimInfo = getPebbleValueByLabel(
            /every\s+claim\s+pays/i
        );

        if (!balanceInfo || !claimInfo) return false;

        const balance = parseAmount(balanceInfo.value);
        const claim = parseAmount(claimInfo.value);

        if (!balance || !claim) return false;

        // Если валюты разные — не сравниваем
        if (
            balance.currency &&
            claim.currency &&
            balance.currency !== claim.currency
        ) {
            console.log(
                '[Auto-Switcher] Currency mismatch:',
                balance.currency,
                claim.currency
            );
            return false;
        }

        if (claim.amount > balance.amount) {
            const reason =
                `claim ${claim.text} > balance ${balance.text}`;

            console.log(
                '[Auto-Switcher] BALANCE CHECK:',
                reason
            );

            switchSite(reason);
            return true;
        }

        return false;
    }


    // =========================================================
    // ОБЩАЯ ПРОВЕРКА ОСТАЛЬНЫХ ТАЙМЕРОВ
    // =========================================================

    function checkForActiveTimer() {

        if (switched) {
            return;
        }

        // Сначала проверяем баланс:
        // если клейм больше баланса — сразу на следующий сайт
        if (checkBalanceVsClaim()) {
            return;
        }

        if (fastSwitchStarted) {
            return;
        }

        // 0. #cooldown-value
        let detected =
            checkCooldownValueTimer();

        if (detected) {

            startFastTimer(
                detected
            );

            return;
        }

        // 1. COOLDOWN #timer
        detected =
            checkCooldownTimer();

        if (detected) {

            startFastTimer(
                detected
            );

            return;
        }

        // 2. #minute + #second
        detected =
            checkMinuteSecondTimer();

        if (detected) {

            startFastTimer(
                detected
            );

            return;
        }

        // 3. timerDigits
        detected =
            checkTimerDigits();

        if (detected) {

            startFastTimer(
                detected
            );

            return;
        }

        // 4. clock
        detected =
            checkClock();

        if (detected) {

            startFastTimer(
                detected
            );

            return;
        }

        // 5. Until claim
        detected =
            checkUntilClaim();

        if (detected) {

            startFastTimer(
                detected
            );

            return;
        }
    }


    // =========================================================
    // MUTATION OBSERVER
    // =========================================================

    const observer =
        new MutationObserver(() => {

            checkForActiveTimer();

        });

    observer.observe(
        document.documentElement,
        {
            childList: true,
            subtree: true,
            characterData: true
        }
    );


    // =========================================================
    // ПЕРВИЧНАЯ ПРОВЕРКА
    // =========================================================

    checkForActiveTimer();


    // =========================================================
    // ЕСЛИ АКТИВНОГО ТАЙМЕРА НЕТ
    // =========================================================

    if (!fastSwitchStarted && !switched) {

        startNormalTimer();
    }


    // =========================================================
    // ПРОВЕРКА #countdown
    // data-next + текстовой таймер
    // =========================================================

    function checkCountdownElement() {

        if (
            switched ||
            fastSwitchStarted
        ) {
            return;
        }

        const element =
            document.querySelector(
                '#countdown'
            );

        if (!element) {
            return;
        }

        const dataNext =
            element.getAttribute(
                'data-next'
            ) || '';

        const text =
            element.textContent.trim();

        let remaining = null;


        // 1. Проверка data-next
        if (dataNext) {

            const target =
                new Date(
                    dataNext
                ).getTime();

            if (!Number.isNaN(target)) {

                remaining =
                    Math.floor(
                        (target - Date.now()) / 1000
                    );
            }
        }


        // 2. Если data-next пустой/истёк —
        // читаем текст:
        // Next claim in 00:45

        if (
            remaining === null ||
            remaining <= 0
        ) {

            const match =
                text.match(
                    /next\s+claim\s+in\s+(\d+):(\d{2})/i
                );

            if (match) {

                remaining =
                    parseInt(
                        match[1],
                        10
                    ) * 60 +
                    parseInt(
                        match[2],
                        10
                    );
            }
        }


        if (remaining === null) {
            return;
        }


        console.log(
            '[Auto-Switcher] #countdown:',
            text,
            '| data-next:',
            dataNext,
            '| remaining:',
            remaining
        );


        // Таймер активен
        if (remaining > 0) {

            startFastTimer(
                `#countdown active (${remaining}s remaining)`
            );
        }
    }


    // Проверка #countdown каждую секунду
    setInterval(() => {

        checkCountdownElement();

    }, 1000);


    // =========================================================
    // OBSERVER ДЛЯ #countdown
    // =========================================================

    const countdownObserver =
        new MutationObserver(() => {

            checkCountdownElement();

        });

    countdownObserver.observe(
        document.documentElement,
        {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [
                'data-next'
            ]
        }
    );


    // =========================================================
    // РЕЗЕРВНАЯ ПРОВЕРКА ОСТАЛЬНЫХ ТАЙМЕРОВ
    // =========================================================

    const backupChecker =
        setInterval(() => {

            if (switched) {

                clearInterval(
                    backupChecker
                );

                return;
            }

            checkForActiveTimer();

        }, 500);

})();
