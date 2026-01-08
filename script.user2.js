// ==UserScript==
// @name         Faucet Auto-Switcher323
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically switches between faucet sites every 2 minutes (site-filtered)
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Разрешённые сайты
    const allowedHosts = [
        'feyorra.top',
        'faucetpayz.com',
        'claimtrx.com'
    ];

    // Проверка текущего сайта
    if (!allowedHosts.some(host => window.location.hostname.includes(host))) {
        return; // не запускаем скрипт
    }

    // Список faucet URL для цикла
    const faucetUrls = [
         //'https://claimtrx.com/faucet',
        'https://faucetpayz.com/faucet'
          //'https://feyorra.top/faucet'
        //  'https://cryptofaucet.one/faucet'
    ];

    // Получаем следующий URL в цикле
    function getNextUrl(currentUrl) {
        const currentIndex = faucetUrls.indexOf(currentUrl);
        const nextIndex = (currentIndex + 1) % faucetUrls.length;
        return faucetUrls[nextIndex];
    }

    // Переключаемся на следующий сайт через 55 секунд
    setTimeout(() => {
        const nextUrl = getNextUrl(window.location.href);
        window.location.href = nextUrl;
    }, 65000);

    // Отображаем таймер обратного отсчёта
    const timerElement = document.createElement('div');
    timerElement.style.position = 'fixed';
    timerElement.style.bottom = '10px';
    timerElement.style.right = '10px';
    timerElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
    timerElement.style.color = 'white';
    timerElement.style.padding = '5px 10px';
    timerElement.style.borderRadius = '5px';
    timerElement.style.zIndex = '9999';
    document.body.appendChild(timerElement);

    let timeLeft = 90;
    const countdown = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Next site in: ${timeLeft} seconds`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
        }
    }, 1000);

})();
















