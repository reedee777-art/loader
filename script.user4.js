// ==UserScript==
// @name         ClaimTRX Auto Click Monlix PTC
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматически кликает на кнопку "Go to Monlix PTC" один раз и на кнопки "Watch ad" по одной с паузой 1 секунда
// @author       Grok
// @match        https://claimtrx.com/*
// @match        https://offers.monlix.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = window.location.href;

    // На странице offerwall/monlix или главной
    if (currentUrl.includes('claimtrx.com')) {
        const goButton = document.querySelector('a.btn.btn-primary.btn-lg.mt-2.mb-2[style*="width: 100%;"]');
        if (goButton && goButton.textContent.trim().includes('Go to Monlix PTC')) {
            console.log('Нажатие на "Go to Monlix PTC"');
            goButton.click();
        }
    }

    // На странице Monlix PTC (offers.monlix.com)
    if (currentUrl.includes('offers.monlix.com')) {
        const watchButtons = Array.from(document.querySelectorAll('button'))
            .filter(btn => btn.textContent.trim() === 'Watch ad');

        if (watchButtons.length > 0) {
            console.log(`Найдено ${watchButtons.length} кнопок "Watch ad". Начинаем последовательные клики...`);

            watchButtons.reduce((promise, button, index) => {
                return promise.then(() => {
                    console.log(`Клик по кнопке Watch ad #${index + 1}`);
                    button.click();
                    return new Promise(resolve => setTimeout(resolve, 1000)); // пауза 1 секунда
                });
            }, Promise.resolve());
        }
    }

    // Дополнительно: наблюдатель за изменениями DOM (на случай динамической загрузки)
    const observer = new MutationObserver(() => {
        if (currentUrl.includes('claimtrx.com')) {
            const goButton = document.querySelector('a.btn.btn-primary.btn-lg.mt-2.mb-2[style*="width: 100%;"]');
            if (goButton && goButton.textContent.trim().includes('Go to Monlix PTC')) {
                console.log('Кнопка "Go to Monlix PTC" появилась динамически');
                goButton.click();
                // observer.disconnect(); // если нужно кликнуть только один раз
            }
        }

        if (currentUrl.includes('offers.monlix.com')) {
            const watchButtons = Array.from(document.querySelectorAll('button'))
                .filter(btn => btn.textContent.trim() === 'Watch ad');

            if (watchButtons.length > 0) {
                // Можно добавить логику кликов здесь, если нужно повторно
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
