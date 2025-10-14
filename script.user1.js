// ==UserScript==
// @name         ClaimClicks Auto Skip (full conditions + 5s delay + wait redirect)
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Автопереход по списку с задержкой 5 секунд + отдельный редирект при "You have to wait"
// @author       You
// @match        https://claimclicks.com/*
// @updateURL    https://reedee777-art.github.io/loader/script.meta1.js
// @downloadURL  https://reedee777-art.github.io/loader/script.user1.js
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // Добавляем паузу 5 секунд перед запуском
    setTimeout(() => {
        // ======= Список ссылок =======
        const links = [
            "https://claimclicks.com/doge/?r=cifer",
            "https://claimclicks.com/eth/?r=cifer",
            "https://claimclicks.com/ltc/?r=cifer",
            "https://claimclicks.com/dgb/?r=cifer",
            "https://claimclicks.com/dash/?r=cifer",
            "https://claimclicks.com/trx/?r=cifer",
            "https://claimclicks.com/bnb/?r=cifer",
            "https://claimclicks.com/sol/?r=cifer",
            "https://claimclicks.com/ton/?r=cifer",
            "https://claimclicks.com/ada/?r=cifer",
            "https://claimclicks.com/xrp/?r=cifer",
            "https://claimclicks.com/xlm/?r=cifer",
            "https://claimclicks.com/matic/?r=cifer"
        ];

        const waitRedirect = "https://cryptofaucet.one/faucet";

        function getNextLink() {
            let current = window.location.href.split("?")[0];
            let idx = links.findIndex(l => l.startsWith(current));
            if (idx === -1 || idx === links.length - 1) {
                return links[0];
            }
            return links[idx + 1];
        }

        function checkAndSkip() {
             Если "You have to wait" → сразу уходим на cryptofaucet.one
            if (document.body.innerText.includes("You have to wait")) {
                console.log("⏩ Redirect (wait case) → cryptofaucet.one");
                window.location.href = waitRedirect;
                return;
            }

    // Новое условие: проверяем <h4 class="alert-heading">0 daily claims left.</h4>
    let zeroClaimsDiv = document.querySelector(".alert.alert-light .alert-heading");
    if (zeroClaimsDiv && zeroClaimsDiv.innerText.trim().startsWith("0 daily claims left")) {
        console.log("⏩ Skip (0 claims) → next link");
        window.location.href = getNextLink();
        return;
    }

    // Старое условие (на случай других страниц)
    let zeroClaims = document.querySelector("th.list-center");
    if (zeroClaims && zeroClaims.innerText.trim().startsWith("0 daily claims left")) {
        console.log("⏩ Skip (0 claims, old format) → next link");
        window.location.href = getNextLink();
        return;
    }

            let antibotMsg = document.querySelector(".modal .alert.alert-info");
            if (antibotMsg && antibotMsg.innerText.includes("Anti-Bot links are in cool-down")) {
                console.log("⏩ Skip (antibot) → next link");
                window.location.href = getNextLink();
                return;
            }

            let noFunds = document.querySelector(".alert.alert-danger");
            if (noFunds && noFunds.innerText.includes("does not have sufficient funds")) {
                console.log("⏩ Skip (no funds) → next link");
                window.location.href = getNextLink();
                return;
            }
        }

        // Первичная проверка через 2 сек
        setTimeout(checkAndSkip, 2000);

        // Следим за изменениями на странице
        const observer = new MutationObserver(() => {
            checkAndSkip();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }, 5000); // задержка 5 секунд
})();



