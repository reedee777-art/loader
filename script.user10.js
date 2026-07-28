// ==UserScript==
// @name         HotFaucet - Login + Auto Coin Switch
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Автологин и переключение монет при отсутствии средств
// @match        https://hotfaucet.in/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =====================================================
    // Кнопка Login
    // =====================================================

    const loginBtn = document.querySelector('a.btn-login[href="https://hotfaucet.in/login"]');

    if (loginBtn) {
        console.log("[HotFaucet] Login button found. Click after 20 sec.");

        setTimeout(() => {
            if (document.contains(loginBtn)) {
                loginBtn.click();
            }
        }, 20000);
    }

    // =====================================================
    // Переключение монет
    // =====================================================

    const COINS = [
        "SOL",
        "LTC",
        "TRX",
        "DOGE",
        "PEPE"
    ];

    const STORAGE_KEY = "hotfaucet_coin_index";
    let switched = false;

    function switchCoin() {

        if (switched) return;
        switched = true;

        observer.disconnect();

        let index = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);

        if (isNaN(index)) index = 0;

        if (index >= COINS.length) {
            localStorage.removeItem(STORAGE_KEY);

            console.log("[HotFaucet] All coins checked -> about:blank");

            setTimeout(() => {
                window.location.href = "about:blank";
            }, 500);

            return;
        }

        const coin = COINS[index];

        localStorage.setItem(STORAGE_KEY, String(index + 1));

        console.log("[HotFaucet] Switching to", coin);

        setTimeout(() => {
            window.location.href = "https://hotfaucet.in/madfaucet/set_coin/" + coin;
        }, 500);
    }

    function checkNoFunds() {

        const alert = document.querySelector(".alert.alert-danger");

        if (!alert) return;

        const text = alert.textContent.trim();

        if (text.includes("The faucet does not have sufficient funds for this transaction.")) {
            console.log("[HotFaucet] Faucet has no funds.");
            switchCoin();
        }
    }

    // Проверка сразу
    checkNoFunds();

    // И ещё следим за появлением сообщения
    const observer = new MutationObserver(() => {
        if (!switched) {
            checkNoFunds();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
