// ==UserScript==
// @name         Fingerprint Spoofer (safe with IconCaptcha Solver)
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Спуфер отпечатка через Canvas.toDataURL + WebGL, не мешает капча-скриптам
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ---- Canvas spoof (только toDataURL, но безопасно) ----
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        const err = new Error().stack || "";
        // Если вызов идёт из solver (ищем "jimp" или "solver" в стеке) → возвращаем чистый результат
        if (/jimp|min\.js|solver/i.test(err)) {
            return origToDataURL.apply(this, args);
        }
        let data = origToDataURL.apply(this, args);
        // Добавляем шум только для внешних fingerprint-сборщиков
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
