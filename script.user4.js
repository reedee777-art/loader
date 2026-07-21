// ==UserScript==
// @name         ClaimX Auto Click (25 sec delay)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ждёт 25 секунд и нажимает кнопку Enter Faucet Portal на claimx.online
// @author       You
// @match        https://claimx.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=claimx.online
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Tampermonkey] ClaimX — ожидание 25 секунд перед кликом...');

    setTimeout(function() {
        // Ищем кнопку по тексту или по атрибутам
        const button = document.querySelector('button.btn.btn-primary.w-100.py-2.5.fw-bold.mb-3');
        
        // Альтернативный поиск по тексту, если селектор не сработал
        const fallbackButton = Array.from(document.querySelectorAll('button')).find(
            btn => btn.textContent.trim().includes('Enter Faucet Portal')
        );

        const targetButton = button || fallbackButton;

        if (targetButton) {
            targetButton.click();
            console.log('[Tampermonkey] Кнопка "Enter Faucet Portal" нажата!');
        } else {
            console.warn('[Tampermonkey] Кнопка не найдена. Возможно, страница ещё не загружена или изменился DOM.');
        }
    }, 25000); // 25 000 мс = 25 секунд
})();
