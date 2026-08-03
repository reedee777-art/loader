// ==UserScript==
// @name         LinksFly LTC Auto Claim
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматический клик по кнопке Claim каждые 28 секунд
// @author       YourName
// @match        https://linksfly.link/links/currency/*
// @match        https://gamerlee.com/links/currency/*
// @match        https://mrappswala.com/links/currency/*
// @match        https://vipcoinfaucet.com/links/currency/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickClaimButton() {
        // Ищем кнопку с классом claim-link-btn
        const claimButton = document.querySelector('button.claim-link-btn');

        // Проверяем, существует ли кнопка и активна ли она
        if (claimButton && !claimButton.disabled) {
            // Проверяем, что кнопка видима и не содержит атрибут disabled
            const isDisabled = claimButton.hasAttribute('disabled') ||
                              claimButton.getAttribute('aria-disabled') === 'true';

            if (!isDisabled) {
                console.log('Кнопка активна - выполняю клик');
                claimButton.click();
            } else {
                console.log('Кнопка неактивна (disabled)');
            }
        } else {
            console.log('Кнопка не найдена или недоступна');
        }
    }

    // Первый клик через 1 секунду после загрузки страницы
    setTimeout(clickClaimButton, 6000);

    // Устанавливаем интервал в 28 секунд (28000 мс)
    setInterval(clickClaimButton, 28000);

    console.log('Скрипт автоматического сбора LTC запущен. Интервал: 28 секунд');
})();