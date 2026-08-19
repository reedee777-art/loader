// ==UserScript==
// @name         ClaimCrypto Auto Navigate
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автопереход в зависимости от состояния авторизации на claimcrypto.in
// @match        https://claimcrypto.in/*
// @match        https://claimcrypto.in
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Небольшая задержка, чтобы элементы точно успели отрисоваться
    window.addEventListener('load', function () {
        setTimeout(main, 500);
    });

    function main() {
        // Проверяем, есть ли кнопка "Logout" — значит уже залогинены
        const logoutBtn = document.querySelector('a[href="https://claimcrypto.in/auth/logout"]');
        if (logoutBtn) {
            // Если мы уже не на нужной странице — переходим
            if (location.href !== 'https://claimcrypto.in/faucet/currency/ltc') {
                window.location.href = 'https://claimcrypto.in/faucet/currency/ltc';
            }
            return;
        }

        // Проверяем, есть ли кнопка "Start Earning Now" — значит нужно логиниться
        const startBtn = document.querySelector('a[data-toggle="modal"][data-target="#login"].btn.btn-primary.btn-lg.mb-2');
        if (startBtn) {
            // Открываем модалку логина
            startBtn.click();

            // Ждём, пока модалка отрисуется, потом жмём Login
            waitForElement('button[type="submit"].btn.btn-outline.border.text-secondary', function (loginBtn) {
                loginBtn.click();
            });
        }
    }

    // Утилита ожидания появления элемента в DOM
    function waitForElement(selector, callback, timeout = 5000) {
        const interval = 100;
        let elapsed = 0;

        const timer = setInterval(function () {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                callback(el);
            } else {
                elapsed += interval;
                if (elapsed >= timeout) {
                    clearInterval(timer);
                    console.warn('Элемент не найден за отведённое время:', selector);
                }
            }
        }, interval);
    }
})();
