// ==UserScript==
// @name         Multi Faucet Error Redirect Chain
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  При ошибке переключает валюты на faucet сайтах
// @author       ChatGPT
// @match        https://vipcoinfaucet.com/*
// @match        https://mrappswala.com/*
// @match        https://miniappfaucet.com/*
// @match        https://linksfly.link/*
// @match        https://gamerlee.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const chains = {
        "vipcoinfaucet.com": ["BCH","ETH","LTC","USDT","ZEC","TON","FEY","TRX","DOGE","DASH","FEY","PEPE","DGB","BNB","SOL"],
		        "mrappswala.com": ["BCH","LTC","DGB"],
        "miniappfaucet.com": ["BCH","ETH","LTC","USDT","ZEC","TON","FEY","TRX","DOGE","DASH","FEY","PEPE","DGB","BNB","SOL"],
        "linksfly.link": ["BCH","ETH","LTC","USDT","ZEC","TON","TRX","DOGE","DASH","FEY","PEPE","DGB","BNB","SOL"],
        "gamerlee.com": ["BCH","ETH","LTC","USDT","ZEC","TON","TRX","DOGE","DASH","FEY","PEPE","DGB","BNB","SOL"]
    };

    function checkForError() {

        const text = document.body.innerText;
        if (!text.includes('Failed!') && !text.includes('Invalid Claim')) return;

        const host = window.location.hostname;
        const chain = chains[host];
        if (!chain) return;

        const params = new URLSearchParams(window.location.search);
        const current = params.get("currency");

        let index = chain.indexOf(current);
        if (index === -1) index = 0;

        let next = chain[(index + 1) % chain.length];

        const newUrl = `https://${host}/app/faucet?currency=${next}`;

        if (window.location.href !== newUrl) {
            window.location.href = newUrl;
        }
    }

    checkForError();
    setInterval(checkForError, 1200);

})();



