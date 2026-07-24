/* AI Workshop — origami waypoint presentation engine.
 * Descended from the BNI presenter (scroll-world waypoint variant): blob-loaded
 * video chain, rAF-tweened currentTime, crossfaded seams, stills as posters and
 * fallback, clicker/keys/tap input. Additions for this build: bilingual copy
 * (mr default / en via L key or ?lang=en), portal panels for silent screen
 * demos + the welcome film, per-waypoint accent theming, presenter mode (P)
 * with speaker cues, QR finale card. Config lives in deck.js (window.DECK). */
(function () {
  'use strict';

  var LEGS = DECK.legs;
  var STILLS = DECK.stills;
  var WP = DECK.wp;

  var TWEEN_PER_LEG = 2.4;   // seconds of real time to traverse one full leg
  var WARN_SECONDS = 3000;   // presenter clock turns red at 50 min

  // ---------- state ----------
  var lang = /[?&]lang=en/.test(location.search) ? 'en' : 'mr';
  var current = 0;
  var videosReady = false;
  var vids = [];
  var animating = false;
  var startedAt = null;

  // ---------- dom ----------
  var root = document.getElementById('stage');
  var layerStills = document.createElement('div'); layerStills.className = 'layer';
  var layerVideo = document.createElement('div'); layerVideo.className = 'layer';
  var copyEl = document.createElement('div'); copyEl.className = 'copy';
  var portal = document.createElement('div'); portal.className = 'portal';
  portal.innerHTML = '<video muted playsinline preload="auto"></video>' +
    '<div class="pcap"></div><button class="replay" title="replay">&#8635;</button>';
  var rail = document.createElement('div'); rail.className = 'rail';
  var clock = document.createElement('div'); clock.className = 'clock'; clock.textContent = '0:00';
  var cue = document.createElement('div'); cue.className = 'cue';
  var wpnum = document.createElement('div'); wpnum.className = 'wpnum';
  var help = document.createElement('div'); help.className = 'help';
  var langBtn = document.createElement('button'); langBtn.className = 'lang';
  root.appendChild(layerStills); root.appendChild(layerVideo); root.appendChild(copyEl);
  root.appendChild(portal); root.appendChild(rail); root.appendChild(clock);
  root.appendChild(cue); root.appendChild(wpnum); root.appendChild(help);
  root.appendChild(langBtn);

  var pvid = portal.querySelector('video');
  var pcap = portal.querySelector('.pcap');
  var replayBtn = portal.querySelector('.replay');

  var HELP = {
    mr: 'पुढे: क्लिक / space / बाण. मागे: PageUp. F fullscreen · L English · H लपवा',
    en: 'Advance: click / space / arrows. Back: PageUp. F fullscreen · L मराठी · H hide'
  };
  var HELP_TOUCH = {
    mr: 'पुढे जाण्यासाठी टॅप करा. मागे: उजवीकडे swipe.',
    en: 'Tap to advance. Swipe right to go back.'
  };

  // stills layer (posters + fallback)
  var stillEls = STILLS.map(function (s, i) {
    var im = document.createElement('img');
    im.src = s; im.className = 'still'; im.style.opacity = i === 0 ? 1 : 0;
    layerStills.appendChild(im);
    return im;
  });

  // rail dots
  var dots = WP.map(function (_, i) {
    var d = document.createElement('span'); d.className = 'dot' + (i === 0 ? ' on' : '');
    rail.appendChild(d); return d;
  });

  // ---------- video loading (blob for guaranteed seekability) ----------
  function loadVideos() {
    var loaded = 0, failed = false;
    LEGS.forEach(function (src, i) {
      fetch(src).then(function (r) {
        if (!r.ok) throw new Error('missing');
        return r.blob();
      }).then(function (b) {
        var v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'auto';
        v.src = URL.createObjectURL(b);
        v.className = 'leg'; v.style.opacity = 0;
        layerVideo.appendChild(v); vids[i] = v;
        loaded++;
        if (loaded === LEGS.length && !failed) {
          videosReady = true;
          syncToWaypoint(current, true);
        }
      }).catch(function () { failed = true; /* stills-only mode still presents */ });
    });
  }

  // ---------- rendering ----------
  function showStill(idx) {
    stillEls.forEach(function (el, i) { el.style.opacity = i === idx ? 1 : 0; });
  }
  function setChain(pos) {
    if (!videosReady) return;
    vids.forEach(function (v, i) {
      if (!v) return;
      if (i === pos.leg) {
        v.style.opacity = 1;
        var d = v.duration && isFinite(v.duration) ? v.duration : 5;
        try { v.currentTime = Math.max(0, Math.min(d - 0.033, pos.t * d)); } catch (e) {}
      } else {
        v.style.opacity = 0;
      }
    });
  }

  function setAccent(hex) {
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-deep', hex);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderCopy(i, instant) {
    var w = WP[i], t = w[lang];
    var html = '<div class="chip">' + esc(t.chip) + '</div><h1>' + esc(t.head) + '</h1>';
    if (t.sub) html += '<p>' + esc(t.sub) + '</p>';
    if (t.receipt) {
      html += '<div class="receipt">' + t.receipt.map(function (r, k) {
        return '<div class="r' + (k === t.receipt.length - 1 ? ' gold' : '') + '">' + esc(r) + '</div>';
      }).join('') + '</div>';
    }
    if (w.qr) {
      html += '<div class="qrcard"><img src="assets/qr.png" alt="QR">' +
        '<div><div class="q1">' + (lang === 'mr' ? 'हा प्रवास सोबत न्या' : 'Take this journey home') + '</div>' +
        '<div class="q2">' + (lang === 'mr' ? 'QR स्कॅन करा किंवा भेट द्या' : 'Scan the QR or visit') + '</div>' +
        '<div class="q3">ai.jarvisdaily.com</div></div></div>';
    }
    if (t.byline) html += '<p class="byline">' + esc(t.byline) + '</p>';
    copyEl.classList.remove('in');
    setTimeout(function () { copyEl.innerHTML = html; copyEl.classList.add('in'); }, instant ? 0 : 260);
    dots.forEach(function (d, k) { d.className = 'dot' + (k === i ? ' on' : k < i ? ' done' : ''); });
    setAccent(w.accent || '#D97B29');
    cue.textContent = t.cue || '';
    wpnum.textContent = (i + 1) + ' / ' + WP.length;

    // portal (demo film / welcome film)
    if (w.portal) {
      if (pvid.getAttribute('src') !== w.portal.src) {
        pvid.setAttribute('src', w.portal.src);
        pvid.load();
      }
      portal.classList.toggle('big', !!w.portal.big);
      portal.style.pointerEvents = 'auto';
      pcap.textContent = t.pcap || '';
      portal.classList.add('show');
      pvid.muted = !w.portal.sound;
      try { pvid.currentTime = 0; var p = pvid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    } else {
      portal.classList.remove('show');
      portal.style.pointerEvents = 'none';
      try { pvid.pause(); } catch (e) {}
    }
  }

  replayBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var w = WP[current];
    if (!w.portal) return;
    pvid.muted = !w.portal.sound;
    try { pvid.currentTime = 0; pvid.play(); } catch (err) {}
  });
  // tapping the portal toggles sound on films that carry audio
  portal.addEventListener('click', function (e) {
    e.stopPropagation();
    var w = WP[current];
    if (!w.portal || !w.portal.sound) return;
    pvid.muted = !pvid.muted;
    if (pvid.paused) { try { pvid.play(); } catch (err) {} }
  });

  // linear position on the chain for tween math
  function flat(pos) { return pos.leg + pos.t; }
  function unflat(x) {
    // at exact integer boundaries prefer the END of the previous leg (the frame
    // that matches the approved still) over the start of the next
    if (x > 0 && Math.abs(x - Math.round(x)) < 1e-6) return { leg: Math.round(x) - 1, t: 1 };
    var leg = Math.min(LEGS.length - 1, Math.floor(x));
    return { leg: leg, t: Math.max(0, Math.min(1, x - leg)) };
  }
  function ease(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  function syncToWaypoint(i, instant) {
    showStill(WP[i].scene);
    setChain(WP[i].pos);
    renderCopy(i, instant);
  }

  function go(i) {
    if (animating) return;
    i = Math.max(0, Math.min(WP.length - 1, i));
    if (i === current) return;
    if (!startedAt && i > 0) startedAt = Date.now();
    if (i > 0) help.classList.add('hide');
    var from = flat(WP[current].pos), to = flat(WP[i].pos);
    current = i;
    if (!videosReady || from === to) {
      syncToWaypoint(i, false);
      return;
    }
    animating = true;
    renderCopy(i, false);
    var dist = Math.abs(to - from);
    var durMs = Math.max(1000, Math.min(3200, dist * TWEEN_PER_LEG * 1000));
    var t0 = performance.now();
    function step(now) {
      var u = Math.min(1, (now - t0) / durMs);
      var x = from + (to - from) * ease(u);
      setChain(unflat(x));
      if (u < 1) { requestAnimationFrame(step); }
      else { animating = false; showStill(WP[i].scene); }
    }
    requestAnimationFrame(step);
  }

  // ---------- language ----------
  function setLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    langBtn.textContent = lang === 'mr' ? 'English' : 'मराठी';
    help.innerHTML = ('ontouchstart' in window) ? HELP_TOUCH[lang] : HELP[lang];
    renderCopy(current, true);
  }
  langBtn.addEventListener('click', function (e) { e.stopPropagation(); setLang(lang === 'mr' ? 'en' : 'mr'); });

  // ---------- input ----------
  function next() { go(current + 1); }
  function prev() { go(current - 1); }
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { go(0); }
    else if (k === 'End') { go(WP.length - 1); }
    else if (k >= '1' && k <= '9' && !e.shiftKey) { go(parseInt(k, 10) - 1); }
    else if (k === '0') { go(9); }
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { document.documentElement.requestFullscreen(); }
    }
    else if (k === 'h' || k === 'H') { help.classList.toggle('hide'); }
    else if (k === 'l' || k === 'L') { setLang(lang === 'mr' ? 'en' : 'mr'); }
    else if (k === 'p' || k === 'P') { document.body.classList.toggle('presenting'); }
  });
  root.addEventListener('click', function () {
    if (swiped) { swiped = false; return; }
    next();
  });

  // touch: tap = advance, swipe right = back, swipe left = advance
  var touchX = null, touchY = null, swiped = false;
  root.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; swiped = false;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      if (dx > 0) prev(); else next();
    }
  }, { passive: true });

  // presenter clock
  setInterval(function () {
    if (!startedAt) return;
    var s = Math.floor((Date.now() - startedAt) / 1000);
    clock.textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    clock.classList.toggle('over', s > WARN_SECONDS);
  }, 1000);

  // boot
  setLang(lang);
  renderCopy(0, true);
  loadVideos();
})();
