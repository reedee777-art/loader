(function () {
    'use strict';
    if (window.location.hostname !== 'mix-crypto.com') {
        return;
    }

    // Список текстов ошибок, при появлении которых нужно выполнять переход
    const ERROR_TEXTS = [
        'Antibotlinks were not in correct order',
        'The faucet does not have sufficient funds for this transaction'
    ];

    // Ошибка на главной странице, при которой возврат на litecoin отменяется
    const DAILY_LIMIT_ERROR_TEXT = 'Your daily claim limit has been reached';

    const LITECOIN_URL = 'https://mix-crypto.com/litecoin/';
    const HOME_URL = 'https://mix-crypto.com/';
    const STORAGE_KEY = 'mixCryptoReturnTo';
    const currentUrl = window.location.href.replace(/\/$/, '');

    // Нормализация текста: убираем лишние пробелы/переносы, приводим к нижнему регистру
    function normalize(text) {
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    const NORMALIZED_ERROR_TEXTS = ERROR_TEXTS.map(normalize);

    if (currentUrl === LITECOIN_URL.replace(/\/$/, '')) {
        let triggered = false;

        function checkForError() {
            if (triggered) return;
            const alerts = document.querySelectorAll('.form .alert.alert-danger');
            for (const alert of alerts) {
                const text = normalize(alert.textContent);
                // Строго проверяем именно нужные ошибки, а не любые другие (например "wait 1 minute")
                const matchedError = NORMALIZED_ERROR_TEXTS.find(errText => text.includes(errText));
                if (matchedError) {
                    triggered = true;
                    console.log('[MixCrypto] Обнаружена ошибка ("' + matchedError + '"), через 3 сек переходим на главную...');
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
            let decided = false;

            function proceed() {
                if (decided) return;
                decided = true;
                observer.disconnect();

                const alerts = document.querySelectorAll('.form .alert.alert-danger');
                let dailyLimitReached = false;
                for (const alert of alerts) {
                    const text = normalize(alert.textContent);
                    if (text.includes(normalize(DAILY_LIMIT_ERROR_TEXT))) {
                        dailyLimitReached = true;
                        break;
                    }
                }

                sessionStorage.removeItem(STORAGE_KEY);

                if (dailyLimitReached) {
                    console.log('[MixCrypto] Достигнут дневной лимит, переходим на about:blank...');
                    setTimeout(() => {
                        window.location.href = 'about:blank';
                    }, 1000);
                } else {
                    console.log('[MixCrypto] Возврат на litecoin через 1 сек...');
                    setTimeout(() => {
                        window.location.href = returnTo;
                    }, 1000);
                }
            }

            // Даём странице время отрисовать возможный алерт о дневном лимите,
            // но не ждём дольше 1.5 сек, чтобы не задерживать обычный сценарий
            const observer = new MutationObserver(proceed);
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(proceed, 1500);
        }
    }
})();
