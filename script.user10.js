// ==UserScript==
// @name         Shortlinks AutoClaim — клик по домену и ID
// @namespace    https://freeltc.online/
// @version      1.2
// @description  Автоматически кликает по активной кнопке Claim (1/1) только по правильным ID для каждого домена → переход на текущей вкладке
// @author       Grok
// @match        https://linksfly.link/app/links?currency=*
// @match        https://gamerlee.com/app/links?currency=*
// @match        https://earncryptowrs.in/app/links?currency=*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Определяем текущий домен
    const hostname = location.hostname;

    // Списки ID строго по доменам (как в твоём сообщении)
    const idsByDomain = {
        'linksfly.link': ['56', '54', '53', '57', '51', '50'],           // в нужном тебе порядке
        'gamerlee.com':  ['55', '56', '58', '59', '60'],                  // только эти
        'earncryptowrs.in': ['30', '45', '48', '26']                      // только эти
    };

    // Получаем список ID для текущего сайта
    const targetIds = idsByDomain[hostname] || [];
    if (targetIds.length === 0) {
        console.log('Этот домен не поддерживается скриптом:', hostname);
        return;
    }

    let clicked = false;

    for (const id of targetIds) {
        // Ищем кнопку с точным /validate/ID?currency= и классами btn btn-primary w-100
        const selector = `a[href*="/validate/${id}?currency="].btn.btn-primary.w-100`;
        const link = document.querySelector(selector);

        if (!link) continue;

        // Проверяем, что badge = 1/1 (активная кнопка)
        const badge = link.querySelector('.badge.bg-light.text-dark');
        const isActive = badge && badge.textContent.trim() === '1/1';

        if (isActive) {
            console.log(`[${hostname}] Кликаю по validate ID: ${id} → ${link.href}`);
            location.href = link.href; // переход на текущей вкладке

            clicked = true;
            break; // только одна кнопка за запуск
        }
    }

    if (!clicked) {
        console.log(`[${hostname}] Нет активных кнопок (1/1) из списка для этого сайта`);
        // Авто-обновление каждые 10 секунд (раскомментируй, если нужно):
        // setTimeout(() => location.reload(), 10000);
    }
})();
