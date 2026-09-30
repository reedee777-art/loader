// ==UserScript==
// @name         FaucetPay — Auto Send LTC to cifer
// @namespace    https://faucetpay.io/
// @version      1.2
// @description  LTC → cifer → MAX → Send
// @match        *://faucetpay.io/*
// @match        *://*.faucetpay.io/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const RECIPIENT = 'cifer';
    const log  = (...a) => console.log('%c[FP-Auto]', 'color:#5b8def;font-weight:bold', ...a);
    const warn = (...a) => console.warn('%c[FP-Auto]', 'color:#e0a020;font-weight:bold', ...a);
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const waitFor = (fn, { timeout = 20000, interval = 200, label = '?' } = {}) =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const tick = () => {
                let res = null;
                try { res = fn(); } catch (e) {}
                if (res) { log(`✓ найдено: ${label}`); return resolve(res); }
                if (Date.now() - start > timeout) return reject(new Error(`Timeout: ${label}`));
                setTimeout(tick, interval);
            };
            tick();
        });

    function setNativeValue(el, value) {
        const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
        desc && desc.set ? desc.set.call(el, value) : (el.value = value);
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function realClick(el) {
        const o = { bubbles: true, cancelable: true, view: window, button: 0 };
        el.dispatchEvent(new PointerEvent('pointerdown', { ...o, pointerId: 1 }));
        el.dispatchEvent(new MouseEvent('mousedown', o));
        el.dispatchEvent(new PointerEvent('pointerup',   { ...o, pointerId: 1 }));
        el.dispatchEvent(new MouseEvent('mouseup',   o));
        el.dispatchEvent(new MouseEvent('click',     o));
    }

    const isVisible = (el) => {
        if (!el) return false;
        if (el.closest('[aria-hidden="true"]')) return false;
        if (el.closest('[hidden]')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    };

    // --- Шаги ---

    async function waitForForm() {
        await waitFor(
            () => document.querySelector('input[placeholder="username or email"]'),
            { label: 'поле Recipient' }
        );
    }

    // Кнопка монеты на форме = та, у которой внутри <img src="/coins/...">
    async function selectLTC() {
        const coinBtn = await waitFor(() => {
            for (const b of document.querySelectorAll('button[aria-haspopup="listbox"]')) {
                if (b.getAttribute('role') === 'menuitem') continue;    // пункт меню юзера
                if (b.querySelector('img[src^="/coins/"]')) return b;   // ← наша кнопка
            }
            return null;
        }, { label: 'кнопка выбора монеты (форма)' });

        const cur = (coinBtn.textContent || '').toLowerCase();
        if (/litecoin|(^|\s)ltc(\s|$)/.test(cur) && !cur.includes('btc')) {
            log('LTC уже выбран');
            return;
        }

        log('Открываем список монет…');
        realClick(coinBtn);

        // Ждём именно ВИДИМУЮ опцию Litecoin
        const ltcOption = await waitFor(() => {
            const scopes = document.querySelectorAll('[role="listbox"]');
            for (const lb of scopes) {
                if (lb.closest('[aria-hidden="true"]')) continue;
                for (const o of lb.querySelectorAll('[role="option"]')) {
                    if (!isVisible(o)) continue;
                    const t = (o.textContent || '').toLowerCase();
                    if (t.includes('litecoin')) return o;
                }
            }
            // фолбэк — любые видимые option на странице
            for (const o of document.querySelectorAll('[role="option"]')) {
                if (!isVisible(o)) continue;
                const t = (o.textContent || '').toLowerCase();
                if (t.includes('litecoin')) return o;
            }
            return null;
        }, { label: 'видимая опция Litecoin' });

        realClick(ltcOption);
        log('LTC выбран');
        await sleep(500);
    }

    async function fillRecipient() {
        const input = await waitFor(
            () => document.querySelector('input[placeholder="username or email"]'),
            { label: 'поле Recipient (повтор)' }
        );
        input.focus();
        setNativeValue(input, RECIPIENT);
        input.blur();
        log('Введён получатель:', RECIPIENT, '| value =', input.value);
    }

    async function clickMax() {
        const maxBtn = await waitFor(() => {
            for (const b of document.querySelectorAll('button')) {
                if (b.textContent.trim() === 'MAX' && !b.disabled && isVisible(b)) return b;
            }
            return null;
        }, { label: 'кнопка MAX' });
        realClick(maxBtn);
        log('MAX нажат');
    }

    async function clickSend() {
        const sendBtn = await waitFor(() => {
            for (const b of document.querySelectorAll('button[type="submit"]')) {
                if (/send/i.test(b.textContent) && !b.disabled) return b;
            }
            return null;
        }, { timeout: 25000, label: 'активная кнопка Send' });
        realClick(sendBtn);
        log('Send нажат ✅');
    }

    async function run() {
        // Закрыть любые открытые меню на старте
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await sleep(200);

        if (!location.pathname.startsWith('/wallet/send')) {
            log('Ждём перехода на /wallet/send…');
            await waitFor(() => location.pathname.startsWith('/wallet/send'),
                { timeout: 60000, label: 'URL /wallet/send' });
        }

        try {
            await waitForForm();
            await selectLTC();
            log('Пауза 2 сек…');
            await sleep(2000);
            await fillRecipient();
            await sleep(300);
            await clickMax();
            log('Пауза 1 сек…');
            await sleep(1000);
            await clickSend();
        } catch (e) {
            warn('Ошибка:', e.message);
        }
    }

    let lastPath = location.pathname;
    setInterval(() => {
        if (location.pathname !== lastPath) {
            lastPath = location.pathname;
            if (location.pathname.startsWith('/wallet/send')) {
                log('Переход на /wallet/send');
                run();
            }
        }
    }, 500);

    run();
})();
