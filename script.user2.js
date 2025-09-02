// ==UserScript==
// @name         Faucet Auto-Switcher323
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically switches between faucet sites every 2 minutes
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // List of faucet URLs to cycle through
    const faucetUrls = [
       //  'https://acryptominer.io/user/faucet',
		        'https://cryptofaucet.one/faucet',
        'https://claimclicks.com/doge/?r=cifer'
    ];

    // Function to get the next URL in the cycle
    function getNextUrl(currentUrl) {
        const currentIndex = faucetUrls.indexOf(currentUrl);
        const nextIndex = (currentIndex + 1) % faucetUrls.length;
        return faucetUrls[nextIndex];
    }

    // Switch to the next site after 2 minutes (120000 milliseconds)
    setTimeout(() => {
        const nextUrl = getNextUrl(window.location.href);
        window.location.href = nextUrl;
    }, 55000);

    // Display a countdown timer on the page
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

    let timeLeft = 60;
    const countdown = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Next site in: ${timeLeft} seconds`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
        }
    }, 1000);

})();
