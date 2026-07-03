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
        'faucetpayz.com',
       // 'earnbitmoon.club',
            // 'freebits.xyz',
        'cryptoukr.in.ua'
    ];

    // Проверка текущего сайта
    if (!allowedHosts.some(host => window.location.hostname.includes(host))) {
        return;
    }

    // Список сайтов (ТОЛЬКО ДОМЕНЫ)
    const faucetSites = [
        //'earnbitmoon.club',
            // 'freebits.xyz',
        'faucetpayz.com',
        'cryptoukr.in.ua'
    ];

    // Получаем следующий сайт
    function getNextUrl() {
        const currentHost = window.location.hostname;

        const currentIndex = faucetSites.findIndex(h =>
            currentHost.includes(h)
        );

        const nextIndex = (currentIndex + 1) % faucetSites.length;
        const nextHost = faucetSites[nextIndex];

        if (nextHost === 'cryptoukr.in.ua') return 'https://cryptoukr.in.ua/faucet';
        //if (nextHost === 'earnbitmoon.club') return 'https://earnbitmoon.club';
            // if (nextHost === 'freebits.xyz') return 'https://freebits.xyz';
        if (nextHost === 'faucetpayz.com') return 'https://faucetpayz.com/faucet';
    }

    // Переключение через 55 секунд
    setTimeout(() => {
        const nextUrl = getNextUrl();
        window.location.href = nextUrl;
    }, 65000);

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
