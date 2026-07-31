// ==UserScript==
// @name         Faucet Auto Redirect222
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Redirect from verify pages to faucet pages after 5 seconds
// @author       YourName
// @match        https://linksfly.link/faucet/currency/*/validate/4
// @match        https://vipcoinfaucet.com/faucet/currency/*/validate/4
// @match        https://mrappswala.com/faucet/currency/*/validate/4
// @match        *://*/*/*/currency/*/validate/4
// @match        *://*/*/*/*/validate/4
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get current URL
    const currentUrl = window.location.href;

    // Extract the base URL and currency from the current path
    // Pattern: https://domain.com/faucet/currency/XXXX/validate/4
    const urlParts = currentUrl.split('/');
    const verifyIndex = urlParts.indexOf('verify');

    if (verifyIndex !== -1) {
        // Remove 'verify' from the path to get the target URL
        const targetParts = urlParts.slice(0, verifyIndex);
        const targetUrl = targetParts.join('/');

        // Also handle case where there might be trailing slashes
        const cleanTargetUrl = targetUrl.replace(/\/+$/, '');

        console.log(`Will redirect to: ${cleanTargetUrl} in 5 seconds`);

        // Show a message to the user
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: #fff;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 9999;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
        message.innerHTML = `Redirecting to faucet page in <span id="countdown">5</span> seconds...`;
        document.body.appendChild(message);

        // Countdown timer
        let seconds = 5;
        const countdownElement = document.getElementById('countdown');

        const countdownInterval = setInterval(() => {
            seconds--;
            if (countdownElement) {
                countdownElement.textContent = seconds;
            }
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                window.location.href = cleanTargetUrl;
            }
        }, 1000);

        // Also trigger redirect after 5 seconds as backup
        setTimeout(() => {
            window.location.href = cleanTargetUrl;
        }, 5000);
    } else {
        console.log('Current page is not a verify page, no redirect needed.');
    }
})();
