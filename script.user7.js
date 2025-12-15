// ==UserScript==
// @name         Auto Claim Cryptoearns
// @namespace    http://tampermonkey.net/
// @description  Auto claim
// @author       nubiebot
// @version      1.1
// @match        https://*/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    let solvedDetected = false;
    let claimClicked = false;
    let retryCount = 0;
    const maxRetry = 5; // увеличил на всякий случай

    const tryClaim = () => {
        if (claimClicked) return;

        // Ищем кнопку по новому id="subbutt"
        let btn = document.querySelector('button#subbutt');

        // На всякий случай оставляем старый селектор
        if (!btn) {
            btn = document.querySelector('button.claim-button.btn.btn_primary');
        }

        if (btn && !btn.disabled && btn.offsetParent !== null) { // проверка, что кнопка видима и активна
            claimClicked = true;
            btn.click();
            console.log('Claim button clicked!');
        }
    };

    const delayedTry = () => {
        if (claimClicked) return;

        const interval = setInterval(() => {
            retryCount++;
            tryClaim();

            if (claimClicked || retryCount >= maxRetry) {
                clearInterval(interval);
            }
        }, 1000);
    };

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (!node) continue;

                // Обнаружение success.png от расширения капчи
                if (
                    node.tagName === "IMG" &&
                    node.src &&
                    node.src.startsWith("chrome-extension://") &&
                    node.src.includes("success.png")
                ) {
                    solvedDetected = true;
                    delayedTry();
                }

                // Обнаружение текста "solved" или похожего
                if (
                    node.textContent &&
                    node.textContent.toLowerCase().includes("solved")
                ) {
                    solvedDetected = true;
                    delayedTry();
                }

                // Дополнительно: если появилась сама кнопка с id="subbutt"
                if (node.tagName === "BUTTON" && node.id === "subbutt") {
                    delayedTry();
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Пытаемся сразу на случай, если кнопка уже есть
    tryClaim();

})();