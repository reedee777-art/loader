// ==UserScript==
// @name         Faucet Auto-Redirect (Universal)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Проверяет кнопку Claim на LTC, если disabled и 0/любое число - редирект на BTC
// @author       You
// @match        https://*/links/currency/ltc
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Функция проверки и редиректа
    function checkAndRedirect() {
        // Ищем все кнопки с классом btn-secondary
        const buttons = document.querySelectorAll('button.btn.btn-secondary');

        for (let button of buttons) {
            // Проверяем наличие атрибута disabled
            if (button.hasAttribute('disabled')) {
                const buttonText = button.textContent.trim();

                // Ищем паттерн "0/любое число"
                const match = buttonText.match(/(\d+)\/(\d+)/);

                if (match) {
                    const current = parseInt(match[1]);
                    const total = parseInt(match[2]);

                    // Если текущее значение 0 (ноль) - выполняем редирект
                    if (current === 0) {
                        console.log(`Обнаружено 0/${total} на disabled кнопке - выполняю редирект`);

                        // Перенаправляем на BTC faucet
                        const currentUrl = window.location.href;
                        const newUrl = currentUrl.replace('/links/currency/ltc', '/faucet/currency/btc');
                        window.location.href = newUrl;
                        return; // Выходим после редиректа
                    }
                }
            }
        }
    }

    // Ждём полной загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndRedirect);
    } else {
        // Если страница уже загружена - проверяем сразу
        checkAndRedirect();
    }

    // Дополнительная проверка через MutationObserver на случай,
    // если кнопка появляется или меняется динамически
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                checkAndRedirect();
                break;
            }
        }
    });

    // Начинаем наблюдение за изменениями в документе
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled']
    });

})();
