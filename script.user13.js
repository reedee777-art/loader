// ==UserScript==
// @name         Unified Faucet Auto-Switcher27898
// @namespace    http://tampermonkey.net/
// @version      7.6
// @description  Unified faucet switcher with active countdown detection + balance check + time-restricted sites
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
        //'rushfaucet.top',
        // 'orthofaucet.com',
        'nextfaucet.com',
        'pocketfaucet.website',        
        //'takeltc.site',        
         'prairiehash.com',       
        'luckfaucet.online',
        'freeltc5m.site',        
        // 'diamondfaucet.site',
        'crypto-faucet.site',
        // 'mycryptocoin.click',
        //'megafaucet.top',
        // 'heavenltc.site',
         'wcfaucet.site',
        //'faaset.com',
         'mooncrypto.space',
        'pkfaucet.top',
        // 'cryptogem.space',
        // 'dmcrypto.site',
        //'freeflarcrypto.com',
        // 'tfaucet.com',
        'bigmobfaucet.com'
        //'bitbitflow.online',
        //'dogecoindrip.me',
    ];

    const NORMAL_DELAY = 24;
    const FAST_DELAY   = 2;


    // =========================================================
    // САЙТЫ, ДОСТУПНЫЕ ТОЛЬКО С 03:00 ДО 12:00
    // =========================================================

    const TIME_RESTRICTED_SITES = [
        'luckfaucet.online',
          'freeltc5m.site',      
        'wcfaucet.site',
        'tfaucet.com'
    ];

    // Окно доступа (часы, локальное время браузера)
    const ALLOWED_HOUR_FROM = 3;   // 03:00 включительно
    const ALLOWED_HOUR_TO   = 14;  // 12:00 НЕ включительно

    function isTimeAllowedNow() {
        const h = new Date().getHours();
        return h >= ALLOWED_HOUR_FROM && h < ALLOWED_HOUR_TO;
    }

    function isRestrictedSite(site) {
        return TIME_RESTRICTED_SITES.includes(site);
    }


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
        'rushfaucet.top':           'https://rushfaucet.top/?r=ukfhvmza',
        'wcfaucet.site':            'https://wcfaucet.site/?r=2jbdw363',
        'freeltc5m.site':            'https://freeltc5m.site/',        
        'takeltc.site':            'https://takeltc.site/?r=dhgtyyj7',        
        'prairiehash.com':            'https://prairiehash.com/?r=sye9986g',        
        'diamondfaucet.site':       'https://diamondfaucet.site/?r=k5wpbx4x',
        'crypto-faucet.site':       'https://crypto-faucet.site/?r=g3rczpj9',
        'mycryptocoin.click':       'https://mycryptocoin.click/?r=ty36rnj2',
        'luckfaucet.online':        'https://luckfaucet.online/',
        'freeflarcrypto.com':       'https://freeflarcrypto.com/?r=gb7qygfp',
        'nextfaucet.com':           'https://nextfaucet.com/?r=eghujqes',
        'heavenltc.site':           'https://heavenltc.site/',
        'megafaucet.top':           'https://megafaucet.top/?r=mcamx474',
        'pocketfaucet.website':     'https://pocketfaucet.website/?r=g9ybxafz',
        'faaset.com':               'https://faaset.com/?r=4pascenh',
        'pkfaucet.top':             'https://pkfaucet.top/?r=vznc96ex',
        'dmcrypto.site':            'https://dmcrypto.site/?r=6ruphfyk',
        'mooncrypto.space':         'https://mooncrypto.space/?r=xen44j8p',
        'orthofaucet.com':          'https://orthofaucet.com/',
        'bigmobfaucet.com':         'https://bigmobfaucet.com/?r=9zv84qrr',
        'bitbitflow.online':        'https://bitbitflow.online/?r=anrr6r47',
        'tfaucet.com':              'https://tfaucet.com/?r=vfneik6y',
        'dogecoindrip.me':          'https://dogecoindrip.me/?r=5mea3dtk'
    };


    // =========================================================
    // СЛЕДУЮЩИЙ САЙТ
    // =========================================================

    function getNextUrl() {
        const currentIndex = faucetSites.findIndex(site =>
            hostname.includes(site)
        );

        if (currentIndex === -1) return null;

        const allowRestricted = isTimeAllowedNow();

        // Идём по кругу и ищем первый подходящий сайт
        for (let step = 1; step <= faucetSites.length; step++) {
            const nextIndex = (currentIndex + step) % faucetSites.length;
            const nextHost  = faucetSites[nextIndex];

            // не возвращаемся на текущий
            if (hostname.includes(nextHost)) continue;

            // вне временного окна — пропускаем "ночные" сайты
            if (!allowRestricted && isRestrictedSite(nextHost)) {
                console.log('[Auto-Switcher] skip (time-restricted):', nextHost);
                continue;
            }

            return siteUrls[nextHost] || null;
        }

        return null;
    }


    // =========================================================
    // ИНДИКАТОР
    // =========================================================

    const indicator = document.createElement('div');

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

    let switched          = false;
    let switchTimeout     = null;
    let countdownInterval = null;
    let fastSwitchStarted = false;


    // =========================================================
    // ПЕРЕХОД
    // =========================================================

    function switchSite(reason) {
        if (switched) return;
        switched = true;

        if (switchTimeout)     { clearTimeout(switchTimeout);   switchTimeout = null; }
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

        const nextUrl = getNextUrl();

        if (!nextUrl) {
            console.log('[Auto-Switcher] Next URL not found');
            return;
        }

        console.log('[Auto-Switcher] SWITCH:', reason, '→', nextUrl);
        indicator.textContent = 'Switching...';
        window.location.href = nextUrl;
    }


    // =========================================================
    // ОБЫЧНЫЙ ТАЙМЕР
    // =========================================================

    function startNormalTimer() {
        if (switched || switchTimeout) return;

        let left = NORMAL_DELAY;
        indicator.textContent = `Next site in: ${left}s`;

        countdownInterval = setInterval(() => {
            if (switched || fastSwitchStarted) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                return;
            }
            left--;
            if (left > 0) {
                indicator.textContent = `Next site in: ${left}s`;
            }
        }, 1000);

        switchTimeout = setTimeout(() => {
            switchSite('normal 25 second timer');
        }, NORMAL_DELAY * 1000);
    }


    // =========================================================
    // БЫСТРЫЙ ТАЙМЕР
    // =========================================================

    function startFastTimer(reason) {
        if (fastSwitchStarted || switched) return;
        fastSwitchStarted = true;

        if (switchTimeout)     { clearTimeout(switchTimeout);     switchTimeout = null; }
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

        let left = FAST_DELAY;
        indicator.textContent = `Timer found! Switching in: ${left}s`;
        console.log('[Auto-Switcher] ACTIVE TIMER:', reason);

        countdownInterval = setInterval(() => {
            if (switched) {
                clearInterval(countdownInterval);
                return;
            }
            left--;
            if (left > 0) {
                indicator.textContent = `Timer found! Switching in: ${left}s`;
            }
        }, 1000);

        switchTimeout = setTimeout(() => {
            switchSite('active timer: ' + reason);
        }, FAST_DELAY * 1000);
    }


    // =========================================================
    // УНИВЕРСАЛЬНЫЙ ПАРСЕР ТЕКСТА ТАЙМЕРА
    // Поддерживает: HH:MM:SS, MM:SS, "9m 40s", "9m", "40s",
    // "9 minutes 40 seconds", "9 min 40 sec", NBSP.
    // =========================================================

    function parseTimerText(raw) {
        if (!raw) return null;

        const text = String(raw).replace(/\u00A0/g, ' ').trim();
        if (!text) return null;

        // HH:MM:SS или MM:SS
        let m = text.match(/(\d+)\s*:\s*(\d{1,2})\s*:\s*(\d{1,2})/);
        if (m) {
            return parseInt(m[1], 10) * 3600 +
                   parseInt(m[2], 10) * 60 +
                   parseInt(m[3], 10);
        }

        m = text.match(/(\d+)\s*:\s*(\d{1,2})/);
        if (m) {
            return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        }

        // минуты + секунды словами/сокращениями
        let total = 0;
        let found = false;

        let mm = text.match(/(\d+)\s*(?:m|min|minute|minutes)(?!\w)/i);
        if (mm) { total += parseInt(mm[1], 10) * 60; found = true; }

        let ss = text.match(/(\d+)\s*(?:s|sec|second|seconds)(?!\w)/i);
        if (ss) { total += parseInt(ss[1], 10); found = true; }

        return found ? total : null;
    }


    // =========================================================
    // #minute + #second
    // =========================================================

    function getMinuteSecond() {
        const minuteEl = document.querySelector('#minute');
        const secondEl = document.querySelector('#second');

        if (!minuteEl || !secondEl) return null;

        const minutes = parseInt(minuteEl.textContent.replace(/\u00A0/g, ' ').trim(), 10);
        const seconds = parseInt(secondEl.textContent.replace(/\u00A0/g, ' ').trim(), 10);

        if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

        const total = minutes * 60 + seconds;
        if (total <= 0) return null;

        return {
            minutes,
            seconds,
            total,
            text: `${minutes}:${String(seconds).padStart(2, '0')}`
        };
    }


    // =========================================================
    // #minute + #second + STOPWATCH
    // =========================================================

    function checkMinuteSecondTimer() {
        const timer = getMinuteSecond();
        if (!timer) return false;

        const minuteEl = document.querySelector('#minute');
        if (!minuteEl) return false;

        let container = minuteEl.parentElement;

        for (let i = 0; i < 8 && container; i++) {
            const text = container.textContent || '';
            const html = container.innerHTML || '';

            if (/wait\s+for\s+claim/i.test(text)) return `Wait For Claim: ${timer.text}`;
            if (/time\s+left/i.test(text))       return `Time Left: ${timer.text}`;
            if (/stopwatch/i.test(html) ||
                /fa-stopwatch/i.test(html) ||
                /bxs-stopwatch/i.test(html)) {
                return `Stopwatch timer: ${timer.text}`;
            }

            container = container.parentElement;
        }

        return false;
    }


    // =========================================================
    // COOLDOWN + #timer
    // =========================================================

    function checkCooldownTimer() {
        const timerElement = document.querySelector('#timer');
        if (!timerElement) return false;

        const text = timerElement.textContent.replace(/\u00A0/g, ' ').trim();
        const totalSeconds = parseTimerText(text);

        if (!totalSeconds || totalSeconds <= 0) return false;

        const article = timerElement.closest('article');
        if (article) {
            const articleText = article.textContent;
            if (/cooldown/i.test(articleText) ||
                /time\s+until\s+your\s+next/i.test(articleText)) {
                return `Cooldown: ${text}`;
            }
        }

        return false;
    }


    // =========================================================
    // #cooldown-value
    // =========================================================

    function checkCooldownValueTimer() {
        const element = document.querySelector('#cooldown-value');
        if (!element) return false;

        const text = element.textContent.replace(/\u00A0/g, ' ').trim();
        const total = parseTimerText(text);

        if (!total || total <= 0) return false;
        return `Cooldown #cooldown-value: ${text}`;
    }


    // =========================================================
    // #timerDigits
    // =========================================================

    function checkTimerDigits() {
        const element = document.querySelector('#timerDigits');
        if (!element) return false;

        const text = element.textContent.replace(/\u00A0/g, ' ').trim();
        const total = parseTimerText(text);

        if (!total || total <= 0) return false;
        return `timerDigits: ${text}`;
    }


    // =========================================================
    // #clock
    // =========================================================

    function checkClock() {
        const element = document.querySelector('#clock');
        if (!element) return false;

        const text = element.textContent.replace(/\u00A0/g, ' ').trim();
        const total = parseTimerText(text);

        if (!total || total <= 0) return false;
        return `clock: ${text}`;
    }


    // =========================================================
    // UNTIL CLAIM
    // =========================================================

    function checkUntilClaim() {
        const candidates = document.querySelectorAll(
            'small, span, p, div, b, strong, em, h1,h2,h3,h4,h5,h6, label'
        );

        for (const el of candidates) {
            const t = (el.textContent || '').replace(/\u00A0/g, ' ').trim();
            if (t.length > 40) continue;
            if (!/^until\s+claim$/i.test(t)) continue;

            const parent = el.parentElement;
            if (!parent) continue;

            const timerEl = parent.querySelector('h1,h2,h3,h4,h5,h6,b,strong,span,div');
            if (!timerEl) continue;

            const text = (timerEl.textContent || '').replace(/\u00A0/g, ' ').trim();
            const total = parseTimerText(text);

            if (total && total > 0) return `Until claim: ${text}`;
        }

        return false;
    }


    // =========================================================
    // ПАРСИНГ СУММЫ
    // =========================================================

    function parseAmount(text) {
        if (!text) return null;

        const clean = String(text).replace(/\u00A0/g, ' ').trim();
        const match = clean.match(/([0-9][0-9.,]*)\s*([A-Za-z]{2,10})?/);
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
            amount,
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

            const label = labelEl.textContent.replace(/\u00A0/g, ' ').trim();

            if (labelRegex.test(label)) {
                return {
                    label,
                    value: valueEl.textContent.replace(/\u00A0/g, ' ').trim(),
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

        let balanceInfo = getPebbleValueByLabel(/available\s+to\s+pay\s+out/i);

        if (!balanceInfo) {
            const balanceEl = document.querySelector('#faucet-balance');
            if (balanceEl) {
                balanceInfo = {
                    label: 'Available to pay out',
                    value: balanceEl.textContent.replace(/\u00A0/g, ' ').trim(),
                    element: balanceEl
                };
            }
        }

        const claimInfo = getPebbleValueByLabel(/every\s+claim\s+pays/i);

        if (!balanceInfo || !claimInfo) return false;

        const balance = parseAmount(balanceInfo.value);
        const claim   = parseAmount(claimInfo.value);

        if (!balance || !claim) return false;

        if (balance.currency && claim.currency && balance.currency !== claim.currency) {
            console.log('[Auto-Switcher] Currency mismatch:', balance.currency, claim.currency);
            return false;
        }

        if (claim.amount > balance.amount) {
            const reason = `claim ${claim.text} > balance ${balance.text}`;
            console.log('[Auto-Switcher] BALANCE CHECK:', reason);
            switchSite(reason);
            return true;
        }

        return false;
    }


    // =========================================================
    // УНИВЕРСАЛЬНАЯ ПРОВЕРКА #countdown
    // Все элементы: #countdown, .countdown, [role="timer"], [data-next]
    // Все форматы: HH:MM:SS, MM:SS, "9m 40s"
    // Fallback: #claim-status.is-wait, disabled claim + data-interval
    // =========================================================

    function checkCountdownElement() {
        if (switched || fastSwitchStarted) return false;

        // 1) Ищем все возможные счётчики
        const nodes = document.querySelectorAll(
            '#countdown, .countdown, [role="timer"], [data-next]'
        );

        for (const element of nodes) {

            let remaining = null;
            let source    = '';

            // data-next
            const dataNext = element.getAttribute('data-next') || '';
            if (dataNext) {
                const target = new Date(dataNext).getTime();
                if (!Number.isNaN(target)) {
                    const diff = Math.floor((target - Date.now()) / 1000);
                    if (diff > 0) {
                        remaining = diff;
                        source = `data-next=${dataNext}`;
                    }
                }
            }

            // fallback — текст
            if (remaining === null) {
                const rawText = element.textContent || '';
                const parsed  = parseTimerText(rawText);
                if (parsed && parsed > 0) {
                    remaining = parsed;
                    source = `text="${rawText.replace(/\u00A0/g, ' ').trim()}"`;
                }
            }

            if (remaining === null) continue;

            console.log(
                '[Auto-Switcher] countdown:',
                source,
                '| remaining:', remaining
            );

            startFastTimer(`countdown active (${remaining}s) [${source}]`);
            return true;
        }

        // 2) Fallback: статус "Cooling down"
        const statusEl = document.querySelector(
            '#claim-status, .carn-status, [class*="status"][class*="wait"]'
        );
        if (statusEl) {
            const t = statusEl.textContent.replace(/\u00A0/g, ' ').trim();
            if (/cool(ing)?\s*down/i.test(t)) {
                console.log('[Auto-Switcher] claim-status:', t);
                startFastTimer(`claim-status: ${t}`);
                return true;
            }
        }

        // 3) Fallback: disabled claim + data-interval
        const form = document.querySelector(
            'form[data-interval], form#claim-form, form.carn-claim-form'
        );
        if (form) {
            const btn = form.querySelector('button[type="submit"], .carn-btn-primary');
            if (btn && btn.disabled) {
                const interval = parseInt(form.getAttribute('data-interval') || '0', 10);
                if (interval > 0) {
                    console.log('[Auto-Switcher] disabled claim, data-interval=', interval);
                    startFastTimer(`disabled claim (data-interval=${interval})`);
                    return true;
                }
            }
        }

        return false;
    }


    // =========================================================
    // ОБЩАЯ ПРОВЕРКА ВСЕХ ТАЙМЕРОВ
    // =========================================================

    function checkForActiveTimer() {
        if (switched) return;

        // ↓↓↓ Сначала #countdown — самый частый случай ↓↓↓
        if (checkCountdownElement()) return;

        if (switched || fastSwitchStarted) return;

        // Баланс < клейма → сразу дальше
        if (checkBalanceVsClaim()) return;

        if (fastSwitchStarted) return;

        let detected;

        // 1. #cooldown-value
        detected = checkCooldownValueTimer();
        if (detected) { startFastTimer(detected); return; }

        // 2. #timer (cooldown)
        detected = checkCooldownTimer();
        if (detected) { startFastTimer(detected); return; }

        // 3. #minute + #second
        detected = checkMinuteSecondTimer();
        if (detected) { startFastTimer(detected); return; }

        // 4. #timerDigits
        detected = checkTimerDigits();
        if (detected) { startFastTimer(detected); return; }

        // 5. #clock
        detected = checkClock();
        if (detected) { startFastTimer(detected); return; }

        // 6. Until claim
        detected = checkUntilClaim();
        if (detected) { startFastTimer(detected); return; }
    }


    // =========================================================
    // MUTATION OBSERVER (общий)
    // =========================================================

    const observer = new MutationObserver(() => {
        if (switched) return;
        checkForActiveTimer();
    });


    // Наблюдение за документом + вложенными iframe
    function observeDocument(doc) {
        if (!doc || doc.__faucetObserved) return;
        doc.__faucetObserved = true;

        try {
            observer.observe(doc, {
                childList: true,
                subtree: true,
                characterData: true
            });
        } catch (e) {}

        try {
            doc.querySelectorAll('iframe').forEach(f => {
                try {
                    if (f.contentDocument) observeDocument(f.contentDocument);
                } catch (e) {}
                f.addEventListener('load', () => {
                    try { observeDocument(f.contentDocument); } catch (e) {}
                });
            });
        } catch (e) {}
    }

    function scanAllDocs() {
        observeDocument(document);
        try {
            document.querySelectorAll('iframe').forEach(f => {
                try {
                    if (f.contentDocument) observeDocument(f.contentDocument);
                } catch (e) {}
            });
        } catch (e) {}
    }

    // Hook attachShadow — наблюдаем и за Shadow DOM
    (function hookShadow() {
        const orig = Element.prototype.attachShadow;
        if (!orig || orig.__hooked) return;

        const patched = function (init) {
            const sr = orig.call(this, init);
            try {
                observer.observe(sr, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            } catch (e) {}
            return sr;
        };
        patched.__hooked = true;
        Element.prototype.attachShadow = patched;
    })();


    // =========================================================
    // ПЕРВИЧНЫЙ ЗАПУСК
    // =========================================================

    scanAllDocs();
    checkForActiveTimer();

    if (!fastSwitchStarted && !switched) {
        startNormalTimer();
    }


    // =========================================================
    // РЕЗЕРВНЫЕ ИНТЕРВАЛЫ
    // =========================================================

    // Полный пересмотр таймеров каждые 500 мс
    const backupChecker = setInterval(() => {
        if (switched) {
            clearInterval(backupChecker);
            return;
        }
        checkForActiveTimer();
    }, 500);

    // Отдельная быстрая проверка #countdown — на случай,
    // если данные обновляются без мутаций DOM
    const countdownChecker = setInterval(() => {
        if (switched) {
            clearInterval(countdownChecker);
            return;
        }
        checkCountdownElement();
    }, 500);

    // Периодический переобход iframe (могут появляться новые)
    setInterval(scanAllDocs, 2000);


    // =========================================================
    // ПОВТОРНЫЕ ПРОВЕРКИ НА СОБЫТИЯ
    // =========================================================

    function recheckAll() {
        try { scanAllDocs(); }            catch (e) {}
        try { checkForActiveTimer(); }    catch (e) {}
        try { checkCountdownElement(); }  catch (e) {}
    }

    window.addEventListener('load', recheckAll);
    window.addEventListener('pageshow', recheckAll);
    window.addEventListener('focus', recheckAll);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') recheckAll();
    });

})();
