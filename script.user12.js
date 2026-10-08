// ==UserScript==
// @name         FaucetPay Auto Swap → LTC (≥ $0.01, авто)
// @namespace    https://faucetpay.io/
// @version      3.1
// @description  Авто-обмен всех монет ≥ $0.01 (кроме LTC и BTC) на LTC через 4с
// @match        https://faucetpay.io/*
// @match        https://*.faucetpay.io/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const MIN_USD      = 0.01;
  const FROM_EXCLUDE = ['LTC', 'BTC'];   // ← BTC исключён
  const TO_COIN      = 'LTC';
  const AUTO_DELAY   = 4000;             // ← авто-старт через 4 секунды

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const log = m => {
    console.log('[AutoSwap]', m);
    const el = document.getElementById('asw-log');
    if (el) { el.textContent += `\n${new Date().toLocaleTimeString()} ${m}`; el.scrollTop = el.scrollHeight; }
  };

  let running = false;

  function isSwapCoinButton(btn) {
    const sec = btn.closest('div.rounded-lg.border.border-line-soft.bg-bg-2');
    if (!sec) return false;
    return !!sec.querySelector('input[inputmode="decimal"]');
  }

  function getButtons() {
    const all = [...document.querySelectorAll('button[aria-haspopup="listbox"]')];
    const swap = all.filter(isSwapCoinButton);
    swap.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return { from: swap[0] || null, to: swap[1] || null };
  }

  function sectionOf(btn) {
    return btn?.closest('div.rounded-lg.border.border-line-soft.bg-bg-2') || null;
  }

  function currentSymbol(btn) {
    const img = btn?.querySelector('img[alt]');
    return img ? img.alt.toUpperCase() : null;
  }

  function dialogFor(btn) {
    const wrap = btn?.closest('.relative');
    if (!wrap) return null;
    return wrap.querySelector('[role="dialog"][aria-label="Choose coin"]');
  }

  async function openDropdown(btn) {
    if (btn.getAttribute('aria-expanded') === 'true') return dialogFor(btn);
    btn.click();
    for (let i = 0; i < 15; i++) {
      await sleep(100);
      const d = dialogFor(btn);
      if (d) return d;
    }
    return dialogFor(btn);
  }

  async function closeDropdown(btn) {
    if (btn && btn.getAttribute('aria-expanded') === 'true') {
      btn.click();
      await sleep(250);
    }
  }

  function readDropdown(dlg) {
    if (!dlg) return [];
    return [...dlg.querySelectorAll('li button[role="option"]')].map(b => {
      const symbol = b.querySelector('img[alt]')?.alt?.toUpperCase() || '';
      const right  = b.querySelector('.text-right');
      let amount = 0, usd = 0;
      if (right) {
        for (const s of right.querySelectorAll('.mono')) {
          const t = s.textContent.trim();
          const m$ = t.match(/\$([\d.]+)/);
          if (m$) usd = parseFloat(m$[1]);
          else if (/^[\d.]+$/.test(t)) amount = parseFloat(t);
        }
      }
      const selected = b.getAttribute('aria-selected') === 'true';
      return { el: b, symbol, amount, usd, selected };
    });
  }

  async function clickMax() {
    const { from } = getButtons();
    const sec = sectionOf(from);
    if (!sec) throw new Error('Не найден блок From');
    const max = [...sec.querySelectorAll('button')]
      .find(b => b.textContent.trim().toUpperCase() === 'MAX');
    if (!max) throw new Error('Кнопка MAX не найдена');
    max.click();
    await sleep(400);
  }

  function getMainButton() {
    const { from } = getButtons();
    const sec = sectionOf(from);
    const widget = sec?.parentElement;
    if (!widget) return document.querySelector('button.w-full.mt-2');
    return widget.querySelector('button.w-full.mt-2');
  }

  async function swapOne(symbol) {
    let { from, to } = getButtons();
    if (!from || !to) throw new Error('Селекторы From/To не найдены');

    if (currentSymbol(from) !== symbol) {
      const dlg = await openDropdown(from);
      if (!dlg) throw new Error('Дропдаун From не открылся');
      const opt = readDropdown(dlg).find(o => o.symbol === symbol);
      if (!opt) throw new Error(`Опция ${symbol} не найдена`);
      if (!opt.selected) { opt.el.click(); await sleep(500); }
      ({ from } = getButtons());
      await closeDropdown(from);
    }
    await sleep(300);

    ({ from, to } = getButtons());
    if (currentSymbol(to) !== TO_COIN) {
      const dlg = await openDropdown(to);
      if (!dlg) throw new Error('Дропдаун To не открылся');
      const opt = readDropdown(dlg).find(o => o.symbol === TO_COIN);
      if (!opt) throw new Error(`Опция ${TO_COIN} не найдена`);
      if (!opt.selected) { opt.el.click(); await sleep(500); }
      ({ to } = getButtons());
      await closeDropdown(to);
    }
    await sleep(300);

    await clickMax();

    let mb = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      mb = getMainButton();
      if (!mb) continue;
      const txt = mb.textContent.trim();
      log(`  кнопка: "${txt}" disabled=${mb.disabled}`);
      if (!mb.disabled && !/enter|min|fetch|insufficient|pick|execute/i.test(txt)) break;
    }
    if (!mb) throw new Error('Кнопка Swap не найдена');
    if (mb.disabled) throw new Error(`Кнопка Swap disabled: "${mb.textContent.trim()}"`);

    log(`  Жму: "${mb.textContent.trim()}"`);
    mb.click();
    await sleep(900);

    const dialogs = [...document.querySelectorAll('[role="dialog"]')].filter(d => {
      const r = d.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && d.getAttribute('aria-label') !== 'Choose coin';
    });
    for (const d of dialogs) {
      const btn = [...d.querySelectorAll('button')].find(b =>
        !b.disabled && /confirm|swap|exchange|yes|подтверд/i.test(b.textContent)
      );
      if (btn) {
        log(`  Подтверждаю: "${btn.textContent.trim()}"`);
        btn.click();
        await sleep(2000);
        break;
      }
    }
    await sleep(2500);
  }

  async function run() {
    if (running) return;
    running = true;
    log('=== Старт ===');
    try {
      let { from } = getButtons();
      if (!from) throw new Error('Кнопка From не найдена');
      log(`From: ${currentSymbol(from)}`);

      const dlg = await openDropdown(from);
      if (!dlg) throw new Error('Не удалось открыть список монет');
      const opts = readDropdown(dlg);
      log(`В списке монет: ${opts.length}`);
      opts.forEach(o => log(`  ${o.symbol.padEnd(6)} ${o.amount}  $${o.usd}`));
      await closeDropdown(from);

      const targets = opts
        .filter(o => o.usd >= MIN_USD && !FROM_EXCLUDE.includes(o.symbol))
        .map(o => o.symbol);

      log('Цели: ' + (targets.length ? targets.join(', ') : 'нет'));
      if (!targets.length) { log('Нечего менять.'); return; }

      for (const sym of targets) {
        if (!running) { log('Остановлено'); break; }
        log(`--- ${sym} ---`);
        try {
          await swapOne(sym);
          log(`${sym}: OK`);
        } catch (e) {
          log(`${sym}: ошибка — ${e.message}`);
          try { const { from } = getButtons(); await closeDropdown(from); } catch {}
          try { const { to }   = getButtons(); await closeDropdown(to);   } catch {}
          await sleep(700);
        }
      }
    } catch (e) {
      log('Fatal: ' + e.message);
        } finally {
      running = false;
      log('=== Готово ===');
      log('Переход на /wallet/send через 2с…');
      setTimeout(() => {
        window.location.href = 'https://faucetpay.io/wallet/send';
      }, 2000);
    }
  }

  function createUI() {
    if (document.getElementById('asw-panel')) return;
    const d = document.createElement('div');
    d.id = 'asw-panel';
    d.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;background:#111;color:#eee;padding:10px;border:1px solid #444;border-radius:8px;font:12px monospace;max-width:400px;box-shadow:0 4px 16px rgba(0,0,0,.4)';
    d.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
        <strong>AutoSwap → LTC (≥ $${MIN_USD}, авто ${AUTO_DELAY/1000}с)</strong>
        <button id="asw-start" style="background:#2d6;border:0;border-radius:4px;padding:4px 8px;cursor:pointer;color:#000;">Start</button>
        <button id="asw-stop"  style="background:#d44;border:0;border-radius:4px;padding:4px 8px;cursor:pointer;color:#fff;">Stop</button>
        <button id="asw-clear" style="background:#444;border:0;border-radius:4px;padding:4px 8px;cursor:pointer;color:#eee;">Clr</button>
      </div>
      <div id="asw-log" style="max-height:240px;overflow:auto;white-space:pre-wrap;font-size:11px;line-height:1.3;"></div>
    `;
    document.body.appendChild(d);
    document.getElementById('asw-start').onclick = run;
    document.getElementById('asw-stop').onclick = () => { running = false; log('Остановлено'); };
    document.getElementById('asw-clear').onclick = () => { document.getElementById('asw-log').textContent = ''; };
  }

  // Ждём появления виджета, потом через AUTO_DELAY мс сами жмём Start
  let countdownShown = false;
  const wait = setInterval(() => {
    if (getButtons().from) {
      clearInterval(wait);
      createUI();
      if (!countdownShown) {
        countdownShown = true;
        let left = AUTO_DELAY / 1000;
        log(`Виджет найден. Авто-старт через ${left}с… (можно нажать Stop)`);
        const tick = setInterval(() => {
          left--;
          if (left > 0) log(`…${left}с`);
        }, 1000);
        setTimeout(() => {
          clearInterval(tick);
          if (!running) {
            log('Авто-старт.');
            run();
          }
        }, AUTO_DELAY);
      }
    }
  }, 800);
})();
