// ==UserScript==
// @name         Auto Claim 3 Buttons + Error Redirect
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Нажимает первые три активные Claim-кнопки, если ошибка — переход на claimclicks.com/ltc
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function checkError() {
        let errorDiv = document.querySelector("div.alert.alert-danger");
        if (errorDiv && errorDiv.innerText.includes("The bonus could not be sent")) {
            console.log("Ошибка бонуса! Переход на /ltc");
            window.location.href = "https://claimclicks.com/ltc";
        }
    }

    function clickButtons() {
        checkError(); // проверка перед кликами

        let buttons = Array.from(document.querySelectorAll("button.btn.btn-success"))
            .filter(btn => btn.innerText.includes("Claim") && !btn.disabled);

        buttons.slice(0, 3).forEach((btn, i) => {
            setTimeout(() => {
                checkError(); // проверка перед каждым кликом
                btn.click();
                console.log("Нажата кнопка:", btn.innerText);
            }, i * 1500);
        });
    }

    // Проверка на ошибку каждые 2 сек
    setInterval(checkError, 2000);

    // Запуск через 2 сек
    setTimeout(clickButtons, 2000);
})();
