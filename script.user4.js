// ==UserScript==
// @name         Strong Random Fingerprint (Canvas/WebGL)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Добавляет сильный рандом в Canvas/WebGL fingerprint
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 🔹 Функция для генерации небольшого случайного числа
    function randDelta() {
        return (Math.random() - 0.5) * 4; // от -2 до +2
    }

    // ---- Canvas spoof ----
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, attrs) {
        const ctx = getContext.apply(this, [type, attrs]);
        if (ctx && (type === "2d" || type === "webgl" || type === "webgl2")) {

            // Подмена getImageData
            if (ctx.getImageData) {
                const origGetImageData = ctx.getImageData;
                ctx.getImageData = function(x, y, w, h) {
                    const imageData = origGetImageData.apply(this, [x, y, w, h]);
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        imageData.data[i]   = Math.min(255, imageData.data[i]   + randDelta()); // R
                        imageData.data[i+1] = Math.min(255, imageData.data[i+1] + randDelta()); // G
                        imageData.data[i+2] = Math.min(255, imageData.data[i+2] + randDelta()); // B
                    }
                    return imageData;
                };
            }

            // Подмена toDataURL
            if (ctx.canvas && ctx.canvas.toDataURL) {
                const origToDataURL = ctx.canvas.toDataURL;
                ctx.canvas.toDataURL = function(...args) {
                    let data = origToDataURL.apply(this, args);
                    // добавляем "шум" в base64
                    return data.replace(/.{10}/, "$&" + Math.random().toString(36).substring(2, 6));
                };
            }
        }
        return ctx;
    };

    // ---- WebGL spoof ----
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // GPU fingerprint
        if (parameter === this.RENDERER || parameter === this.VENDOR) {
            return getParameter.apply(this, [parameter]) + "_mod" + Math.floor(Math.random() * 1000);
        }
        return getParameter.apply(this, [parameter]);
    };

})();
