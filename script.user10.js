(function () {
    'use strict';

    if (window.location.hostname !== 'mix-crypto.com') {
        return;
    }

    const ERROR_TEXT = 'Antibotlinks were not in correct order';
    const LITECOIN_URL = 'https://mix-crypto.com/litecoin/';
    const HOME_URL = 'https://mix-crypto.com/';
    const STORAGE_KEY = 'mixCryptoReturnTo';

    const currentUrl = window.location.href.replace(/\/$/, '');

    // Нормализация текста: убираем лишние пробелы/переносы, приводим к нижнему регистру
    function normalize(text) {
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    if (currentUrl === LITECOIN_URL.replace(/\/$/, '')) {
        let triggered = false;

        function checkForError() {
            if (triggered) return;

            const alerts = document.querySelectorAll('.form .alert.alert-danger');
            for (const alert of alerts) {
                const text = normalize(alert.textContent);

                // Строго проверяем именно нужную ошибку, а не любую другую (например "wait 1 minute")
                if (text.includes(normalize(ERROR_TEXT))) {
                    triggered = true;
                    console.log('[MixCrypto] Ошибка antibotlinks обнаружена, через 3 сек переходим на главную...');

                    setTimeout(() => {
                        sessionStorage.setItem(STORAGE_KEY, LITECOIN_URL);
                        window.location.href = HOME_URL;
                    }, 3000);

                    break;
                }
            }
        }

        const observer = new MutationObserver(checkForError);
        observer.observe(document.body, { childList: true, subtree: true });

        checkForError();
    }

    if (currentUrl === HOME_URL.replace(/\/$/, '')) {
        const returnTo = sessionStorage.getItem(STORAGE_KEY);
        if (returnTo) {
            sessionStorage.removeItem(STORAGE_KEY);
            console.log('[MixCrypto] Возврат на litecoin через 1 сек...');
            setTimeout(() => {
                window.location.href = returnTo;
            }, 1000);
        }
    }
})();
