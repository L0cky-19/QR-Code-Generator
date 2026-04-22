/* ============================================================
   QR//GEN — main script
   100% client-side QR generation + export
   ============================================================ */

(function () {
  'use strict';

  const textEl      = document.getElementById('text');
  const sizeEl      = document.getElementById('size');
  const sizeVal     = document.getElementById('sizeVal');
  const eclEl       = document.getElementById('ecl');
  const fgEl        = document.getElementById('fg');
  const bgEl        = document.getElementById('bg');
  const fgHex       = document.getElementById('fgHex');
  const bgHex       = document.getElementById('bgHex');
  const qrContainer = document.getElementById('qrcode');
  const metaSize    = document.getElementById('metaSize');
  const metaEcl     = document.getElementById('metaEcl');
  const metaLen     = document.getElementById('metaLen');
  const clockEl     = document.getElementById('clock');

  const btnPng  = document.getElementById('downloadPng');
  const btnSvg  = document.getElementById('downloadSvg');
  const btnCopy = document.getElementById('copyImg');

  const eclMap = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H
  };

  let qr = null;

  /* ---------- Render ---------- */
  function render() {
    const txt  = textEl.value.trim();
    const size = parseInt(sizeEl.value, 10);

    sizeVal.textContent  = `${size} × ${size}`;
    metaSize.textContent = `${size}px`;
    metaEcl.textContent  = eclEl.value;
    metaLen.textContent  = txt.length;
    fgHex.textContent    = fgEl.value.toUpperCase();
    bgHex.textContent    = bgEl.value.toUpperCase();
    fgEl.parentElement.style.background = fgEl.value;
    bgEl.parentElement.style.background = bgEl.value;

    qrContainer.innerHTML = '';

    if (!txt) {
      qrContainer.innerHTML =
        '<div class="empty">tape quelque chose à gauche<br><strong>→ ça apparaît ici</strong></div>';
      qr = null;
      setButtonsEnabled(false);
      return;
    }

    try {
      qr = new QRCode(qrContainer, {
        text: txt,
        width: size,
        height: size,
        colorDark: fgEl.value,
        colorLight: bgEl.value,
        correctLevel: eclMap[eclEl.value]
      });
      setButtonsEnabled(true);
    } catch (e) {
      qrContainer.innerHTML =
        '<div class="empty" style="color:var(--danger)">contenu trop long<br><strong>→ baisse la correction d\'erreur</strong></div>';
      qr = null;
      setButtonsEnabled(false);
    }
  }

  function setButtonsEnabled(enabled) {
    [btnPng, btnSvg, btnCopy].forEach(b => { b.disabled = !enabled; });
  }

  /* ---------- Debounced text input ---------- */
  let t;
  textEl.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(render, 120);
  });
  [sizeEl, eclEl, fgEl, bgEl].forEach(el => el.addEventListener('input', render));

  /* ---------- Presets ---------- */
  const templates = {
    url:   'https://example.com',
    email: 'mailto:hello@example.com?subject=Salut&body=...',
    tel:   'tel:+33600000000',
    wifi:  'WIFI:T:WPA;S:NomDuReseau;P:motDePasse;;',
    sms:   'SMSTO:+33600000000:Salut !',
    geo:   'geo:43.7384,7.4246?q=Monaco'
  };
  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      textEl.value = templates[btn.dataset.preset] || '';
      render();
      textEl.focus();
    });
  });

  /* ---------- Helpers ---------- */
  function getRenderedImage() {
    return qrContainer.querySelector('img') || qrContainer.querySelector('canvas');
  }

  function waitForImage(img) {
    return new Promise((resolve, reject) => {
      if (img.tagName !== 'IMG' || img.complete) return resolve();
      img.onload  = () => resolve();
      img.onerror = () => reject(new Error('image load failed'));
    });
  }

  async function renderCanvas(size) {
    const img = getRenderedImage();
    if (!img) return null;
    await waitForImage(img);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgEl.value;
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    return canvas;
  }

  function flashButton(btn, label, ms = 1200) {
    const original = btn.innerHTML;
    btn.innerHTML = label;
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, ms);
  }

  function timestamp() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  /* ---------- Build vector SVG from QR matrix ---------- */
  function buildVectorSvg(size) {
    if (!qr || !qr._oQRCode) return null;
    const modules = qr._oQRCode.modules;
    if (!modules || !modules.length) return null;

    const count = modules.length;
    const cell  = size / count;
    const fg    = fgEl.value;
    const bg    = bgEl.value;

    let rects = '';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) {
          rects += `<rect x="${(c * cell).toFixed(3)}" y="${(r * cell).toFixed(3)}" width="${cell.toFixed(3)}" height="${cell.toFixed(3)}"/>`;
        }
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <g fill="${fg}">${rects}</g>
</svg>`;
  }

  /* ---------- Download PNG ---------- */
  btnPng.addEventListener('click', async () => {
    const size = parseInt(sizeEl.value, 10);
    const canvas = await renderCanvas(size);
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode_${timestamp()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  /* ---------- Download SVG (true vector) ---------- */
  btnSvg.addEventListener('click', () => {
    const size = parseInt(sizeEl.value, 10);
    const svg = buildVectorSvg(size);
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode_${timestamp()}.svg`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ---------- Copy to clipboard ---------- */
  btnCopy.addEventListener('click', async () => {
    try {
      const size = parseInt(sizeEl.value, 10);
      const canvas = await renderCanvas(size);
      if (!canvas) return;

      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('clipboard unsupported');
      }

      await new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error('blob failed'));
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            resolve();
          } catch (err) {
            reject(err);
          }
        }, 'image/png');
      });

      flashButton(btnCopy, '✓ Copied');
    } catch (e) {
      console.error(e);
      flashButton(btnCopy, '✗ Failed', 1600);
    }
  });

  /* ---------- Clock ---------- */
  function tick() {
    const d = new Date();
    clockEl.textContent = d.toTimeString().slice(0, 8);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Initial render ---------- */
  render();
})();
