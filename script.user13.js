// ==UserScript==
// @name         Unified Faucet Auto-Switcher27898
// @namespace    http://tampermonkey.net/
// @version      7.2
// @description  Unified faucet switcher with active countdown detection
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';


    // =========================================================
    // НАСТРОЙКИ
    // =========================================================

    const faucetSites = [
        'rushfaucet.top',
        'nextfaucet.com',
        'mooncrypto.space',
        'freeflarcrypto.com',
        'bigmobfaucet.com',
        'bitbitflow.online',
        'dogecoindrip.me',
        'tfaucet.com'
    ];

    // Обычный переход
    const NORMAL_DELAY = 35;

    // Переход после обнаружения активного таймера
    const FAST_DELAY = 2;


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
            'https://rushfaucet.top',

        'nextfaucet.com':
            'https://nextfaucet.com',

        'mooncrypto.space':
            'https://mooncrypto.space',

        'freeflarcrypto.com':
            'https://freeflarcrypto.com',

        'bigmobfaucet.com':
            'https://bigmobfaucet.com',

        'bitbitflow.online':
            'https://bitbitflow.online',

        'tfaucet.com':
            'https://tfaucet.com',

        'dogecoindrip.me':
            'https://dogecoindrip.me'

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
                    'normal 55 second timer'
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
    // ОБЩАЯ ПРОВЕРКА ОСТАЛЬНЫХ ТАЙМЕРОВ
    // =========================================================

    function checkForActiveTimer() {

        if (
            switched ||
            fastSwitchStarted
        ) {
            return;
        }

        // 1. COOLDOWN #timer
        let detected =
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

    if (!fastSwitchStarted) {

        startNormalTimer();
    }


    // =========================================================
    // ПРОВЕРКА #countdown[data-next] КАЖДЫЕ 5 СЕКУНД
    // =========================================================

    setInterval(() => {

        if (switched) {
            return;
        }

        const element =
            document.querySelector(
                '#countdown[data-next]'
            );

        if (!element) {
            return;
        }

        const nextTime =
            element.getAttribute(
                'data-next'
            );

        if (!nextTime) {
            return;
        }

        const target =
            new Date(nextTime).getTime();

        if (Number.isNaN(target)) {
            return;
        }

        const remaining =
            Math.floor(
                (target - Date.now()) / 1000
            );

        console.log(
            '[Auto-Switcher] #countdown check:',
            remaining,
            'seconds remaining'
        );

        // Таймер ещё идёт — запускаем быстрый переход
        if (remaining > 0) {

            startFastTimer(
                `#countdown data-next (${remaining}s remaining)`
            );
        }

    }, 5000);


    // =========================================================
    // РЕЗЕРВНАЯ ПРОВЕРКА ОСТАЛЬНЫХ ТАЙМЕРОВ
    // =========================================================

    const backupChecker =
        setInterval(() => {

            if (
                switched ||
                fastSwitchStarted
            ) {

                clearInterval(
                    backupChecker
                );

                return;
            }

            checkForActiveTimer();

        }, 500);

})();