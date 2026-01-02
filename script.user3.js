// ==UserScript==
// @name         Faucet Auto Switcher (25s click visible + 35s next)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Через 25 сек нажимает только видимые кнопки Claim или X2 rewards, через 35 сек переходит на следующий сайт
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const sites = [
        //{ host: "tronpick.io",     url: "https://tronpick.io/?ref=fciferglas" },
        { host: "freebch.in",      url: "https://freebch.in?ref=LDOFtc6e9t" },
        { host: "freetoncoin.in",  url: "https://freetoncoin.in?ref=FpM0dhWedm" },
        { host: "freebnb.in",      url: "https://freebnb.in?ref=LNiF2XkcEh" },
        { host: "freetrump.in",    url: "https://freetrump.in?ref=8TAiduDwVZ" },
        { host: "usdpick.io",      url: "https://usdpick.io?ref=Zke-pNqHCX" },
        { host: "freeshib.in",     url: "https://freeshib.in?ref=kSICNRj1dt" },
        { host: "freesui.in",      url: "https://freesui.in?ref=3L0hAGf6Ds" },
        { host: "freearb.in",      url: "https://freearb.in?ref=RcNvjM16bY" },
        { host: "freetron.in",     url: "https://freetron.in?ref=sxzlwFniQI" },
        { host: "freexrp.in",     url: "https://freexrp.in?ref=Hi0GL7pmLX" },
         { host: "claimcoin.in",     url: "https://claimcoin.in/faucet" }
        { host: "about:blank",    url: "about:blank" }
    ];

    const hostname = location.hostname.replace(/^www\./, '');
    const currentIndex = sites.findIndex(s => s.host === hostname);
    if (currentIndex === -1) return;

    // Проверка видимости
    function isVisible(el) {
        if (!el) return false;
        if (el.offsetParent === null) return false;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        const cs = window.getComputedStyle(el);
        return !(cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0);
    }

    // Клик по всем видимым нужным кнопкам
    function clickClaimButtons() {
        const buttons = [];

        // Кнопки Claim
        document.querySelectorAll('button.inline-flex').forEach(btn => {
            if (btn.textContent.trim().toLowerCase() === "claim" && isVisible(btn)) {
                buttons.push(btn);
            }
        });

        // Кнопка Claim с id
        const btnClaim = document.getElementById('process_claim_hourly_faucet');
        if (btnClaim && btnClaim.textContent.trim().toLowerCase() === "claim" && isVisible(btnClaim)) {
            buttons.push(btnClaim);
        }

        // Кнопка X2 rewards
        const btnX2 = document.querySelector('#process_claim_hourly_faucet.process_btn');
        if (btnX2 && btnX2.textContent.toLowerCase().includes("x2 rewards") && isVisible(btnX2)) {
            buttons.push(btnX2);
        }

        // Кликаем
        buttons.forEach(btn => {
            btn.click();
            console.log("Скрипт: нажата кнопка ->", btn.textContent.trim());
        });
    }

    // Через 25 секунд — клик по видимым кнопкам
    setTimeout(clickClaimButtons, 24000);

    // Через 35 секунд — переход на следующий сайт
    setTimeout(() => {
        if (currentIndex + 1 < sites.length) {
            location.href = sites[currentIndex + 1].url;
        } else {
            console.log("Скрипт: последний сайт — останавливаюсь.");
        }
    }, 27000);

})();













