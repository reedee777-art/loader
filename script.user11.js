// ==UserScript==
// @name         Auto Claim FaucetPay Buttons (2 buttons)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Через 25 секунд кликает на кнопки "Email Payment FaucetPay" (salvarjogo и salvarjogo1)
// @author       Grok
// @match        https://earnbnb.softpog.com.br/*
// @match        https://trontrontron.softpog.com.br/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        // Первая кнопка
        const button1 = document.querySelector('#salvarjogo');
        if (button1) {
            console.log('Кнопка #salvarjogo найдена, кликаем...');
            button1.click();
        } else {
            console.log('Кнопка #salvarjogo не найдена.');
        }

        // Вторая кнопка
        const button2 = document.querySelector('#salvarjogo1');
        if (button2) {
            console.log('Кнопка #salvarjogo1 найдена, кликаем...');
            button2.click();
        } else {
            console.log('Кнопка #salvarjogo1 не найдена.');
        }

        if (!button1 && !button2) {
            console.log('Ни одна из целевых кнопок не найдена на странице.');
        }
    }, 35000); // 25 секунд
})();