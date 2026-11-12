/* ibipax.com: menu, gameplay clip and before/after slider, store links, Catholic Treasures screenshots and contact address. */
(function () {
  'use strict';

  /* Polychrome's store pages. Paste each address here when that page goes live:
     every button or badge marked data-store="steam", "appStore" or "googlePlay" then links to it.
     Until then, the Steam buttons scroll to the "Coming soon" section and the badges stay unlinked. */
  var POLYCHROME_LINKS = {
    steam: '',      // e.g. https://store.steampowered.com/app/0000000/Polychrome_Restoration_Simulator/
    appStore: '',   // e.g. https://apps.apple.com/app/id0000000000
    googlePlay: ''  // e.g. https://play.google.com/store/apps/details?id=com.ibipax.polychrome
  };

  /* ---------- Store links ---------- */
  var storeEls = document.querySelectorAll('[data-store]');
  Array.prototype.forEach.call(storeEls, function (el) {
    var url = POLYCHROME_LINKS[el.getAttribute('data-store')];
    if (url) {
      var link = el;
      if (el.tagName !== 'A') {
        link = document.createElement('a');
        link.className = el.className;
        el.parentNode.insertBefore(link, el);
        link.appendChild(el);
        el.className = '';
        var label = el.getAttribute('data-live-label');
        if (label) link.setAttribute('aria-label', label);
      }
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      return;
    }
    var pending = el.getAttribute('data-pending-label');
    if (pending && el.tagName === 'A') {
      var text = el.querySelector('.btn__label');
      if (text) text.textContent = pending;
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('role', 'link');
      el.classList.add('is-pending');
    }
  });

  /* ---------- Mobile menu ---------- */
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.nav-toggle');
  if (toggle) {
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-open'));
    });
    header.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.nav-links a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Before / after slider ---------- */
  var sliders = document.querySelectorAll('[data-compare]');
  Array.prototype.forEach.call(sliders, function (view) {
    var range = view.querySelector('input[type="range"]');
    if (!range) return;
    var dragging = false;

    function set(value) {
      var v = Math.max(0, Math.min(100, value));
      view.style.setProperty('--pos', v + '%');
      range.value = String(Math.round(v));
      range.setAttribute('aria-valuetext', Math.round(v) + '% restored');
    }
    function fromPointer(e) {
      var r = view.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }

    range.addEventListener('input', function () { set(Number(range.value)); });
    view.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      view.classList.add('is-dragging');
      if (view.setPointerCapture) view.setPointerCapture(e.pointerId);
      set(fromPointer(e));
    });
    view.addEventListener('pointermove', function (e) {
      if (dragging) set(fromPointer(e));
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
      view.addEventListener(type, function () {
        dragging = false;
        view.classList.remove('is-dragging');
      });
    });
    set(Number(range.value) || 50);
    view.polyCompareSet = set;
  });


  /* ---------- Gameplay clip, then the slider (Polychrome homepage) ----------
     The clip plays once over the slider when it comes into view. It ends on the restored portal,
     so the slider waits underneath at fully restored, the clip fades away, and the grey sweeps
     back to the middle. Skip, a touch on the clip or the slider's keys hand over at once.
     Reduced motion, a blocked autoplay or a failed load leave the slider as it was. */
  Array.prototype.forEach.call(sliders, function (view) {
    var src = view.getAttribute('data-clip');
    var setPos = view.polyCompareSet;
    var range = view.querySelector('input[type="range"]');
    if (!src || !setPos || !range) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var small = !!(window.matchMedia && window.matchMedia('(max-width: 600px)').matches);
    var media = view.closest ? view.closest('.hero__media') : null;
    var label = media && media.querySelector('[data-clip-label]');
    var replay = media && media.querySelector('.compare__replay');
    var dragLabel = label ? label.textContent : '';

    var video = document.createElement('video');
    video.className = 'compare__video';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    ['muted', 'playsinline', 'disablepictureinpicture', 'disableremoteplayback'].forEach(function (a) { video.setAttribute(a, ''); });
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    // MP4 (H.264) plays everywhere that matters; the WebM (VP9) copy is for browsers without H.264.
    var mp4 = video.canPlayType && video.canPlayType('video/mp4; codecs="avc1.640028"');
    var webm = video.canPlayType && video.canPlayType('video/webm; codecs="vp9"');
    var file = mp4 ? (small && view.getAttribute('data-clip-small')) || src
      : webm ? (small && view.getAttribute('data-clip-small-webm')) || view.getAttribute('data-clip-webm') : '';
    if (!file) return;
    video.preload = 'auto';
    video.poster = view.getAttribute(small ? 'data-clip-poster-small' : 'data-clip-poster') || '';
    video.src = file;

    var skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'compare__skip';
    skip.setAttribute('aria-label', 'Skip the gameplay clip');
    skip.innerHTML = 'Skip <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l6 6-6 6M13 6l6 6-6 6"/></svg>';

    var active = false, raf = 0, waitTimer = 0, sweepTimer = 0;

    function cancelSweep() {
      clearTimeout(sweepTimer);
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function sweep(from, to, ms) {
      cancelSweep();
      var t0 = 0;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / ms);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        setPos(from + (to - from) * e);
        raf = k < 1 ? requestAnimationFrame(step) : 0;
      }
      raf = requestAnimationFrame(step);
    }
    function handOver(quick) {
      if (!active) return;
      active = false;
      clearTimeout(waitTimer);
      setPos(100);
      video.classList.add('is-gone');
      skip.hidden = true;
      view.classList.remove('is-clip');
      if (label) label.textContent = dragLabel;
      if (replay) replay.hidden = false;
      if (quick) { video.pause(); setPos(50); }
      else {
        setTimeout(function () { if (!active) video.pause(); }, 700);
        sweepTimer = setTimeout(function () { sweep(100, 50, 1400); }, 450);
      }
    }
    function arm() {
      cancelSweep();
      active = true;
      view.classList.add('is-clip');
      video.classList.remove('is-gone');
      skip.hidden = false;
      if (label) label.textContent = label.getAttribute('data-clip-label');
      if (replay) replay.hidden = true;
    }
    function play() {
      if (!active) return;
      try { video.currentTime = 0; } catch (e) {}
      var p = video.play();
      if (p && p.catch) p.catch(function () { handOver(true); });
      clearTimeout(waitTimer);
      waitTimer = setTimeout(function () { if (video.paused) handOver(true); }, 8000);
    }

    video.addEventListener('ended', function () { handOver(false); });
    video.addEventListener('error', function () { handOver(true); });
    video.addEventListener('playing', function () { clearTimeout(waitTimer); if (!active) video.pause(); });
    skip.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    skip.addEventListener('click', function () { handOver(true); });
    // While the clip shows, a touch hands over rather than moving the slider hidden under it.
    view.addEventListener('pointerdown', function (e) {
      if (!active) { cancelSweep(); return; }
      if (skip.contains(e.target)) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      handOver(true);
    }, true);
    range.addEventListener('focus', function () { if (active) handOver(true); });
    range.addEventListener('input', cancelSweep);
    if (replay) replay.addEventListener('click', function () { arm(); play(); });

    view.appendChild(video);
    view.appendChild(skip);
    arm();
    function watch() {
      if (!('IntersectionObserver' in window)) { play(); return; }
      var seen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { seen.disconnect(); play(); }
      }, { threshold: 0.4 });
      seen.observe(view);
    }
    // A link to a section lower down glides there after loading: wait until the page stops moving
    // before looking, or the clip would start while the slider passes by on the way down.
    function whenStill(fn) {
      var lastY = null, calm = 0, checks = 0;
      (function check() {
        var y = window.pageYOffset || 0;
        calm = y === lastY ? calm + 1 : 0;
        lastY = y;
        if (calm >= 2 || ++checks > 40) fn();
        else setTimeout(check, 120);
      })();
    }
    if (location.hash.length > 1) {
      var later = function () { setTimeout(function () { whenStill(watch); }, 200); };
      if (document.readyState === 'complete') later();
      else window.addEventListener('load', later);
    } else {
      watch();
    }
  });

  /* ---------- Catholic Treasures screenshot gallery ---------- */
  var strips = document.querySelectorAll('[data-marquee]');
  Array.prototype.forEach.call(strips, function (strip) {
    var track = strip.querySelector('.ct-strip__track');
    var picker = document.querySelector('select[aria-controls="' + strip.id + '"]');
    var button = document.querySelector('[data-marquee-toggle][aria-controls="' + strip.id + '"]');
    if (!track || !picker || !button) return;
    var screens = Array.from(track.children);
    var manual = window.matchMedia('(max-width: 860px), (hover: none), (prefers-reduced-motion: reduce)');

    screens.forEach(function (screen) {
      picker.add(new Option(screen.querySelector('figcaption').textContent));
    });

    function setMode() {
      if (!manual.matches && !track.querySelector('[data-clone]')) {
        // Only the desktop animation needs a second copy for its seamless loop.
        screens.forEach(function (screen) {
          var copy = screen.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('data-clone', '');
          track.appendChild(copy);
        });
      }
      strip.classList.toggle('is-running', !manual.matches);
      strip.tabIndex = manual.matches ? 0 : -1;
      picker.parentElement.hidden = !manual.matches;
      button.hidden = manual.matches;
      strip.scrollLeft = 0;
      picker.selectedIndex = 0;
    }
    setMode();
    manual.addEventListener('change', setMode);

    picker.addEventListener('change', function () {
      strip.scrollLeft = screens[picker.selectedIndex].offsetLeft - screens[0].offsetLeft;
    });
    strip.addEventListener('scroll', function () {
      if (!manual.matches || screens.length < 2) return;
      var step = screens[1].offsetLeft - screens[0].offsetLeft;
      var index = Math.round(strip.scrollLeft / step);
      picker.selectedIndex = Math.max(0, Math.min(screens.length - 1, index));
    }, { passive: true });

    button.addEventListener('click', function () {
      var paused = strip.classList.toggle('is-paused');
      button.setAttribute('aria-pressed', paused ? 'true' : 'false');
    });

    /* Click and drag to move the screens along: with a mouse in either row, and with a finger in the
       moving row too (the swipe row already scrolls under a finger). The moving row is a CSS
       animation, so a drag winds it to and fro and a flick lets it coast; the swipe row scrolls,
       then settles on the nearest screen. */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var drag = null, glide = 0, settle = 0;
    function loop() {
      var list = track.getAnimations ? track.getAnimations() : [];
      for (var i = 0; i < list.length; i++) if (list[i].animationName === 'ct-marquee') return list[i];
      return null;
    }
    function moveTo(d, dx) {
      if (d.anim) {
        var t = d.start - dx / d.lapPx * d.lapMs;
        d.anim.currentTime = ((t % d.lapMs) + d.lapMs) % d.lapMs;
      } else {
        strip.scrollLeft = d.start - dx;
      }
    }
    function stopGlide() {
      if (glide) cancelAnimationFrame(glide);
      glide = 0;
      strip.classList.remove('is-gliding');
    }
    function settled() {
      clearTimeout(settle);
      strip.removeEventListener('scrollend', settled);
      strip.classList.remove('is-settling');
    }
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
    strip.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || drag) return;
      var running = strip.classList.contains('is-running');
      if (!running && e.pointerType !== 'mouse') return;
      // Leave the swipe row's own scrollbar to work as usual.
      if (!running && e.clientY > strip.getBoundingClientRect().top + strip.clientHeight) return;
      var anim = running ? loop() : null;
      if (running && !anim) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      stopGlide();
      settled();
      drag = { id: e.pointerId, x: e.clientX, dx: 0, anim: anim, trail: [[e.timeStamp, e.clientX]] };
      if (anim) {
        drag.start = Number(anim.currentTime) || 0;
        drag.lapMs = anim.effect.getTiming().duration;
        drag.lapPx = track.offsetWidth / 2;
      } else {
        drag.start = strip.scrollLeft;
      }
      strip.classList.add('is-dragging');
      if (strip.setPointerCapture) strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      moveTo(drag, drag.dx);
      drag.trail.push([e.timeStamp, e.clientX]);
      if (drag.trail.length > 5) drag.trail.shift();
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      strip.classList.remove('is-dragging');
      // How fast the pointer was going as it let go, in pixels per millisecond.
      var a = d.trail[0], b = d.trail[d.trail.length - 1];
      var v = e.type === 'pointerup' && b[0] > a[0] && e.timeStamp - b[0] < 80 ? (b[1] - a[1]) / (b[0] - a[0]) : 0;
      if (d.anim) {
        if (reduce.matches || Math.abs(v) < 0.1) return;
        var dx = d.dx, last = 0;
        strip.classList.add('is-gliding');
        glide = requestAnimationFrame(function coast(now) {
          var dt = last ? Math.min(32, now - last) : 16;
          last = now;
          dx += v * dt;
          v *= Math.pow(0.95, dt / 16);
          moveTo(d, dx);
          if (Math.abs(v) > 0.02) glide = requestAnimationFrame(coast);
          else stopGlide();
        });
      } else if (screens.length > 1) {
        var stepPx = screens[1].offsetLeft - screens[0].offsetLeft;
        var index = Math.round((strip.scrollLeft - v * 150) / stepPx);
        index = Math.max(0, Math.min(screens.length - 1, index));
        // Snapping stays off until the row has slid to that screen.
        strip.classList.add('is-settling');
        if ('onscrollend' in window) strip.addEventListener('scrollend', settled);
        settle = setTimeout(settled, 900);
        strip.scrollTo({ left: index * stepPx, behavior: reduce.matches ? 'auto' : 'smooth' });
      }
    }
    strip.addEventListener('pointerup', release);
    strip.addEventListener('pointercancel', release);
    strip.addEventListener('lostpointercapture', release);

    // Rest while the row is out of sight.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        strip.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }).observe(strip);
    }
  });

  /* ---------- Contact address (assembled here to keep it away from spam bots) ---------- */
  var mailEls = document.querySelectorAll('[data-email-user]');
  Array.prototype.forEach.call(mailEls, function (a) {
    var address = a.getAttribute('data-email-user') + '@' + a.getAttribute('data-email-domain');
    a.href = 'mailto:' + address;
    if (!a.hasAttribute('data-email-keep-text')) a.textContent = address;
  });
})();
