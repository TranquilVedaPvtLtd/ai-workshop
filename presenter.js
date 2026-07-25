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
  var PLAY_PER_LEG = 1.9;    // ditto for the play-through path (phones) - a touch snappier
  var LEG_SECONDS = 5.04;    // nominal leg duration, used before metadata lands
  var WARN_SECONDS = 3000;   // presenter clock turns red at 50 min

  // ---------- state ----------
  var lang = /[?&]lang=en/.test(location.search) ? 'en' : 'mr';
  var current = 0;
  var vids = [];
  var animating = false;
  var startedAt = null;
  var rafId = null;          // desktop scrub tween
  var playRaf = null;        // play-through segment watcher
  var playVid = null;        // leg currently playing (phones)

  // A phone pays for every byte and stalls on parallel video fetches: the desktop
  // path pulls ~32 MB of legs in 13 concurrent requests plus a 21 MB welcome film,
  // which saturates a 4G link for around a minute and leaves the deck looking
  // frozen. The stills ARE the approved frames of those same legs, and go()
  // already falls back to an instant still swap, so small screens present
  // stills-first and let the motion arrive behind them.
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  var SAVE_DATA = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
  var LIGHT = SAVE_DATA || window.matchMedia('(max-width: 820px)').matches;
  var TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  // Every leg is encoded as ONE keyframe followed by 120 predicted frames, so a
  // rAF-driven currentTime scrub asks a phone to re-decode from frame 0 on every
  // single tick - the origami simply never moves. Playing the leg is the exact
  // opposite: forward sequential decode, which is what the hardware is for. So
  // touch/small screens PLAY the leg (at a compressed rate to match the desktop
  // tween's pace) and show the approved still at rest; the presenter's laptop
  // keeps the proven scrub path.
  var PLAYBACK = LIGHT || TOUCH;

  // ---------- dom ----------
  var root = document.getElementById('stage');
  var layerStills = document.createElement('div'); layerStills.className = 'layer';
  var layerVideo = document.createElement('div'); layerVideo.className = 'layer';
  var copyEl = document.createElement('div'); copyEl.className = 'copy';
  var portal = document.createElement('div'); portal.className = 'portal';
  // preload=none on small screens: the welcome film is 21 MB and would otherwise
  // download before anything else can. The poster stands in until it is tapped.
  portal.innerHTML = '<video muted playsinline preload="' + (LIGHT ? 'none' : 'auto') + '" ' +
    'poster="assets/demos/welcome-poster.jpg"></video>' +
    '<div class="pcap"></div><button class="replay" title="replay">&#8635;</button>';
  // reels for the social-media waypoint - hidden until summoned by their key,
  // so the origami scene (which is itself the proof) is never covered
  var reels = document.createElement('div'); reels.className = 'reels';
  var reelkeys = document.createElement('div'); reelkeys.className = 'reelkeys';
  var rail = document.createElement('div'); rail.className = 'rail';
  var clock = document.createElement('div'); clock.className = 'clock'; clock.textContent = '0:00';
  var cue = document.createElement('div'); cue.className = 'cue';
  var wpnum = document.createElement('div'); wpnum.className = 'wpnum';
  var help = document.createElement('div'); help.className = 'help';
  var langBtn = document.createElement('button'); langBtn.className = 'lang';

  // Navigation affordance. Nobody arriving at a shared link knows a bare image is
  // a 13-step deck, so the arrow is both the instruction and the control.
  var nav = document.createElement('div'); nav.className = 'nav at-start';
  nav.innerHTML =
    '<button class="nb back" type="button" aria-label="back">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<button class="nb next" type="button"><span class="nlab"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>';
  // one-time coach line, touch only
  var coach = document.createElement('div'); coach.className = 'coach';
  coach.innerHTML = '<svg viewBox="0 0 24 14" aria-hidden="true">' +
    '<path d="M22 7H3M8 2L3 7l5 5"/></svg><span class="clab"></span>';

  root.appendChild(layerStills); root.appendChild(layerVideo); root.appendChild(copyEl);
  root.appendChild(portal); root.appendChild(reels); root.appendChild(reelkeys);
  root.appendChild(rail); root.appendChild(clock);
  root.appendChild(cue); root.appendChild(wpnum); root.appendChild(help);
  root.appendChild(nav); root.appendChild(coach); root.appendChild(langBtn);

  var navBack = nav.querySelector('.back');
  var navNext = nav.querySelector('.next');
  var navLabel = nav.querySelector('.nlab');
  var coachLabel = coach.querySelector('.clab');

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
  var NEXT_LABEL = { mr: 'पुढे', en: 'Next' };
  var COACH_LABEL = {
    mr: 'स्वाइप करा किंवा बाणावर टॅप करा',
    en: 'Swipe, or tap the arrow'
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
  function attachLeg(i, blob) {
    var v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.src = URL.createObjectURL(blob);
    v.className = 'leg'; v.style.opacity = 0;
    layerVideo.appendChild(v); vids[i] = v;
    // In PLAYBACK mode legs are only ever visible mid-transition, so a leg landing
    // under our feet needs no repaint (and must not re-run the copy animation).
    if (!PLAYBACK && WP[current].pos.leg === i) syncToWaypoint(current, true);
  }
  function fetchLeg(i) {
    return fetch(LEGS[i]).then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.blob();
    }).then(function (b) {
      attachLeg(i, b);
    }).catch(function () { /* stills-only mode still presents */ });
  }

  // Which legs a hop between two chain positions actually traverses.
  function legsBetween(from, to) {
    var a = unflat(Math.min(from, to)).leg, b = unflat(Math.max(from, to)).leg, out = [];
    for (var i = a; i <= b; i++) out.push(i);
    return out;
  }
  // The old gate was "all 13 legs present", which on a phone loading serially is
  // never true while anyone is actually watching - so every hop fell through to a
  // hard still cut. A hop only ever needs ITS OWN legs.
  function chainReady(from, to) {
    return legsBetween(from, to).every(function (i) { return !!vids[i]; });
  }

  var pending = null, fetching = false;
  // Fetch order follows the viewer, not the boot-time position: the leg the very
  // next hop will play is always the one being downloaded.
  function pumpLoad() {
    if (!pending || fetching || !pending.length) return;
    var want = [], k;
    for (k = current; k < WP.length; k++) want.push(WP[k].pos.leg);
    for (k = current - 1; k >= 0; k--) want.push(WP[k].pos.leg);
    var pick = -1;
    for (k = 0; k < want.length && pick < 0; k++) {
      if (pending.indexOf(want[k]) >= 0) pick = want[k];
    }
    if (pick < 0) pick = pending[0];
    pending.splice(pending.indexOf(pick), 1);
    fetching = true;
    fetchLeg(pick).then(function () { fetching = false; pumpLoad(); });
  }
  function loadVideos() {
    // Save-Data or 2G: never spend 31 MB of someone's plan on decoration.
    if (SAVE_DATA) return;
    if (!LIGHT) { LEGS.forEach(function (_, i) { fetchLeg(i); }); return; }
    // Phones: one leg at a time, so stills and copy are never queued behind a
    // dozen video downloads.
    pending = LEGS.map(function (_, i) { return i; });
    pumpLoad();
  }

  // ---------- rendering ----------
  function showStill(idx) {
    stillEls.forEach(function (el, i) { el.style.opacity = i === idx ? 1 : 0; });
  }
  function setChain(pos) {
    // No readiness gate: legs arrive one at a time on phones, and any that is
    // present should be positioned. Missing ones are skipped and the still shows.
    vids.forEach(function (v, i) {
      if (!v) return;
      if (i === pos.leg) {
        v.classList.remove('soft');
        v.style.opacity = 1;
        var d = v.duration && isFinite(v.duration) ? v.duration : LEG_SECONDS;
        try { v.currentTime = Math.max(0, Math.min(d - 0.033, pos.t * d)); } catch (e) {}
      } else {
        v.style.opacity = 0;
      }
    });
  }
  // PLAYBACK at rest: no video on screen at all, just the approved still. This is
  // what keeps a phone off the seek path entirely - the still IS the leg's final
  // frame, so the handover is invisible. `.soft` matches the still's own fade so
  // the crossfade has no dip through the cream background.
  function restChain() {
    vids.forEach(function (v) {
      if (!v) return;
      v.classList.add('soft');
      v.style.opacity = 0;
      try { v.pause(); } catch (e) {}
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
        '<div class="q3">jarvisdaily.com/workshop</div></div></div>';
    }
    if (t.byline) html += '<p class="byline">' + esc(t.byline) + '</p>';
    copyEl.classList.remove('in');
    setTimeout(function () { copyEl.innerHTML = html; copyEl.classList.add('in'); }, instant ? 0 : 260);
    dots.forEach(function (d, k) { d.className = 'dot' + (k === i ? ' on' : k < i ? ' done' : ''); });
    setAccent(w.accent || '#D97B29');
    cue.textContent = t.cue || '';
    renderReels(w);
    wpnum.textContent = (i + 1) + ' / ' + WP.length;

    // portal (demo film / welcome film)
    if (w.portal) {
      // The welcome film is 21 MB and carries sound, so a phone will refuse to
      // autoplay it anyway - fetching it up front only starves the origami legs
      // of the bandwidth they need. Hold it at the poster until it is tapped.
      var deferred = LIGHT && !!w.portal.sound;
      portal.dataset.src = w.portal.src;
      if (!deferred && pvid.getAttribute('src') !== w.portal.src) {
        pvid.setAttribute('src', w.portal.src);
        pvid.load();
      }
      portal.classList.toggle('big', !!w.portal.big);
      portal.style.pointerEvents = 'auto';
      pcap.textContent = t.pcap || '';
      portal.classList.add('show');
      pvid.muted = !w.portal.sound;
      if (deferred) { portal.classList.add('needs-tap'); pendingPlay = true; }
      else playPortal();
    } else {
      portal.classList.remove('show');
      portal.classList.remove('needs-tap');
      portal.style.pointerEvents = 'none';
      pendingPlay = false;
      try { pvid.pause(); } catch (e) {}
    }
  }

  // ---- navigation affordance --------------------------------------------
  function updateNav() {
    nav.classList.toggle('at-start', current === 0);
    nav.classList.toggle('at-end', current === WP.length - 1);
  }
  var coachTimer = null;
  function showCoach() {
    if (!TOUCH) return;
    coach.classList.add('show');
    coachTimer = setTimeout(hideCoach, 8000);
  }
  function hideCoach() {
    if (coachTimer) { clearTimeout(coachTimer); coachTimer = null; }
    coach.classList.remove('show');
  }

  // ---- reels overlay -----------------------------------------------------
  // The origami art on this waypoint IS the argument ("Claude Code made all of
  // this"), so nothing is allowed to sit on top of it by default. A reel is
  // summoned by its own key (Z / X), plays full-height over a dimmed backdrop,
  // and Escape / click returns the slide to its untouched state.
  function reelHint(w) {
    if (!w.reels) return '';
    return w.reels.map(function (r) { return r.key.toUpperCase(); }).join(' / ') + ' — reels';
  }
  function closeReel() {
    var v = reels.querySelector('video');
    if (v) { v.pause(); }
    reels.classList.remove('show');
    setTimeout(function () { if (!reels.classList.contains('show')) reels.innerHTML = ''; }, 420);
  }
  function openReel(r) {
    reels.innerHTML = '<div class="reelback"></div>' +
      '<figure class="reel"><video src="' + r.src + '" playsinline></video>' +
      '<figcaption>' + esc(r.cap || '') + '</figcaption></figure>';
    reels.querySelector('.reelback').addEventListener('click', closeReel);
    var v = reels.querySelector('video');
    v.addEventListener('click', function () { if (v.paused) v.play(); else v.pause(); });
    reels.classList.add('show');
    // a keypress is a user gesture, so sound is allowed here
    v.muted = false;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function renderReels(w) {
    if (!w.reels) { closeReel(); reelkeys.classList.remove('show'); return; }
    reelkeys.textContent = reelHint(w);
    reelkeys.classList.add('show');
  }

  // A film that carries sound cannot autoplay before the page has had a user
  // gesture, so waypoint 0 would otherwise sit on a black frame until someone
  // clicks. Try to play; if the browser refuses, mark the portal so the play
  // affordance shows, and retry on the presenter's very next key or click.
  var pendingPlay = false;
  // The tap that resumes blocked playback must not ALSO reach the portal's
  // mute-toggle below (pointerdown resumes with sound, the same tap's click
  // then toggled muted back on - the "no sound until I tap twice" bug).
  var gestureConsumed = false;
  // Attach the deferred source the moment it is actually wanted.
  function armPortal() {
    var src = portal.dataset.src;
    if (src && pvid.getAttribute('src') !== src) { pvid.setAttribute('src', src); pvid.load(); }
  }
  function playPortal() {
    armPortal();
    try { pvid.currentTime = 0; } catch (e) {}
    var p = pvid.play();
    if (p && p.catch) {
      p.catch(function () {
        portal.classList.add('needs-tap');
        pendingPlay = true;
      });
    }
  }
  function retryPending(e) {
    if (!pendingPlay) return;
    var w = WP[current];
    if (!w || !w.portal) { pendingPlay = false; return; }
    // On a phone the film's source is still deferred, so a stray tap anywhere
    // must not kick off a 21 MB download. Only a tap on the portal itself - the
    // thing wearing the play glyph - starts it.
    var onPortal = !!(e && e.target && portal.contains(e.target));
    if (LIGHT && !onPortal) return;
    pendingPlay = false;
    if (e && e.type === 'pointerdown' && onPortal) {
      gestureConsumed = true;
      setTimeout(function () { gestureConsumed = false; }, 400);
    }
    armPortal();
    var p = pvid.play();
    if (p && p.then) p.then(function () { portal.classList.remove('needs-tap'); },
                            function () { pendingPlay = true; });
  }
  window.addEventListener('keydown', retryPending, true);
  window.addEventListener('pointerdown', retryPending, true);

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
    if (gestureConsumed) { gestureConsumed = false; return; }
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
    if (PLAYBACK) restChain(); else setChain(WP[i].pos);
    renderCopy(i, instant);
  }

  // Any in-flight motion is abandoned the instant a new hop is asked for, so a
  // swipe is never swallowed by a transition that is still running.
  function stopMotion() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (playRaf) { cancelAnimationFrame(playRaf); playRaf = null; }
    if (playVid) { try { playVid.pause(); } catch (e) {} playVid = null; }
    animating = false;
  }

  // ---- play-through (phones) ---------------------------------------------
  // Plays one leg's slice forward at a compressed rate instead of scrubbing it.
  function playSegment(leg, t0, t1, rate, onDone) {
    var v = vids[leg];
    if (!v) { onDone(); return; }
    var d = (v.duration && isFinite(v.duration) && v.duration > 0) ? v.duration : LEG_SECONDS;
    var stopAt = Math.min(d - 0.02, t1 * d);
    v.classList.remove('soft');
    vids.forEach(function (x, i) { if (x) x.style.opacity = i === leg ? 1 : 0; });
    try { v.currentTime = Math.max(0, Math.min(d - 0.033, t0 * d)); } catch (e) {}
    v.playbackRate = Math.max(0.25, Math.min(4, rate));
    playVid = v;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    (function watch() {
      if (playVid !== v) return;                 // superseded by a newer hop
      if (v.ended || v.currentTime >= stopAt) {
        try { v.pause(); v.currentTime = stopAt; } catch (e) {}
        playVid = null; playRaf = null;
        onDone();
        return;
      }
      playRaf = requestAnimationFrame(watch);
    })();
  }
  function playThrough(from, to, i) {
    var a = unflat(from), b = unflat(to), segs = [], L;
    for (L = a.leg; L <= b.leg; L++) {
      segs.push({ leg: L, t0: L === a.leg ? a.t : 0, t1: L === b.leg ? b.t : 1 });
    }
    segs = segs.filter(function (s) { return s.t1 - s.t0 > 0.01; });
    if (!segs.length) { animating = false; syncToWaypoint(i, false); return; }
    var span = segs.reduce(function (sum, s) { return sum + (s.t1 - s.t0); }, 0);
    var target = Math.max(1.1, Math.min(3.4, span * PLAY_PER_LEG));
    var rate = (span * LEG_SECONDS) / target;
    var k = 0;
    (function nextSeg() {
      if (k >= segs.length) {
        animating = false;
        // The last frame and the still are the same picture, so the still is
        // brought up behind and the frozen leg simply stays until the next hop.
        showStill(WP[i].scene);
        return;
      }
      var s = segs[k++];
      playSegment(s.leg, s.t0, s.t1, rate, nextSeg);
    })();
  }

  function go(i) {
    i = Math.max(0, Math.min(WP.length - 1, i));
    if (i === current) return;
    stopMotion();
    if (!startedAt && i > 0) startedAt = Date.now();
    if (i > 0) { help.classList.add('hide'); hideCoach(); }
    var from = flat(WP[current].pos), to = flat(WP[i].pos);
    current = i;
    updateNav();
    pumpLoad();
    // Video cannot run backwards, so a phone treats a back-hop as a still
    // dissolve; the stills are the approved frames, so nothing is lost.
    var reverse = PLAYBACK && to < from;
    if (from === to || reverse || !chainReady(from, to)) {
      syncToWaypoint(i, false);
      return;
    }
    animating = true;
    renderCopy(i, false);
    if (PLAYBACK) { playThrough(from, to, i); return; }
    var dist = Math.abs(to - from);
    var durMs = Math.max(1000, Math.min(3200, dist * TWEEN_PER_LEG * 1000));
    var t0 = performance.now();
    function step(now) {
      var u = Math.min(1, (now - t0) / durMs);
      var x = from + (to - from) * ease(u);
      setChain(unflat(x));
      if (u < 1) { rafId = requestAnimationFrame(step); }
      else { rafId = null; animating = false; showStill(WP[i].scene); }
    }
    rafId = requestAnimationFrame(step);
  }

  // ---------- language ----------
  function setLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    langBtn.textContent = lang === 'mr' ? 'English' : 'मराठी';
    help.innerHTML = TOUCH ? HELP_TOUCH[lang] : HELP[lang];
    navLabel.textContent = NEXT_LABEL[lang];
    navNext.setAttribute('aria-label', NEXT_LABEL[lang]);
    coachLabel.textContent = COACH_LABEL[lang];
    renderCopy(current, true);
  }
  langBtn.addEventListener('click', function (e) { e.stopPropagation(); setLang(lang === 'mr' ? 'en' : 'mr'); });

  // ---------- input ----------
  function next() { go(current + 1); }
  function prev() { go(current - 1); }
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    // reels overlay first: while one is open the arrows must not skip the slide
    if (reels.classList.contains('show')) {
      if (k === 'Escape' || k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' ||
          k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); closeReel(); return; }
    }
    var w = WP[current];
    if (w && w.reels) {
      var hit = null;
      w.reels.forEach(function (r) { if (r.key === k.toLowerCase()) hit = r; });
      if (hit) { e.preventDefault(); openReel(hit); return; }
    }
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
  navNext.addEventListener('click', function (e) { e.stopPropagation(); hideCoach(); next(); });
  navBack.addEventListener('click', function (e) { e.stopPropagation(); hideCoach(); prev(); });

  // touch: tap = advance, swipe right = back, swipe left = advance.
  // The old gate (50 px AND dx > dy x 1.5) rejected an ordinary thumb flick,
  // which arcs upward - hence "one swipe does not move it". A quick flick now
  // counts on distance OR speed, and only has to be more horizontal than vertical.
  var touchX = null, touchY = null, touchT = 0, swiped = false;
  root.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    touchT = e.timeStamp; swiped = false;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    var dt = e.timeStamp - touchT;
    touchX = touchY = null;
    var adx = Math.abs(dx), ady = Math.abs(dy);
    var flick = dt < 320 && adx > 18;
    if (adx > ady && (adx > 30 || flick)) {
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
  updateNav();
  loadVideos();
  setTimeout(showCoach, 1600);
})();
