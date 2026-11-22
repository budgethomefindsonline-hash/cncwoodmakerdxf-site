/* CNCWoodMakerDXF — Pro access: preview is free, file downloads need the code sold on Etsy. */
(function () {
  'use strict';
  // SHA-256 of the valid codes (uppercase, no spaces). Current code first; keep the previous one for a grace period.
  var VALID = ['89f93699904c367a0a1a4054b351cf94fc5361173cbc673235b8207650550fb6'];
  var ETSY_URL = 'https://www.etsy.com/shop/CNCWoodMakerDXF';
  var KEY = 'cncwm_pro';
  var FREE = /\.json$/i; // saving a project stays free

  var T = {
    en: { t: 'Download with Pro access', p: 'The preview is free. To download the cutting files (DXF, SVG, AI) from all 6 generators, enter your Pro code.', b: 'Get the Pro code on Etsy', i: 'Pro code', u: 'Unlock and download', c: 'Close', e: 'This code is not valid. Check it and try again, or message me on Etsy.', ok: 'Unlocked. Thank you for supporting my work!' },
    ro: { t: 'Descărcare cu acces Pro', p: 'Previzualizarea este gratuită. Pentru a descărca fișierele de tăiere (DXF, SVG, AI) din toate cele 6 generatoare, introdu codul Pro.', b: 'Cumpără codul Pro pe Etsy', i: 'Cod Pro', u: 'Deblochează și descarcă', c: 'Închide', e: 'Codul nu este valid. Verifică-l și încearcă din nou sau scrie-mi pe Etsy.', ok: 'Deblocat. Mulțumesc că îmi susții munca!' },
    ru: { t: 'Скачивание с Pro-доступом', p: 'Предпросмотр бесплатный. Чтобы скачать файлы для резки (DXF, SVG, AI) из всех 6 генераторов, введите Pro-код.', b: 'Купить Pro-код на Etsy', i: 'Pro-код', u: 'Разблокировать и скачать', c: 'Закрыть', e: 'Код недействителен. Проверьте его и попробуйте ещё раз или напишите мне на Etsy.', ok: 'Разблокировано. Спасибо за поддержку!' }
  };
  function lang() { var l; try { l = localStorage.getItem('cncwm_lang'); } catch (e) {} return T[l] ? l : 'en'; }
  function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function sha(s) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve('');
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function unlocked() { var h; try { h = localStorage.getItem(KEY); } catch (e) {} return !!h && VALID.indexOf(h) >= 0; }

  var origClick = HTMLAnchorElement.prototype.click;
  var pending = [];
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download') && !FREE.test(this.download || '') && !unlocked()) {
      var a = this;
      if (!a.isConnected) { a.style.display = 'none'; document.body.appendChild(a); }
      pending.push(a);
      if (pending.length === 1) setTimeout(show, 0);
      return;
    }
    return origClick.apply(this, arguments);
  };
  // A download link clicked directly by the user
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[download]');
    if (!a || FREE.test(a.download || '') || unlocked() || a.__cwmOk) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    pending.push(a); if (pending.length === 1) show();
  }, true);

  function flush() {
    var list = pending; pending = [];
    list.forEach(function (a, i) { setTimeout(function () { a.__cwmOk = true; origClick.call(a); }, i * 350); });
  }

  var css = '.cwm-pro-bg{position:fixed;inset:0;background:rgba(20,26,22,.62);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '.cwm-pro{background:#fbf8f2;color:#1f2a22;border-radius:16px;max-width:420px;width:100%;padding:24px 22px;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
    '.cwm-pro h3{margin:0 0 8px;font-size:1.25rem}.cwm-pro p{margin:0 0 14px;font-size:.95rem;line-height:1.45;color:#3d463f}' +
    '.cwm-pro a.cwm-buy{display:block;text-align:center;background:#c49a5c;color:#1f2a22;font-weight:700;text-decoration:none;border-radius:10px;padding:12px;margin-bottom:14px}' +
    '.cwm-pro input{width:100%;box-sizing:border-box;font-size:1rem;padding:11px 12px;border:1px solid #cdbfa8;border-radius:10px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}' +
    '.cwm-pro .row{display:flex;gap:8px}.cwm-pro button{flex:1;border:0;border-radius:10px;padding:11px;font-size:.95rem;font-weight:600;cursor:pointer}' +
    '.cwm-pro .go{background:#1f2a22;color:#fff}.cwm-pro .x{background:#e8e0d2;color:#1f2a22}.cwm-pro .msg{min-height:1.2em;font-size:.88rem;margin:8px 0 0}.cwm-pro .bad{color:#b3261e}.cwm-pro .good{color:#1e7a3c}';
  function show() {
    if (document.querySelector('.cwm-pro-bg')) return;
    var s = T[lang()];
    if (!document.getElementById('cwm-pro-css')) { var st = document.createElement('style'); st.id = 'cwm-pro-css'; st.textContent = css; document.head.appendChild(st); }
    var bg = document.createElement('div'); bg.className = 'cwm-pro-bg'; bg.setAttribute('data-notr', '');
    bg.innerHTML = '<div class="cwm-pro" role="dialog" aria-modal="true"><h3></h3><p></p><a class="cwm-buy" target="_blank" rel="noopener"></a>' +
      '<input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"><div class="row"><button class="x" type="button"></button><button class="go" type="button"></button></div><p class="msg"></p></div>';
    bg.querySelector('h3').textContent = s.t; bg.querySelector('p').textContent = s.p;
    var buy = bg.querySelector('.cwm-buy'); buy.textContent = s.b; buy.href = ETSY_URL;
    var inp = bg.querySelector('input'); inp.placeholder = s.i;
    var go = bg.querySelector('.go'), x = bg.querySelector('.x'), msg = bg.querySelector('.msg');
    go.textContent = s.u; x.textContent = s.c;
    function close() { bg.remove(); pending = []; }
    x.onclick = close; bg.onclick = function (e) { if (e.target === bg) close(); };
    function tryCode() {
      sha(norm(inp.value)).then(function (h) {
        if (VALID.indexOf(h) >= 0) {
          try { localStorage.setItem(KEY, h); } catch (e) {}
          msg.className = 'msg good'; msg.textContent = s.ok;
          setTimeout(function () { bg.remove(); flush(); }, 600);
        } else { msg.className = 'msg bad'; msg.textContent = s.e; }
      });
    }
    go.onclick = tryCode; inp.onkeydown = function (e) { if (e.key === 'Enter') tryCode(); };
    document.body.appendChild(bg); setTimeout(function () { inp.focus(); }, 50);
  }
})();
