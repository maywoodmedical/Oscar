// ==UserScript==
// @name         MedicationsSignature
// @namespace    maywood-oscar
// @version      2.1
// @description  Automatically stamps the prescribing provider's saved signature onto the Rx, and adjusts Medications window size
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/oscarRx/*
// @match        https://maywoodmedicalclinic.openosp.ca/oscar/signature_pad/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @run-at       document-idle
// ==/UserScript==

/*
 * HOW IT WORKS
 * 1. Whenever an Oscar page URL contains ?providerNo=N (e.g. choosePatient.do?providerNo=2),
 *    N is remembered as the current prescriber.
 * 2. Signatures are stored per provider number in Tampermonkey storage (not in this file).
 *    Draw, edit or remove them via the "Signatures" button in the Medications window.
 * 3. When the Rx print window shows <canvas id="canvas">, the matching provider's signature is
 *    drawn onto it, wrapped in a synthetic pen stroke so Oscar's own handlers save it.
 *    A "Stamp signature" button is also added beside the canvas as a manual fallback.
 */

(function () {
  'use strict';

  // ---------- settings ----------
  const AUTO_APPLY = true;        // false = only stamp when you click the button
  const AUTO_SAVE = true;         // click Oscar's hidden Save button after stamping
  const PADDING = 6;              // px margin inside the canvas
  const SHOW_TOAST = true;        // brief "Signed as Dr X" confirmation
  const RESIZE_RX_WINDOW = true;  // enlarge the medication (Rx) pop-up window when it opens
  const RX_WINDOW_WIDTH = 1400;   // px – capped at your screen size
  const RX_WINDOW_HEIGHT = 1000;  // px – capped at your screen size

  const SIG_KEY = n => 'sig_' + n;            // { label, dataUrl }
  const CURRENT_KEY = 'currentProviderNo';

  // ---------- 1. track the prescriber ----------
  function providerFromUrl(win) {
    try {
      return new URLSearchParams(win.location.search).get('providerNo');
    } catch (e) {
      return null; // cross-origin frame
    }
  }

  (function rememberProvider() {
    const p = providerFromUrl(window);
    if (p && /oscarRx/i.test(location.pathname)) GM_setValue(CURRENT_KEY, p);
  })();

  function getProviderNo() {
    // Prefer a providerNo in this frame or any ancestor's URL, else the last one seen.
    let w = window;
    for (let i = 0; i < 6; i++) {
      const p = providerFromUrl(w);
      if (p) return p;
      if (w === w.parent) break;
      w = w.parent;
    }
    return GM_getValue(CURRENT_KEY, null);
  }

  // ---------- 1b. enlarge the medication window ----------
  // Runs once per Rx pop-up window (choosePatient.do and the pages it leads to), so a
  // size you set by hand afterwards isn't overridden on every page load.
  (function resizeRxWindow() {
    if (!RESIZE_RX_WINDOW || window !== window.top) return;
    if (!/\/oscarRx\//i.test(location.pathname)) return;
    try {
      if (sessionStorage.getItem('tmRxWindowResized')) return;
      sessionStorage.setItem('tmRxWindowResized', '1');
    } catch (e) {}
    const w = Math.min(RX_WINDOW_WIDTH, screen.availWidth);
    const h = Math.min(RX_WINDOW_HEIGHT, screen.availHeight);
    try {
      window.resizeTo(w, h);
      const left = (screen.availLeft || 0) + Math.max(0, (screen.availWidth - w) / 2);
      const top = (screen.availTop || 0) + Math.max(0, (screen.availHeight - h) / 2);
      window.moveTo(left, top);
    } catch (e) {
      console.warn('Signature script: could not resize the Rx window', e);
    }
  })();

  // ---------- 2. signature manager (one Tampermonkey menu item) ----------
  // Lists stored signatures (with preview, Edit and Remove) and has a 500x100 pad
  // to draw a signature for a provider number.
  function openSignatureManager() {
    const old = document.getElementById('tm-sig-dialog');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'tm-sig-dialog';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.4);' +
      'display:flex;align-items:center;justify-content:center;font:14px sans-serif;';
    overlay.innerHTML = `
      <style>
        #tm-sig-dialog button {
          all: unset;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 0 12px;
          border: none;
          border-radius: 4px;
          background: #e9e9ed;
          color: #15141a;
          font: 13px system-ui, -apple-system, "Segoe UI", sans-serif;
          cursor: pointer;
          user-select: none;
          transition: background-color .1s;
        }
        #tm-sig-dialog button:hover  { background: #d0d0d7; }
        #tm-sig-dialog button:active { background: #b1b1b9; }
        #tm-sig-dialog button:focus-visible { outline: 2px solid #0061e0; outline-offset: 2px; }
        #tm-sig-dialog button.tm-primary { background: #0061e0; color: #fff; }
        #tm-sig-dialog button.tm-primary:hover  { background: #0250bb; }
        #tm-sig-dialog button.tm-primary:active { background: #053e94; }
        #tm-sig-dialog button.tm-danger { background: transparent; color: #c50042; }
        #tm-sig-dialog button.tm-danger:hover  { background: #fde8ee; }
        #tm-sig-dialog button.tm-danger:active { background: #f9c9d6; }
        #tm-sig-dialog button.tm-quiet { background: transparent; }
        #tm-sig-dialog button.tm-quiet:hover  { background: #e9e9ed; }
        #tm-sig-dialog button.tm-small { min-height: 24px; padding: 0 10px; font-size: 12px; }
        #tm-sig-dialog button.tm-icon { width: 28px; padding: 0; font-size: 14px; }
      </style>
      <div style="background:#fff;color:#000;padding:18px 20px;border-radius:6px;width:560px;max-height:90vh;overflow:auto;box-shadow:0 4px 20px rgba(0,0,0,.3)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="font-weight:bold;font-size:16px">Prescription signatures</div>
          <button id="tm-sig-close" class="tm-quiet tm-icon" type="button" title="Close">✕</button>
        </div>
        <div id="tm-sig-current" style="color:#555;font-size:12px;margin-bottom:10px"></div>

        <div style="font-weight:bold;margin-bottom:6px">Stored signatures</div>
        <div id="tm-sig-list" style="margin-bottom:14px"></div>

        <div id="tm-sig-form-title" style="font-weight:bold;margin-bottom:6px;border-top:1px solid #ddd;padding-top:12px">Add a signature</div>
        <label style="display:block;margin-bottom:8px">Provider number<br>
          <input id="tm-sig-no" type="text" style="width:100%;box-sizing:border-box;padding:4px"></label>
        <label style="display:block;margin-bottom:8px">Name to show (e.g. Dr. Smith)<br>
          <input id="tm-sig-label" type="text" style="width:100%;box-sizing:border-box;padding:4px"></label>
        <div style="margin-bottom:4px">Draw the signature below</div>
        <canvas id="tm-sig-pad" width="500" height="100"
          style="display:block;width:500px;height:100px;border:1px solid #888;border-radius:3px;background:#fff;cursor:crosshair;touch-action:none"></canvas>
        <div style="text-align:right;margin:4px 0 8px">
          <button id="tm-sig-pad-clear" class="tm-small" type="button">Clear drawing</button>
        </div>
        <div id="tm-sig-msg" style="min-height:18px;margin-bottom:8px"></div>
        <div style="text-align:right">
          <button id="tm-sig-clear" type="button" style="margin-right:6px">Clear form</button>
          <button id="tm-sig-save" class="tm-primary" type="button">Save signature</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const $ = id => overlay.querySelector('#' + id);

    // ----- drawing pad -----
    const pad = $('tm-sig-pad');
    const pctx = pad.getContext('2d');
    let padDirty = false;
    let drawing = false;
    let last = null;

    const padPoint = e => {
      const r = pad.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (pad.width / r.width),
        y: (e.clientY - r.top) * (pad.height / r.height)
      };
    };
    const styleStroke = () => {
      pctx.strokeStyle = '#000';
      pctx.fillStyle = '#000';
      pctx.lineWidth = 2.5;
      pctx.lineCap = 'round';
      pctx.lineJoin = 'round';
    };
    const clearPad = () => {
      pctx.clearRect(0, 0, pad.width, pad.height);
      padDirty = false;
    };
    const loadIntoPad = src => {
      clearPad();
      if (!src) return;
      const im = new Image();
      im.onload = () => {
        const sc = Math.min(pad.width / im.width, pad.height / im.height, 1);
        const w = im.width * sc, h = im.height * sc;
        pctx.drawImage(im, (pad.width - w) / 2, (pad.height - h) / 2, w, h);
        padDirty = true;
      };
      im.src = src;
    };

    pad.addEventListener('pointerdown', e => {
      e.preventDefault();
      pad.setPointerCapture(e.pointerId);
      drawing = true;
      last = padPoint(e);
      styleStroke();
      pctx.beginPath();
      pctx.arc(last.x, last.y, pctx.lineWidth / 2, 0, Math.PI * 2);
      pctx.fill();
      padDirty = true;
    });
    pad.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = padPoint(e);
      styleStroke();
      pctx.beginPath();
      pctx.moveTo(last.x, last.y);
      // smooth with a midpoint curve
      const mx = (last.x + p.x) / 2, my = (last.y + p.y) / 2;
      pctx.quadraticCurveTo(last.x, last.y, mx, my);
      pctx.lineTo(p.x, p.y);
      pctx.stroke();
      last = p;
    });
    const endStroke = () => { drawing = false; last = null; };
    pad.addEventListener('pointerup', endStroke);
    pad.addEventListener('pointercancel', endStroke);
    pad.addEventListener('lostpointercapture', endStroke);

    $('tm-sig-pad-clear').onclick = () => clearPad();

    const msg = (text, isError) => {
      $('tm-sig-msg').textContent = text;
      $('tm-sig-msg').style.color = isError ? '#b3261e' : '#2e7d32';
    };

    const resetForm = (no) => {
      $('tm-sig-form-title').textContent = 'Add a signature';
      $('tm-sig-no').value = no || '';
      $('tm-sig-label').value = '';
      clearPad();
    };

    const renderList = () => {
      const cur = GM_getValue(CURRENT_KEY, null);
      $('tm-sig-current').textContent = 'Current prescriber: ' + (cur ? '#' + cur : 'not detected yet');

      const list = $('tm-sig-list');
      list.textContent = '';
      const keys = GM_listValues().filter(k => k.startsWith('sig_')).sort();
      if (!keys.length) {
        list.textContent = 'None yet — add one below.';
        list.style.color = '#555';
        return;
      }
      list.style.color = '';
      keys.forEach(k => {
        const no = k.slice(4);
        const sig = GM_getValue(k) || {};
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #eee';

        const img = document.createElement('img');
        img.src = sig.dataUrl || '';
        img.style.cssText = 'width:110px;height:36px;object-fit:contain;border:1px solid #ddd;background:#fff';

        const text = document.createElement('div');
        text.style.cssText = 'flex:1;min-width:0';
        text.textContent = (sig.label || 'Provider ' + no) + '  (#' + no + ')';
        if (no === cur) text.style.fontWeight = 'bold';

        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.className = 'tm-small';
        edit.onclick = () => {
          $('tm-sig-form-title').textContent = 'Edit signature for #' + no;
          $('tm-sig-no').value = no;
          $('tm-sig-label').value = sig.label || '';
          loadIntoPad(sig.dataUrl);
          msg('Change the name or clear and redraw the signature, then Save.', false);
        };

        const del = document.createElement('button');
        del.type = 'button';
        del.textContent = 'Remove';
        del.className = 'tm-small tm-danger';
        del.onclick = () => {
          if (!confirm('Remove the signature for ' + (sig.label || '#' + no) + '?')) return;
          GM_deleteValue(k);
          renderList();
          msg('Removed signature for #' + no + '.', false);
        };

        row.append(img, text, edit, del);
        list.appendChild(row);
      });
    };

    $('tm-sig-save').onclick = () => {
      const no = $('tm-sig-no').value.trim();
      const label = $('tm-sig-label').value.trim() || ('Provider ' + no);
      if (!no) { msg('Enter the provider number.', true); return; }
      if (!padDirty) { msg('Draw the signature in the box first.', true); return; }
      const dataUrl = pad.toDataURL('image/png'); // transparent background
      GM_setValue(SIG_KEY(no), { label, dataUrl });
      renderList();
      resetForm();
      msg('Saved signature for ' + label + ' (#' + no + ').', false);
    };

    $('tm-sig-clear').onclick = () => { resetForm(); msg('', false); };
    $('tm-sig-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    resetForm(getProviderNo());
    renderList();
  }

  // "Signatures" button, fixed to the top-right of the Medications window.
  if (window === window.top && /\/oscarRx\//i.test(location.pathname)) {
    const link = document.createElement('button');
    link.type = 'button';
    link.textContent = 'Signatures';
    link.title = 'Manage prescription signatures';
    link.style.cssText = 'position:fixed;top:8px;right:8px;z-index:99998;border:none;border-radius:4px;' +
      'padding:4px 10px;background:#e9e9ed;color:#15141a;font:12px system-ui,sans-serif;cursor:pointer;';
    link.onclick = openSignatureManager;
    document.body.appendChild(link);
  }

  // ---------- 3. stamping ----------
  function canvasIsBlank(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 4; i < d.length; i += 4) {
        if (d[i] !== d[0] || d[i + 1] !== d[1] || d[i + 2] !== d[2] || d[i + 3] !== d[3]) return false;
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function fire(target, type, x, y) {
    // No `view` member: in Firefox the userscript sandbox's window isn't accepted there.
    const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: type.endsWith('up') ? 0 : 1 };
    try { target.dispatchEvent(new PointerEvent(type.replace('mouse', 'pointer'), { ...opts, pointerType: 'pen', isPrimary: true })); } catch (e) {}
    try { target.dispatchEvent(new MouseEvent(type, opts)); } catch (e) { console.warn('Signature: could not simulate', type, e); }
  }

  function toast(msg, isError) {
    if (!SHOW_TOAST) return;
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;top:8px;right:8px;z-index:99999;padding:6px 10px;border-radius:4px;' +
      'font:13px sans-serif;color:#fff;background:' + (isError ? '#b3261e' : '#2e7d32');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  async function stamp(canvas, { force = false } = {}) {
    const providerNo = getProviderNo();
    if (!providerNo) { toast('Signature: could not tell who the prescriber is.', true); return; }

    const sig = GM_getValue(SIG_KEY(providerNo), null);
    if (!sig) { toast('No signature stored for provider #' + providerNo + '.', true); return; }

    if (!force && !canvasIsBlank(canvas)) return; // never overwrite a hand-drawn signature

    const img = await loadImage(sig.dataUrl);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + 2, y = rect.bottom - 2;

    const W = canvas.width, H = canvas.height;
    const scale = Math.min((W - 2 * PADDING) / img.width, (H - 2 * PADDING) / img.height);
    const w = img.width * scale, h = img.height * scale;
    const drawSignature = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, PADDING, (H - h) / 2, w, h);
      ctx.restore();
    };

    // A short simulated stroke tells Oscar's pad the box has been signed.
    fire(canvas, 'mousedown', x, y);
    fire(canvas, 'mouseup', x, y);

    // Redraw afterwards so the dot the pad leaves at the stroke point is wiped.
    drawSignature();

    if (AUTO_SAVE) {
      await new Promise(r => setTimeout(r, 150));
      drawSignature(); // in case the pad drew anything late
      const saveBtn = canvas.ownerDocument.getElementById('save');
      if (saveBtn) {
        saveBtn.click(); // works even though the button is hidden
        toast('Signed and saved as ' + sig.label + ' (#' + providerNo + ')');
      } else {
        toast('Signed as ' + sig.label + ', but the Save button was not found.', true);
      }
    } else {
      toast('Signed as ' + sig.label + ' (#' + providerNo + ')');
    }
  }

  function addButton(canvas) {
    if (canvas.dataset.tmSigButton) return;
    canvas.dataset.tmSigButton = '1';
    // Small button floated over the top-right corner of the canvas so it doesn't
    // push or cover any of Oscar's own buttons.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Stamp';
    btn.title = 'Stamp the prescriber\'s saved signature';
    btn.style.cssText = 'position:absolute;z-index:1000;display:flex;align-items:center;justify-content:center;' +
      'box-sizing:border-box;height:24px;min-width:56px;padding:0 8px;font-size:11px;line-height:1;' +
      'text-align:center;opacity:.75;cursor:pointer;';
    document.body.appendChild(btn);

    const place = () => {
      const r = canvas.getBoundingClientRect();
      btn.style.left = (r.right + window.scrollX - btn.offsetWidth - 2) + 'px';
      btn.style.top = (r.top + window.scrollY + 2) + 'px';
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    setInterval(place, 1000); // the lightwindow can shift after load

    // Keep clicks on the button from also drawing on the canvas underneath.
    ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart'].forEach(t =>
      btn.addEventListener(t, e => e.stopPropagation()));
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      stamp(canvas, { force: true }).catch(err => toast('Signature failed: ' + err.message, true));
    });
  }

  function handle(canvas) {
    if (canvas.dataset.tmSigHandled) return;
    canvas.dataset.tmSigHandled = '1';
    addButton(canvas);
    if (AUTO_APPLY) {
      setTimeout(() => {
        stamp(canvas).catch(err => toast('Signature failed: ' + err.message, true));
      }, 400); // let the page's pad initialise first
    }
  }

  // Watch for the signature box only until it appears, then stop watching.
  const observer = new MutationObserver(scan);
  function scan() {
    const c = document.getElementById('canvas');
    if (c && c.tagName === 'CANVAS') {
      observer.disconnect();
      handle(c);
    }
  }

  scan();
  if (!document.getElementById('canvas')) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
