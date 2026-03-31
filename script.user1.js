// ==UserScript==
// @name         Auto Click Continue (25s)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Click "Continue" button after 25 seconds
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        const buttons = document.querySelectorAll('button.btn.btn-primary.bs-mixin-exp');

        for (let btn of buttons) {
            if (btn.innerText.toLowerCase().includes('continue')) {
                console.log('Нажимаю кнопку Continue');
                btn.click();
                break;
            }
        }
    }, 25000); // 25 секунд
})();
