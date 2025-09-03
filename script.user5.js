// ==UserScript==
// @name         Auto Claim 3 Buttons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Нажимает первые три активные Claim-кнопки один раз
// @author       You
// @match        https://claimclicks.com/ltc/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function clickButtons() {
        // Собираем все кнопки Claim
        let buttons = Array.from(document.querySelectorAll("button.btn.btn-success"))
            .filter(btn => btn.innerText.includes("Claim") && !btn.disabled);

        // Нажимаем только первые три
        buttons.slice(0, 3).forEach((btn, i) => {
            setTimeout(() => {
                btn.click();
                console.log("Нажата кнопка:", btn.innerText);
            }, i * 1500); // маленькая задержка между кликами
        });
    }

    // Запускаем через 2 сек после загрузки страницы
    setTimeout(clickButtons, 2000);
})();

