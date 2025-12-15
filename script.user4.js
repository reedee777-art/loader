// ==UserScript==
// @name         ClaimTRX Auto Click Monlix PTC Improved
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Автоматически кликает на "Go to Monlix PTC" один раз и на контейнеры "Watch ad" (так как клик по button может не работать из-за event на родителе)
// @author       Grok
// @match        https://claimtrx.com/*
// @match        https://offers.monlix.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    let goClicked = false; // Чтобы кликнуть только один раз на Go кнопку

    function clickGoButton() {
        if (goClicked) return;
        const goButton = document.querySelector('a.btn.btn-primary.btn-lg.mt-2.mb-2[style*="width: 100%;"]');
        if (goButton && goButton.textContent.trim().includes('Go to Monlix PTC')) {
            console.log('Нажатие на "Go to Monlix PTC"');
            goButton.click();
            goClicked = true;
        }
    }

    function clickWatchAds() {
        // Кликаем по внешнему контейнеру <a>, который имеет href и является кликабельным элементом
        const watchContainers = Array.from(document.querySelectorAll('a.flex.h-\\[44px\\].w-full.cursor-pointer.bg-\\[\\#32D276\\]'));
        
        // Фильтр по наличию текста "Watch ad" внутри (на случай других похожих элементов)
        const filtered = watchContainers.filter(container => 
            container.textContent.trim().includes('Watch ad')
        );

        if (filtered.length === 0) {
            console.log('Кнопки "Watch ad" не найдены на этой итерации');
            return;
        }

        console.log(`Найдено ${filtered.length} кнопок "Watch ad". Начинаем последовательные клики...`);

        filtered.reduce((promise, container, index) => {
            return promise.then(() => {
                console.log(`Клик по контейнеру Watch ad #${index + 1}`);
                container.click(); // Кликаем по <a>, который открывает рекламу
                return new Promise(resolve => setTimeout(resolve, 1500)); // Пауза 1.5 секунды (увеличил чуть для надежности)
            });
        }, Promise.resolve());
    }

    // Основной observer для динамического контента (включая внутри iframe, но скрипт работает в главном или iframe контексте)
    const observer = new MutationObserver((mutations) => {
        const currentUrl = window.location.href;

        if (currentUrl.includes('claimtrx.com')) {
            clickGoButton();
        }

        if (currentUrl.includes('offers.monlix.com')) {
            clickWatchAds();
        }
    });

    // Наблюдаем за всем body
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Запуск сразу при загрузке (на случай если элементы уже есть)
    setTimeout(() => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('claimtrx.com')) {
            clickGoButton();
        }
        if (currentUrl.includes('offers.monlix.com')) {
            clickWatchAds();
        }
    }, 2000); // Задержка 2 секунды для полной загрузки контента в iframe
})();
