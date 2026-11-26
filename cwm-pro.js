/* CNCWoodMakerDXF — download packs.
   The preview is free. Each file download (one click on Download) uses 1 credit.
   Credits come from codes sold on Etsy (5 / 10 / 20 downloads) and are stored in this browser. */
(function () {
  'use strict';
  // SHA-256 of the code (uppercase, letters and digits only) -> number of downloads it adds.
  var CODES = {
    '80281910e57bdc01b3baf726b617de8d84f585de21746370b7d90758e6b6fed2': 5,
    '477d198498a31aa7e888dc6c0028f032275fb0986fe3c6b0399545341ae7afb6': 10,
    '859d9908058078b286f2279c170bad1b599101c69622fb2875b71d1dfe0ea9a5': 20
  };
  var PACKS = [
    { n: 5, url: 'https://www.etsy.com/uk/listing/4626022777/5-downloads-pack-laser-box-generator' },
    { n: 10, url: 'https://www.etsy.com/uk/listing/4626034100/10-downloads-pack-laser-box-generator' },
    { n: 20, url: 'https://www.etsy.com/uk/listing/4626026213/20-downloads-pack-laser-box-generator', best: true }
  ];
  var K_CRED = 'cncwm_credits', K_USED = 'cncwm_codes_used';
  var FREE = /\.json$/i;          // saving a project stays free
  var GROUP_MS = 4000;            // files started within this time after one paid click count as one download

  var T = {
    en: { t: 'Download your files', p: 'The preview is free. Downloading the cutting files uses 1 download from a pack. Buy a pack on Etsy, then enter the code from the PDF.',
          left: 'Downloads left in this browser: ', buy: 'Get a pack on Etsy', pk: function (n) { return n + ' downloads'; }, best: 'best value',
          i: 'Code from the PDF', u: 'Add code and download', c: 'Close', e: 'This code is not valid. Check it and try again, or message me on Etsy.',
          used: 'This code has already been added in this browser.', ok: function (n) { return n + ' downloads added. Thank you!'; }, toast: function (n) { return 'Downloaded · ' + n + ' left'; } },
    ro: { t: 'Descarcă fișierele', p: 'Previzualizarea este gratuită. Descărcarea fișierelor de tăiere folosește 1 descărcare dintr-un pachet. Cumpără un pachet pe Etsy și introdu codul din PDF.',
          left: 'Descărcări rămase în acest browser: ', buy: 'Cumpără un pachet pe Etsy', pk: function (n) { return n + ' descărcări'; }, best: 'cel mai avantajos',
          i: 'Codul din PDF', u: 'Adaugă codul și descarcă', c: 'Închide', e: 'Codul nu este valid. Verifică-l și încearcă din nou sau scrie-mi pe Etsy.',
          used: 'Acest cod a fost deja adăugat în acest browser.', ok: function (n) { return 'Au fost adăugate ' + n + ' descărcări. Mulțumesc!'; }, toast: function (n) { return 'Descărcat · au rămas ' + n; } },
    ru: { t: 'Скачать файлы', p: 'Предпросмотр бесплатный. Скачивание файлов для резки использует 1 скачивание из пакета. Купите пакет на Etsy и введите код из PDF.',
          left: 'Осталось скачиваний в этом браузере: ', buy: 'Купить пакет на Etsy', pk: function (n) { return n + ' скачиваний'; }, best: 'выгоднее всего',
          i: 'Код из PDF', u: 'Добавить код и скачать', c: 'Закрыть', e: 'Код недействителен. Проверьте его и попробуйте ещё раз или напишите мне на Etsy.',
          used: 'Этот код уже добавлен в этом браузере.', ok: function (n) { return 'Добавлено скачиваний: ' + n + '. Спасибо!'; }, toast: function (n) { return 'Скачано · осталось ' + n; } }
  };
  function lang() { var l; try { l = localStorage.getItem('cncwm_lang'); } catch (e) {} return T[l] ? l : 'en'; }
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function credits() { var c = parseInt(get(K_CRED, 0), 10); return c > 0 ? c : 0; }
  function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function sha(s) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve('');
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }

  var origClick = HTMLAnchorElement.prototype.click;
  var openUntil = 0, pending = [];
  function paid(a) { return a.hasAttribute('download') && !FREE.test(a.download || ''); }
  function request(a) {
    if (Date.now() < openUntil) return true;          // part of a download already paid for
    pending.push(a);
    if (pending.length === 1) setTimeout(decide, 0);
    return false;
  }
  function decide() {
    if (credits() > 0) { spend(); flush(); } else show();
  }
  function spend() {
    var c = credits() - 1; set(K_CRED, c); openUntil = Date.now() + GROUP_MS;
    toast(T[lang()].toast(c));
  }
  function flush() {
    var list = pending; pending = [];
    list.forEach(function (a, i) { setTimeout(function () { a.__cwmOk = true; if (!a.isConnected) { a.style.display = 'none'; document.body.appendChild(a); } origClick.call(a); }, i * 300); });
  }
  HTMLAnchorElement.prototype.click = function () {
    if (this.__cwmOk || !paid(this) || request(this)) return origClick.apply(this, arguments);
  };
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[download]');
    if (!a || a.__cwmOk || !paid(a)) return;
    if (request(a)) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
  }, true);

  var css = '.cwm-pro-bg{position:fixed;inset:0;background:rgba(20,26,22,.62);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '.cwm-pro{background:#fbf8f2;color:#1f2a22;border-radius:16px;max-width:440px;width:100%;padding:24px 22px;box-shadow:0 20px 60px rgba(0,0,0,.35);max-height:92vh;overflow:auto}' +
    '.cwm-pro h3{margin:0 0 8px;font-size:1.25rem}.cwm-pro p{margin:0 0 12px;font-size:.95rem;line-height:1.45;color:#3d463f}.cwm-pro .left{font-weight:700;color:#1f2a22}' +
    '.cwm-pro .packs{display:grid;gap:8px;margin:4px 0 16px}.cwm-pro .packs a{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #d9ccb6;color:#1f2a22;font-weight:700;text-decoration:none;border-radius:10px;padding:11px 14px}' +
    '.cwm-pro .packs a.best{background:#c49a5c;border-color:#c49a5c}.cwm-pro .packs small{font-weight:600;font-size:.78rem;opacity:.8}' +
    '.cwm-pro input{width:100%;box-sizing:border-box;font-size:1rem;padding:11px 12px;border:1px solid #cdbfa8;border-radius:10px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}' +
    '.cwm-pro .row{display:flex;gap:8px}.cwm-pro button{flex:1;border:0;border-radius:10px;padding:11px;font-size:.95rem;font-weight:600;cursor:pointer}' +
    '.cwm-pro .go{background:#1f2a22;color:#fff}.cwm-pro .x{background:#e8e0d2;color:#1f2a22}.cwm-pro .msg{min-height:1.2em;font-size:.88rem;margin:8px 0 0}.cwm-pro .bad{color:#b3261e}.cwm-pro .good{color:#1e7a3c}' +
    '.cwm-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#1f2a22;color:#fff;padding:10px 18px;border-radius:999px;font:600 14px Inter,system-ui,sans-serif;z-index:2147483001;box-shadow:0 8px 24px rgba(0,0,0,.3)}';
  function addCss() { if (!document.getElementById('cwm-pro-css')) { var st = document.createElement('style'); st.id = 'cwm-pro-css'; st.textContent = css; document.head.appendChild(st); } }
  function toast(s) {
    addCss(); var d = document.createElement('div'); d.className = 'cwm-toast'; d.setAttribute('data-notr', ''); d.textContent = s;
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3500);
  }
  function show() {
    if (document.querySelector('.cwm-pro-bg')) return;
    var s = T[lang()]; addCss();
    var bg = document.createElement('div'); bg.className = 'cwm-pro-bg'; bg.setAttribute('data-notr', '');
    bg.innerHTML = '<div class="cwm-pro" role="dialog" aria-modal="true"><h3></h3><p class="intro"></p><p class="left"></p><p class="buy" style="margin-bottom:6px;font-weight:600"></p><div class="packs"></div>' +
      '<input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"><div class="row"><button class="x" type="button"></button><button class="go" type="button"></button></div><p class="msg"></p></div>';
    bg.querySelector('h3').textContent = s.t; bg.querySelector('.intro').textContent = s.p;
    bg.querySelector('.left').textContent = s.left + credits(); bg.querySelector('.buy').textContent = s.buy + ':';
    var packs = bg.querySelector('.packs');
    PACKS.forEach(function (p) {
      var a = document.createElement('a'); a.href = p.url; a.target = '_blank'; a.rel = 'noopener'; if (p.best) a.className = 'best';
      a.textContent = s.pk(p.n); if (p.best) { var sm = document.createElement('small'); sm.textContent = s.best; a.appendChild(sm); }
      packs.appendChild(a);
    });
    var inp = bg.querySelector('input'); inp.placeholder = s.i;
    var go = bg.querySelector('.go'), x = bg.querySelector('.x'), msg = bg.querySelector('.msg');
    go.textContent = s.u; x.textContent = s.c;
    function close() { bg.remove(); pending = []; }
    x.onclick = close; bg.onclick = function (e) { if (e.target === bg) close(); };
    function tryCode() {
      var c = norm(inp.value); if (!c) return;
      sha(c).then(function (h) {
        var add = CODES[h];
        if (!add) { msg.className = 'msg bad'; msg.textContent = s.e; return; }
        var used = get(K_USED, []); if (!Array.isArray(used)) used = [];
        if (used.indexOf(h) >= 0) {
          msg.className = 'msg bad'; msg.textContent = s.used;
          if (credits() > 0) setTimeout(function () { bg.remove(); spend(); flush(); }, 900);
          return;
        }
        used.push(h); set(K_USED, used); set(K_CRED, credits() + add);
        msg.className = 'msg good'; msg.textContent = s.ok(add);
        setTimeout(function () { bg.remove(); spend(); flush(); }, 700);
      });
    }
    go.onclick = tryCode; inp.onkeydown = function (e) { if (e.key === 'Enter') tryCode(); };
    document.body.appendChild(bg); setTimeout(function () { inp.focus(); }, 50);
  }
})();
