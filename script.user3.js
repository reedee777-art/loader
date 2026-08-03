// ==UserScript==
// @name         Universal Claim Button
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Clicks claim buttons when hCaptcha or reCAPTCHA is solved
// @author       Your Name
// @match        https://excoinbit.online/*
// @match        https://mixtoshi.com/*
// @match        https://coinvaganza.xyz/*
// @match        https://mix-crypto.com/*
// @match        https://mix-zero.xyz/*
// @match        https://*/firewall
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Список ключевых слов для поиска кнопки
    const buttonKeywords = [
        'claim', 'collect', 'submit', 'create an account',
        'reward', 'log in', 'verify captcha', 'start earning',
        'verify', 'captcha', 'get reward!', 'unlock',
        'continue', 'login', 'sign in', 'collect reward',
        'verify captcha', 'claim now!'
    ];

    function clickTargetButton() {
        const buttons = document.querySelectorAll(
            'button, input[type="submit"], a.btn'
        );

        const targetButtons = Array.from(buttons).filter(button => {
            const buttonText = (
                button.textContent ||
                button.innerText ||
                button.value ||
                ''
            ).trim().toLowerCase();

            return buttonKeywords.some(keyword =>
                buttonText.includes(keyword)
            );
        });

        if (targetButtons.length > 0) {
            console.log('Found claim button:', targetButtons[0]);
            targetButtons[0].click();
        } else {
            console.log('No claim buttons found.');
        }
    }

    // Проверяем заполнение hCaptcha или reCAPTCHA
    const interval = setInterval(() => {
        const hcaptchaResponse = document.querySelector("[name='h-captcha-response']")?.value;
        const captchaResponse = document.querySelector('#g-recaptcha-response')?.value;

        if (
            (hcaptchaResponse && hcaptchaResponse.trim() !== '') ||
            (captchaResponse && captchaResponse.trim() !== '')
        ) {
            console.log('Captcha solved!');
            clearInterval(interval);

            setTimeout(() => {
                clickTargetButton();
            }, 1000);
        }
    }, 1000);

})();
