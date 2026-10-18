// ==UserScript==
// @name         FaucetPay Auto Login & Authorize
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Автоклик Sign in with FaucetPay и Authorize
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let loginScheduled = false;
    let authScheduled = false;

    function findLogin() {
        return document.querySelector(
            'a.button.button-primary[href="/auth/login"]'
        );
    }

    function findAuthorize() {
        return [...document.querySelectorAll('button')]
            .find(btn => btn.textContent.trim() === 'Authorize');
    }

    function clickLogin() {
        const btn = findLogin();

        if (btn && !loginScheduled) {
            loginScheduled = true;

            console.log('[Auto] Login найден → ждём 3 сек');

            setTimeout(() => {
                if (document.body.contains(btn)) {
                    btn.click();
                    console.log('[Auto] Login нажат');
                }
                loginScheduled = false;
            }, 3000);
        }
    }

    function clickAuthorize() {
        const btn = findAuthorize();

        if (btn && !authScheduled) {
            authScheduled = true;

            console.log('[Auto] Authorize найден → ждём 3 сек');

            setTimeout(() => {
                if (!document.body.contains(btn)) {
                    authScheduled = false;
                    return;
                }

                if (btn.disabled) {
                    console.log('[Auto] Authorize пока disabled → повтор через 1 сек');
                    authScheduled = false;
                    return;
                }

                // Обычный клик
                btn.click();

                console.log('[Auto] Authorize нажат');
                authScheduled = false;

            }, 3000);
        }
    }

    function check() {
        clickLogin();
        clickAuthorize();
    }

    // Отслеживание динамически появляющихся элементов
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true
    });

    setInterval(check, 500);
    check();

})();
