// ==UserScript==
// @name         HotFaucet - Login + Auto Switch Coin
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автонажатие Login и переключение монет при отсутствии средств
// @match        https://hotfaucet.in/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ---------- 1. Нажать Login через 20 секунд ----------
    const loginBtn = document.querySelector('a.btn-login[href="https://hotfaucet.in/login"]');

    if (loginBtn) {
        console.log("Login button found. Clicking in 20 seconds...");
        setTimeout(() => {
            loginBtn.click();
        }, 20000);
    }

    // ---------- 2. Если нет средств - переключать монеты ----------
    const coins = [
        "SOL",
        "LTC",
        "TRX",
        "DOGE",
        "PEPE"
    ];

    const storageKey = "hotfaucet_coin_index";

    function nextCoin() {
        let index = parseInt(localStorage.getItem(storageKey) || "0", 10);

        if (index < coins.length) {
            const coin = coins[index];
            localStorage.setItem(storageKey, index + 1);

            console.log("Switching to:", coin);
            window.location.href = `https://hotfaucet.in/madfaucet/set_coin/${coin}`;
        } else {
            localStorage.removeItem(storageKey);
            console.log("All coins checked. Opening about:blank");
            window.location.href = "about:blank";
        }
    }

    function checkNoFunds() {
        const alerts = document.querySelectorAll(".alert.alert-danger");

        for (const alert of alerts) {
            if (alert.textContent.includes("The faucet does not have sufficient funds for this transaction.")) {
                console.log("No funds detected.");
                nextCoin();
                return;
            }
        }
    }

    // Проверка сразу после загрузки
    checkNoFunds();

    // И ещё несколько секунд, если сообщение появится позже
    const observer = new MutationObserver(checkNoFunds);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
