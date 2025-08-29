// ==UserScript==
// @name         ClaimClicks Auto Skip (full conditions)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Автопереход по списку
// @author       You
// @match        https://claimclicks.com/*
// @updateURL    https://reedee777-art.github.io/loader/script.meta1.js
// @downloadURL  https://reedee777-art.github.io/loader/script.user1.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Текущая версия скрипта
    const currentVersion = '1.4';

    try {
        // Скачиваем мета-файл с GitHub Pages
        const res = await fetch('https://reedee777-art.github.io/loader/script.meta1.js', {cache: "no-store"});
        const text = await res.text();

        // Ищем строку с @version
        const match = text.match(/@version\s+([0-9.]+)/);
        if (match) {
            const latestVersion = match[1];
            if (latestVersion !== currentVersion) {
                console.log(`Найдена новая версия скрипта: ${latestVersion}, перезагрузка страницы...`);
                // Перезагрузка страницы, чтобы Violentmonkey подтянул обновление
                location.reload();
            }
        }
    } catch (e) {
        console.warn('Не удалось проверить обновления скрипта:', e);
    }
    const links = [
        "https://claimclicks.com/eth/?r=cifer",
        "https://claimclicks.com/doge/?r=cifer",
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
        "https://claimclicks.com/matic/?r=cifer",
        "https://claimclicks.com/zec/?r=cifer",
        "https://coinvault.top/?r=291"
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
        // 1) ожидание
        if (document.body.innerText.includes("You have to wait")) return true;

        // 2) 0 daily claims left
        let zeroClaims = document.querySelector("th.list-center");
        if (zeroClaims && zeroClaims.innerText.trim().startsWith("0 daily claims left")) return true;

        // 3) Anti-Bot (модалка)
        let antibotMsg = document.querySelector(".modal .alert.alert-info");
        if (antibotMsg && antibotMsg.innerText.includes("Anti-Bot links are in cool-down")) return true;

        // 4) Недостаточно средств
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

    // Проверка сразу после загрузки
    setTimeout(checkAndSkip, 2000);

    // Наблюдатель за динамическими изменениями (например, модалки)
    const observer = new MutationObserver(() => {
        checkAndSkip();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
