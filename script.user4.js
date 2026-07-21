// ==UserScript==
// @name         ClaimX Auto Click (wait for button)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Ждёт появления кнопки и нажимает через 25 сек
// @match        https://claimx.online/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let clicked = false;

    function waitForButton() {
        if (clicked) return;

        const button = document.querySelector('button.btn.btn-primary.w-100.py-2.5.fw-bold.mb-3');
        if (button) {
            console.log('[Tampermonkey] Кнопка найдена, ожидание 25 секунд...');
            setTimeout(() => {
                if (!clicked) {
                    button.click();
                    clicked = true;
                    console.log('[Tampermonkey] Кнопка нажата!');
                }
            }, 25000);
        } else {
            // Проверяем каждую секунду
            setTimeout(waitForButton, 1000);
        }
    }

    waitForButton();
})();
