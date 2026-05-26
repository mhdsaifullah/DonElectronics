/* =========================================================
   SYNATEL × ONE STOP PCB SOLUTION — App JS (Prototype 2)
   Combined: Claude Design animations + interactive features
   ========================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     1. Scroll reveal — [data-reveal] and [data-stagger]
  ------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (revealTargets.length) {
    if ('IntersectionObserver' in window && !prefersReduced) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealTargets.forEach((el) => io.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add('in'));
    }
  }

  /* -------------------------------------------------------
     2. Animated counters — data-count
  ------------------------------------------------------- */
  function animateCounter(el) {
    var target   = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var duration = parseInt(el.dataset.duration || '1400', 10);
    var prefix   = el.dataset.prefix || '';
    var suffix   = el.dataset.suffix || '';
    var start    = performance.now();
    function step(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if ('IntersectionObserver' in window && !prefersReduced) {
      var co = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { animateCounter(e.target); co.unobserve(e.target); } }),
        { threshold: 0.6 }
      );
      counters.forEach((el) => co.observe(el));
    } else {
      counters.forEach((el) => {
        var v = parseFloat(el.dataset.count), d = parseInt(el.dataset.decimals || '0', 10);
        el.textContent = (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
      });
    }
  }

  /* -------------------------------------------------------
     3. Button cursor magnet — sets --mx / --my
  ------------------------------------------------------- */
  document.addEventListener('pointermove', (e) => {
    var btn = e.target.closest && e.target.closest('.btn');
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', e.clientX - r.left + 'px');
    btn.style.setProperty('--my', e.clientY - r.top  + 'px');
  }, { passive: true });

  /* -------------------------------------------------------
     4. Marquee auto-duplicate
  ------------------------------------------------------- */
  document.querySelectorAll('.marquee-track').forEach((track) => {
    if (track.dataset.dup) return;
    track.dataset.dup = '1';
    var group = track.querySelector('.marquee-group');
    if (group) { var clone = group.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone); }
  });

  /* -------------------------------------------------------
     5. Tilt cards
  ------------------------------------------------------- */
  document.querySelectorAll('.tilt').forEach((card) => {
    var rect = null;
    card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', (e) => {
      if (!rect || prefersReduced) return;
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = 'perspective(900px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateZ(0)';
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* -------------------------------------------------------
     6. Hero particles — .particles[data-particles]
  ------------------------------------------------------- */
  document.querySelectorAll('.particles').forEach((wrap) => {
    if (prefersReduced) return;
    var count = parseInt(wrap.dataset.particles || '14', 10);
    for (var i = 0; i < count; i++) {
      var s   = document.createElement('span');
      var dur = 8 + Math.random() * 14;
      s.style.left             = Math.random() * 100 + '%';
      s.style.bottom           = '-' + Math.random() * 20 + 'px';
      s.style.width = s.style.height = (2 + Math.random() * 3) + 'px';
      s.style.opacity          = (0.3 + Math.random() * 0.5).toFixed(2);
      s.style.animationDuration = dur + 's';
      s.style.animationDelay   = (-Math.random() * dur) + 's';
      wrap.appendChild(s);
    }
  });

  /* -------------------------------------------------------
     7. Live quote flicker — data-live-total
  ------------------------------------------------------- */
  document.querySelectorAll('[data-live-total]').forEach((el) => {
    if (prefersReduced) return;
    var base = parseFloat(el.dataset.liveTotal);
    function jiggle() {
      el.textContent = '£' + (base + (Math.random() - 0.5) * 4).toFixed(2);
      setTimeout(jiggle, 1800 + Math.random() * 1400);
    }
    setTimeout(jiggle, 1200);
  });

  /* -------------------------------------------------------
     8. Hero slider
  ------------------------------------------------------- */
  var heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    var track     = heroSlider.querySelector('.hero-track');
    var slides    = Array.from(heroSlider.querySelectorAll('.hero-slide'));
    var dots      = Array.from(document.querySelectorAll('.hero-dot'));
    var counterEl = document.querySelector('.hero-counter b');
    var total     = slides.length;
    var current   = 0;
    var timer     = null;
    var INTERVAL  = 7000;

    function paint(i) {
      current = (i + total) % total;
      if (track) track.style.transform = 'translateX(-' + current * 100 + '%)';
      slides.forEach(function(s, idx) { s.classList.toggle('is-active', idx === current); });
      dots.forEach(function(d, idx) {
        var was = d.classList.contains('active');
        d.classList.toggle('active', idx === current);
        d.setAttribute('aria-selected', idx === current ? 'true' : 'false');
        if (idx === current && !was) { d.classList.remove('active'); void d.offsetWidth; d.classList.add('active'); }
      });
      if (counterEl) counterEl.textContent = String(current + 1).padStart(2, '0');
    }
    function next() { paint(current + 1); }
    function prev() { paint(current - 1); }
    function play() { stop(); if (!prefersReduced) timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function(d, i) { d.addEventListener('click', function() { paint(i); play(); }); });
    document.querySelectorAll('.hero-arrow.next').forEach(function(b) { b.addEventListener('click', function() { next(); play(); }); });
    document.querySelectorAll('.hero-arrow.prev').forEach(function(b) { b.addEventListener('click', function() { prev(); play(); }); });

    var heroOuter = heroSlider.closest('.hero') || heroSlider;
    heroOuter.addEventListener('pointerenter', function() { heroSlider.classList.add('paused'); stop(); });
    heroOuter.addEventListener('pointerleave', function() { heroSlider.classList.remove('paused'); play(); });
    document.addEventListener('visibilitychange', function() { if (document.hidden) stop(); else play(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight') { next(); play(); }
      else if (e.key === 'ArrowLeft') { prev(); play(); }
    });

    paint(0);
    play();
  }

  /* -------------------------------------------------------
     9. Soft parallax — data-parallax
  ------------------------------------------------------- */
  if (!prefersReduced) {
    var parallaxEls = document.querySelectorAll('[data-parallax]');
    if (parallaxEls.length) {
      var ticking = false;
      function updateParallax() {
        ticking = false;
        var vh = window.innerHeight;
        parallaxEls.forEach(function(el) {
          var r = el.getBoundingClientRect();
          var ratio = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.transform = 'translateY(' + (ratio * parseFloat(el.dataset.parallax || '0.15') * 100).toFixed(2) + 'px)';
        });
      }
      window.addEventListener('scroll', function() { if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; } }, { passive: true });
      updateParallax();
    }
  }

  /* -------------------------------------------------------
     10. Blog category filter
  ------------------------------------------------------- */
  var catBtns  = document.querySelectorAll('.cat[data-cat]');
  var cardWraps = document.querySelectorAll('.blog-card-wrap');
  if (catBtns.length && cardWraps.length) {
    catBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        catBtns.forEach(function(b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var cat = btn.dataset.cat;
        cardWraps.forEach(function(wrap) {
          if (cat === 'all' || wrap.dataset.cat === cat) {
            wrap.classList.remove('hidden');
          } else {
            wrap.classList.add('hidden');
          }
        });
      });
    });
  }

  /* -------------------------------------------------------
     11. Tile selectors (order page spec tiles)
  ------------------------------------------------------- */
  document.querySelectorAll('.tile-row').forEach(function(row) {
    row.querySelectorAll('.tile').forEach(function(tile) {
      tile.addEventListener('click', function() {
        row.querySelectorAll('.tile').forEach(function(t) { t.classList.remove('on'); });
        tile.classList.add('on');
        updateOrderSummary();
      });
    });
  });

  /* -------------------------------------------------------
     12. Upload / dropzone
  ------------------------------------------------------- */
  var dz = document.querySelector('.dropzone');
  var dzInput = document.querySelector('#gerberInput');
  if (dz) {
    dz.addEventListener('click', function() { if (dzInput) dzInput.click(); });
    dz.addEventListener('dragover', function(e) { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', function() { dz.classList.remove('drag-over'); });
    dz.addEventListener('drop', function(e) {
      e.preventDefault();
      dz.classList.remove('drag-over');
      var files = e.dataTransfer.files;
      if (files.length) handleFile(files[0]);
    });
    if (dzInput) {
      dzInput.addEventListener('change', function() {
        if (this.files.length) handleFile(this.files[0]);
      });
    }
  }
  function handleFile(file) {
    var dz = document.querySelector('.dropzone');
    if (!dz) return;
    dz.innerHTML = '<div style="display:flex;align-items:center;gap:14px;">' +
      '<div class="dz-icon"><svg class="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3v5h5M5 3h9l5 5v13H5z"/><path d="M8 13h8M8 17h5"/></svg></div>' +
      '<div><b style="font-family:var(--f-mono);font-size:14px;">' + file.name + '</b><br>' +
      '<span style="font-family:var(--f-mono);font-size:11px;color:var(--ok);">&#10003; Ready for DRC · ' + (file.size / 1024).toFixed(0) + ' KB</span></div>' +
      '</div>';
    dz.style.borderStyle = 'solid';
    dz.style.borderColor = 'var(--ok)';
    dz.style.background = 'rgba(21,128,61,0.03)';
    dz.style.textAlign = 'left';
    dz.style.padding = '22px 24px';
  }

  /* -------------------------------------------------------
     13. Quantity slider (order page)
  ------------------------------------------------------- */
  var qtySlider = document.querySelector('#qtySlider');
  var qtyVal    = document.querySelector('#qtyVal');
  if (qtySlider && qtyVal) {
    qtySlider.addEventListener('input', function() {
      qtyVal.textContent = this.value;
      updateOrderSummary();
    });
    document.querySelectorAll('.qty-ticks button[data-qty]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        qtySlider.value = this.dataset.qty;
        qtyVal.textContent = this.dataset.qty;
        updateOrderSummary();
      });
    });
  }

  /* -------------------------------------------------------
     14. FAQ accordion
  ------------------------------------------------------- */
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(i) {
        i.classList.remove('open');
        var q = i.querySelector('.faq-q');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* -------------------------------------------------------
     15. Order page live quote calculator
  ------------------------------------------------------- */
  var SETUP  = 18;
  var BASE   = 0.003;
  var LAYER  = { 1: 0.7, 2: 1, 4: 1.85, 6: 2.95, 8: 4.2, 10: 5.8, 12: 7.2 };
  var FINISH = { enig: 1.5, hasl: 1, 'hasl-pb': 1.05, osp: 1.1, silver: 1.35, tin: 1.2, gold: 1.8 };
  var SPEED  = { std: 1, exp: 1.65 };
  var COPPER = { '0.5oz': 0.85, '1oz': 1, '2oz': 1.3, '3oz': 1.6 };
  var THICK  = { '0.8': 0.92, '1.0': 0.95, '1.2': 0.98, '1.6': 1, '2.0': 1.08, '2.4': 1.15 };

  function readTile(rowSelector, fallback) {
    var sel = document.querySelector(rowSelector + ' .tile.on');
    if (!sel) return fallback;
    var vEl = sel.querySelector('.v');
    return vEl ? vEl.textContent.trim() : fallback;
  }
  function getSpec() {
    var layers = parseInt(readTile('.layers-row', '2'), 10) || 2;
    var thick  = readTile('.thick-row', '1.6');
    var copper = readTile('.copper-row', '1oz');
    var qty    = qtySlider ? parseInt(qtySlider.value, 10) : 50;
    var wEl    = document.querySelector('#boardW');
    var hEl    = document.querySelector('#boardH');
    var w      = wEl ? parseFloat(wEl.value) || 80 : 80;
    var h      = hEl ? parseFloat(hEl.value) || 60 : 60;
    var finishSel = document.querySelector('#finishSel');
    var finish = finishSel ? (finishSel.value || 'enig') : 'enig';
    var speedBtn = document.querySelector('.lead-tile.on');
    var speed = speedBtn ? (speedBtn.dataset.speed || 'std') : 'std';
    return { layers, thick, copper, qty, w, h, finish, speed };
  }
  function updateOrderSummary() {
    var s = getSpec();
    var lm = LAYER[s.layers] || 1;
    var fm = FINISH[s.finish] || 1;
    var sm = SPEED[s.speed] || 1;
    var cm = COPPER[s.copper] || 1;
    var tm = THICK[s.thick] || 1;
    var area = (s.w * s.h) / 100;
    var total = (SETUP + area * BASE * lm * fm * cm * tm * s.qty) * sm * 1.2;
    var perBoard = total / s.qty;
    var innerCopperField = document.querySelector('.inner-copper-field');
    if (innerCopperField) innerCopperField.style.display = s.layers >= 4 ? '' : 'none';
    var totalEl = document.querySelector('#ordTotal');
    var perEl   = document.querySelector('#ordPer');
    if (totalEl) totalEl.textContent = '£' + total.toFixed(2);
    if (perEl)   perEl.textContent   = '£' + perBoard.toFixed(3) + ' / board';
    var spRows = {
      ordLayers: s.layers + ' layer',
      ordDims:   s.w + ' × ' + s.h + ' mm',
      ordQty:    s.qty + ' pcs',
      ordFinish: s.finish.toUpperCase(),
      ordCopper: s.copper,
      ordSpeed:  s.speed === 'exp' ? 'Express 24h' : 'Standard 5d'
    };
    Object.keys(spRows).forEach(function(id) {
      var el = document.querySelector('#' + id);
      if (el) el.textContent = spRows[id];
    });
  }
  if (document.querySelector('#ordTotal')) {
    updateOrderSummary();
    document.querySelectorAll('.field input, .field select').forEach(function(el) {
      el.addEventListener('input', updateOrderSummary);
      el.addEventListener('change', updateOrderSummary);
    });
    var leadTiles = document.querySelectorAll('.lead-tile');
    leadTiles.forEach(function(btn) {
      btn.addEventListener('click', function() {
        leadTiles.forEach(function(b) { b.classList.remove('on'); });
        btn.classList.add('on');
        updateOrderSummary();
      });
    });
  }

  /* -------------------------------------------------------
     15b. Advanced options toggle
  ------------------------------------------------------- */
  var moreOptsBtn   = document.getElementById('moreOptsBtn');
  var advancedSpecs = document.getElementById('advancedSpecs');
  if (moreOptsBtn && advancedSpecs) {
    moreOptsBtn.addEventListener('click', function() {
      var isOpen = advancedSpecs.classList.toggle('open');
      moreOptsBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* -------------------------------------------------------
     16. Seg tab switcher (general)
  ------------------------------------------------------- */
  document.querySelectorAll('.seg').forEach(function(seg) {
    seg.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        seg.querySelectorAll('button').forEach(function(b) { b.classList.remove('on'); });
        btn.classList.add('on');
      });
    });
  });

  /* -------------------------------------------------------
     17. PCB preview layer buttons (order page)
  ------------------------------------------------------- */
  /* PCB preview expand/collapse */
  var expandBtn  = document.getElementById('pcbExpandBtn');
  var uploadGrid = document.querySelector('.upload-grid');
  if (expandBtn && uploadGrid) {
    var expandIcon   = '<svg width="13" height="13" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 3.5V1h2.5M7.5 1H10v2.5M10 7.5V10H7.5M3.5 10H1V7.5"/></svg>';
    var collapseIcon = '<svg width="13" height="13" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3.5 1V3.5H1M10 3.5H7.5V1M7.5 10V7.5H10M1 7.5h2.5V10"/></svg>';
    expandBtn.addEventListener('click', function() {
      var isExpanded = uploadGrid.classList.toggle('expanded');
      expandBtn.innerHTML = isExpanded ? collapseIcon : expandIcon;
      expandBtn.setAttribute('aria-label', isExpanded ? 'Collapse PCB preview' : 'Expand PCB preview');
    });
  }
  document.querySelectorAll('.pcb-prev .layers').forEach(function(wrap) {
    wrap.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        wrap.querySelectorAll('button').forEach(function(b) { b.classList.remove('on'); });
        btn.classList.add('on');
      });
    });
  });

  /* -------------------------------------------------------
     18. Scroll-to-top button
  ------------------------------------------------------- */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    var SHOW_THRESHOLD = 400;
    function onScroll() {
      if (window.scrollY > SHOW_THRESHOLD) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollTopBtn.addEventListener('click', function() {
      if (prefersReduced) {
        window.scrollTo({ top: 0 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* -------------------------------------------------------
     19. Chip multi-select toggle
  ------------------------------------------------------- */
  document.querySelectorAll('.chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      chip.classList.toggle('on');
    });
  });

  /* -------------------------------------------------------
     20. Toggle field rows (.t-switch)
  ------------------------------------------------------- */
  document.querySelectorAll('.t-switch').forEach(function(sw) {
    sw.addEventListener('click', function() {
      var isOn = sw.classList.toggle('on');
      sw.setAttribute('aria-checked', isOn ? 'true' : 'false');
      var field = sw.closest('.toggle-field');
      if (field) field.classList.toggle('active', isOn);
    });
  });

  /* -------------------------------------------------------
     21. Mobile navigation toggle
  ------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav   = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });
    document.addEventListener('click', function(e) {
      if (siteNav.classList.contains('open') && !siteNav.contains(e.target) && !navToggle.contains(e.target)) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
      }
    });
    siteNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });
  }


  /* -------------------------------------------------------
     22. BOM page — alternatives expand/collapse + assembly panel
  ------------------------------------------------------- */
  document.querySelectorAll('[data-bom-expand]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var row = document.getElementById(btn.getAttribute('data-bom-expand'));
      if (!row) return;
      var isOpen = row.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var lbl = btn.querySelector('[data-label]');
      if (lbl) lbl.textContent = isOpen ? 'Hide alternatives' : 'View alternatives';
    });
  });

  document.querySelectorAll('.bom-alt-option').forEach(function(opt) {
    opt.addEventListener('click', function() {
      var inner = opt.closest('.bom-alt-inner');
      if (!inner) return;
      inner.querySelectorAll('.bom-alt-option').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
    });
  });

  var bomAsmBtns  = document.querySelectorAll('[data-asm-mode]');
  var bomAsmPanel = document.getElementById('assemblyPanel');
  if (bomAsmBtns.length && bomAsmPanel) {
    bomAsmBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        bomAsmPanel.style.display = btn.getAttribute('data-asm-mode') === 'assembly' ? '' : 'none';
      });
    });
  }

  /* -------------------------------------------------------
     23. Process section — PCB / BOM tab switcher
  ------------------------------------------------------- */
  var processTabs   = document.querySelectorAll('[data-process-tab]');
  var processPcbEl  = document.getElementById('processPcb');
  var processBomEl  = document.getElementById('processBom');
  if (processTabs.length && processPcbEl && processBomEl) {
    processTabs.forEach(function(btn) {
      btn.addEventListener('click', function() {
        processTabs.forEach(function(b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var tab = btn.getAttribute('data-process-tab');
        processPcbEl.style.display = tab === 'pcb' ? '' : 'none';
        processBomEl.style.display = tab === 'bom' ? '' : 'none';
      });
    });
  }

  /* -------------------------------------------------------
     24. Floating chat widget
  ------------------------------------------------------- */
  var chatWidget = document.getElementById('chatWidget');
  var chatBtn    = document.getElementById('chatBtn');
  var chatPanel  = document.getElementById('chatPanel');
  var chatClose  = document.getElementById('chatClose');

  if (chatWidget && chatBtn && chatPanel) {
    function openChat() {
      chatWidget.classList.add('open');
      chatBtn.setAttribute('aria-expanded', 'true');
      chatBtn.setAttribute('aria-label', 'Close live chat');
      chatPanel.setAttribute('aria-hidden', 'false');
    }
    function closeChat() {
      chatWidget.classList.remove('open');
      chatBtn.setAttribute('aria-expanded', 'false');
      chatBtn.setAttribute('aria-label', 'Open live chat');
      chatPanel.setAttribute('aria-hidden', 'true');
    }
    chatBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      chatWidget.classList.contains('open') ? closeChat() : openChat();
    });
    if (chatClose) {
      chatClose.addEventListener('click', function(e) {
        e.stopPropagation();
        closeChat();
      });
    }
    document.addEventListener('click', function(e) {
      if (chatWidget.classList.contains('open') && !chatWidget.contains(e.target)) {
        closeChat();
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && chatWidget.classList.contains('open')) {
        closeChat();
        chatBtn.focus();
      }
    });
  }

})();
