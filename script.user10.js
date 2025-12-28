// ==UserScript==
// @name         Shortlinks AutoClaim (linksfly, gamerlee, earncryptowrs) — переход на текущей вкладке
// @namespace    https://freeltc.online/
// @version      1.1
// @description  Автоматически кликает по активной кнопке Claim (1/1) → переход по ссылке на текущей вкладке
// @author       Grok
// @match        https://linksfly.link/app/links?currency=*
// @match        https://gamerlee.com/app/links?currency=*
// @match        https://earncryptowrs.in/app/links?currency=*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Список всех нужных validate ID
    const targetIds = [
        '50', '51', '53', '54', '56', '57',  // linksfly.link
        '55', '56', '58', '59', '60',       // gamerlee.com
        '26', '30', '45', '48'              // earncryptowrs.in
    ];

    let clicked = false;

    for (const id of targetIds) {
        // Ищем кнопку с точным /validate/ID?currency= и нужными классами
        const link = document.querySelector(`a[href*="/validate/${id}?currency="].btn.btn-primary.w-100`);
        if (!link) continue;

        // Проверяем badge 1/1 — значит доступна для клика
        const badge = link.querySelector('.badge.bg-light.text-dark');
        const isActive = badge && badge.textContent.trim() === '1/1';

        if (isActive) {
            console.log('Кликаю по validate ID:', id, link.href);
            // Переходим по ссылке на ТЕКУЩЕЙ вкладке
            location.href = link.href;

            clicked = true;
            break; // только одна кнопка за запуск
        }
    }

    if (!clicked) {
        console.log('Нет активных кнопок (1/1) из списка');
        // Если хочешь авто-обновление каждые 10 секунд — раскомментируй строку ниже:
        // setTimeout(() => location.reload(), 10000);
    }
})();