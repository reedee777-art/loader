// ==UserScript==
// @name         MonsterP2E Auto Claim
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматическое нажатие кнопки Claim Now каждые 25 секунд
// @author       You
// @match        https://monsterp2e.space/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickClaimButton() {
        const claimButton = document.querySelector('input[type="submit"][name="login"][value="Claim Now"]');
        
        if (claimButton) {
            claimButton.click();
            setTimeout(checkSuccessAlert, 2000);
        }
    }

    function checkSuccessAlert() {
        const successAlert = document.querySelector('div.alert.alert-success');
        
        if (successAlert) {
            setTimeout(() => {
                location.reload();
            }, 15000);
        }
    }

    // Первое нажатие через 25 секунд
    setTimeout(clickClaimButton, 25000);
    
    // Последующие нажатия каждые 25 секунд
    setInterval(clickClaimButton, 25000);

})();
