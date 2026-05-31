 // ==UserScript==
// @name         Faucet Auto-Switcher323
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automatically switches between faucet sites every 2 minutes (site-filtered)
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Разрешённые сайты
    const allowedHosts = [
        //'feyorra.top',
        'viefaucet.com',
        'claimtrx.com'
    ];

    // Проверка текущего сайта
    if (!allowedHosts.some(host => window.location.hostname.includes(host))) {
        return;
    }

    // Список сайтов (ТОЛЬКО ДОМЕНЫ)
    const faucetSites = [
        'claimtrx.com',
        'viefaucet.com',
        'feyorra.top'
    ];

    // Получаем следующий сайт
    function getNextUrl() {
        const currentHost = window.location.hostname;

        const currentIndex = faucetSites.findIndex(h =>
            currentHost.includes(h)
        );

        const nextIndex = (currentIndex + 1) % faucetSites.length;
        const nextHost = faucetSites[nextIndex];

        if (nextHost === 'claimtrx.com') return 'https://claimtrx.com/faucet';
        if (nextHost === 'viefaucet.com') return 'https://viefaucet.com/app/faucet';
       // if (nextHost === 'feyorra.top') return 'https://feyorra.top/faucet';
    }

    // Переключение через 55 секунд
    setTimeout(() => {
        const nextUrl = getNextUrl();
        window.location.href = nextUrl;
    }, 50000);

    // Таймер
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
