// ==UserScript==
// @name         ClaimX Click After Captcha
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Ждёт 25 сек + капчу, затем нажимает Enter Faucet Portal
// @match        https://claimx.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=claimx.online
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let clicked = false;
    let checkInterval = null;

    // Функция для поиска кнопки
    function findButton() {
        const buttons = document.querySelectorAll('button');
        for (let btn of buttons) {
            const text = btn.textContent.trim();
            if (text.includes('Enter Faucet Portal')) {
                return btn;
            }
        }
        return null;
    }

    // Функция для получения токена капчи
    function getCaptchaToken() {
        const input = document.querySelector('input[name="cf-turnstile-response"]');
        if (input && input.value && input.value.length > 10) {
            return input.value;
        }
        return null;
    }

    // Функция для проверки, решена ли капча
    function isCaptchaSolved() {
        const token = getCaptchaToken();
        if (token) {
            console.log('[TM] ✅ Токен капчи получен!', token.substring(0, 20) + '...');
            return true;
        }
        return false;
    }

    // Функция для нажатия кнопки
    function clickButton(button) {
        if (clicked) return;
        if (!button) return;

        console.log('[TM] 🎯 Кнопка активна! Нажимаем...');
        
        // Проверяем, что кнопка не disabled
        if (button.disabled) {
            console.log('[TM] ⚠️ Кнопка всё ещё disabled, но капча решена. Ждём активации...');
            // Проверяем через 500 мс
            setTimeout(() => {
                const btn = findButton();
                if (btn && !btn.disabled) {
                    btn.click();
                    clicked = true;
                    console.log('[TM] ✅ Кнопка нажата!');
                }
            }, 500);
            return;
        }

        // Нажимаем кнопку
        button.click();
        clicked = true;
        console.log('[TM] ✅ Кнопка нажата!');
        
        // Останавливаем проверку
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    }

    // Основная функция проверки
    function checkAndClick() {
        if (clicked) return;

        const button = findButton();
        
        if (!button) {
            console.log('[TM] ⏳ Кнопка не найдена...');
            return;
        }

        // Проверяем, решена ли капча
        if (isCaptchaSolved()) {
            console.log('[TM] ✅ Капча решена!');
            
            // Проверяем, активна ли кнопка
            if (!button.disabled) {
                clickButton(button);
            } else {
                console.log('[TM] ⏳ Кнопка пока disabled, ждём активации...');
                // Ждём активации кнопки (обычно она становится активной сразу после капчи)
                setTimeout(() => {
                    const btn = findButton();
                    if (btn && !btn.disabled && !clicked) {
                        clickButton(btn);
                    }
                }, 1000);
            }
        } else {
            console.log('[TM] ⏳ Ожидаем решения капчи (Turnstile)...');
        }
    }

    // Запускаем скрипт через 25 секунд
    console.log('[TM] ⏳ Ожидание 25 секунд перед началом проверки...');
    
    let seconds = 25;
    const countdown = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            console.log(`[TM] Осталось ${seconds} сек`);
        } else {
            clearInterval(countdown);
            console.log('[TM] ✅ 25 секунд прошло! Начинаем проверку капчи...');
            
            // Первая проверка
            checkAndClick();
            
            // Проверяем каждые 500 мс
            checkInterval = setInterval(checkAndClick, 500);
            
            // Останавливаем проверку через 3 минуты (максимум)
            setTimeout(() => {
                if (checkInterval) {
                    clearInterval(checkInterval);
                    checkInterval = null;
                    console.log('[TM] ⏱️ Проверка остановлена (таймаут 3 минуты)');
                }
            }, 180000);
        }
    }, 1000);

})();
