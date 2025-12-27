// ==UserScript==
// @name         Faucet Unlock Claim Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Remove ad-blocking logic from claim button
// @author       You
// @match        *://vipcoinfaucet.com/*
// @match        *://miniappfaucet.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function unlockButton() {
        const btn = document.querySelector("#claimBtn");
        if (!btn) return;

        // Снимаем все обработчики сайта
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Новый обработчик: сразу сабмит формы
        newBtn.addEventListener("click", function() {
            const form = document.querySelector("#faucetForm");
            if (form) {
                newBtn.disabled = true;
                newBtn.innerHTML = "Submitting...";
                form.submit();
            }
        });

        console.log("✅ Claim button unlocked!");
    }

    // Ждём загрузки
    window.addEventListener("load", unlockButton);
})();
