// ==UserScript==
// @name         ADSLab Auto Reload (30s)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Нажимает кнопку "Reload" на adslab.me каждые 30 секунд
// @match        https://adslab.me/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const INTERVAL_MS = 30_000; // 30 секунд

    // Ищем кнопку по тексту "Reload" и наличию SVG с классом lucide-refresh-cw
    function findReloadButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text === 'Reload' || text.includes('Reload')) {
                // доп. проверка на иконку refresh
                if (btn.querySelector('svg.lucide-refresh-cw, svg.lucide-refresh')) {
                    return btn;
                }
            }
        }
        // fallback — просто кнопка с текстом Reload
        for (const btn of buttons) {
            if (btn.textContent.trim().includes('Reload')) return btn;
        }
        return null;
    }

    function clickReload() {
        const btn = findReloadButton();
        if (!btn) {
            console.log('[ADSLab AutoReload] Кнопка Reload не найдена');
            return;
        }
        if (btn.disabled) {
            console.log('[ADSLab AutoReload] Кнопка disabled, пропускаю');
            return;
        }
        btn.click();
        console.log('[ADSLab AutoReload] Клик по Reload —', new Date().toLocaleTimeString());
    }

    // Первый клик через 30 сек после загрузки, затем каждые 30 сек
    setTimeout(() => {
        clickReload();
        setInterval(clickReload, INTERVAL_MS);
    }, INTERVAL_MS);

    console.log('[ADSLab AutoReload] Скрипт запущен, интервал 30 секунд');
})();