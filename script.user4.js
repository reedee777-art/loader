// ==UserScript==
// @name         Strong Random Fingerprint (toDataURL + WebGL only)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Рандом только в Canvas.toDataURL и WebGL fingerprint (не ломает getImageData)
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ---- Canvas spoof (только toDataURL) ----
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        let data = origToDataURL.apply(this, args);
        // Добавляем случайный "шум" в base64 (без изменения самой картинки)
        return data.replace(/.{30}/, "$&" + Math.random().toString(36).substring(2, 8));
    };

    // ---- WebGL spoof ----
    const origGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === this.RENDERER || parameter === this.VENDOR) {
            return origGetParameter.apply(this, [parameter]) + "_mod" + Math.floor(Math.random() * 1000);
        }
        return origGetParameter.apply(this, [parameter]);
    };

    // ---- WebGL2 spoof ---- (если поддерживается)
    if (window.WebGL2RenderingContext) {
        const origGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === this.RENDERER || parameter === this.VENDOR) {
                return origGetParameter2.apply(this, [parameter]) + "_mod" + Math.floor(Math.random() * 1000);
            }
            return origGetParameter2.apply(this, [parameter]);
        };
    }

})();
