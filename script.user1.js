// ==UserScript==
// @name         ClaimClicks Auto Skip (full conditions + 5s delay)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Автопереход по списку с задержкой 5 секунд перед запуском
// @author       You
// @match        https://claimclicks.com/*
// @updateURL    https://reedee777-art.github.io/loader/script.meta1.js
// @downloadURL  https://reedee777-art.github.io/loader/script.user1.js
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';


    // Добавляем паузу 5 секунд перед запуском основного кода
    setTimeout(() => {
        // ======= Основной код автоперехода =======
        const links = [
            "https://claimclicks.com/eth/?r=cifer",
            "https://claimclicks.com/doge/?r=cifer",
            "https://claimclicks.com/ltc/?r=cifer"
           // "https://claimclicks.com/dgb/?r=cifer",
           // "https://claimclicks.com/dash/?r=cifer",
          //  "https://claimclicks.com/trx/?r=cifer",
           // "https://claimclicks.com/bnb/?r=cifer",
          //  "https://claimclicks.com/sol/?r=cifer",
          //  "https://claimclicks.com/ton/?r=cifer",
          //  "https://claimclicks.com/ada/?r=cifer",
          //  "https://claimclicks.com/xrp/?r=cifer",
          //  "https://claimclicks.com/xlm/?r=cifer",
          //  "https://claimclicks.com/matic/?r=cifer",
            "https://cryptofaucet.one/faucet"
           //  "https://acryptominer.io/user/faucet"
        ];

        function getNextLink() {
            let current = window.location.href.split("?")[0];
            let idx = links.findIndex(l => l.startsWith(current));
            if (idx === -1 || idx === links.length - 1) {
                return links[0];
            }
            return links[idx + 1];
        }

        function shouldSkip() {
            if (document.body.innerText.includes("You have to wait")) return true;

            let zeroClaims = document.querySelector("th.list-center");
            if (zeroClaims && zeroClaims.innerText.trim().startsWith("0 daily claims left")) return true;

            let antibotMsg = document.querySelector(".modal .alert.alert-info");
            if (antibotMsg && antibotMsg.innerText.includes("Anti-Bot links are in cool-down")) return true;

            let noFunds = document.querySelector(".alert.alert-danger");
            if (noFunds && noFunds.innerText.includes("does not have sufficient funds")) return true;

            return false;
        }

        function checkAndSkip() {
            if (shouldSkip()) {
                console.log("⏩ Skip: going next...");
                window.location.href = getNextLink();
            }
        }

        // Первичная проверка через 4 сек
        setTimeout(checkAndSkip, 2000);

        // Следим за изменениями на странице
        const observer = new MutationObserver(() => {
            checkAndSkip();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }, 5000); // <-- Задержка 5 секунд
})();





