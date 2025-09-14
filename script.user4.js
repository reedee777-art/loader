// ==UserScript==
// @name         Fingerprint Spoofer (safe with IconCaptcha Solver & Feyorra Captcha555)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Спуфер Canvas/WebGL, не мешает капчам и Tesseract
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ---- Canvas spoof (безопасно для solver'ов и Tesseract) ----
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        const stack = (new Error()).stack || "";
        // Если вызов идёт из solver или из tesseract → возвращаем оригинал
        // (проверяем наличие ключевых слов в стеке вызовов)
        if (
            /jimp|min\.js|solver|tesseract|captcha/i.test(stack) ||
            this.dataset?.noSpoof === "true" // можно отключить вручную через атрибут
        ) {
            return origToDataURL.apply(this, args);
        }

        let data = origToDataURL.apply(this, args);
        // Лёгкий шум, который ломает fingerprint, но не ломает реальную графику
        return data.replace(/.{30}/, "$&" + Math.random().toString(36).substring(2, 8));
    };

    // ---- WebGL spoof ----
    const patchGL = (proto) => {
        if (!proto) return;
        const origGetParameter = proto.getParameter;
        proto.getParameter = function(parameter) {
            if (parameter === this.RENDERER || parameter === this.VENDOR) {
                return origGetParameter.apply(this, [parameter]) + "_mod" + Math.floor(Math.random() * 1000);
            }
            return origGetParameter.apply(this, [parameter]);
        };
    };

    patchGL(WebGLRenderingContext.prototype);
    if (window.WebGL2RenderingContext) {
        patchGL(WebGL2RenderingContext.prototype);
    }

})();
