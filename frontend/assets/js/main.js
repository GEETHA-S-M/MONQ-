/* ============================================================
   monq. — interaction layer
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // shared localStorage helpers -- used by cart, session, and orders below
  var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var load = function (k, d) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
  };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- sticky nav ----------
     The bar has two states. Over the hero it stays exactly as the hero
     was designed: transparent, cream-on-navy. Past the hero it collapses
     into the floating pill (see .nav.is-stuck), which is both the
     navbar2 treatment and what makes it readable on the light sections.

     So the switch is tied to the hero's bottom edge, not to a fixed
     scroll offset. Pages with no hero — every page but the homepage —
     start in the pill state, since there is no dark bar for them to be
     legible against. */
  var nav = $('#nav');
  var navHero = $('.hero');

  var onScroll = function () {
    var stuck;
    if (navHero) {
      // hand over a little before the hero actually ends, so the pill has
      // formed by the time the first light section is in view
      stuck = window.scrollY > navHero.offsetHeight - nav.offsetHeight * 1.5;
    } else {
      stuck = true;
    }
    nav.classList.toggle('is-stuck', stuck);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- the pill that follows the hovered link ----------
     navbar2.md does this with a Framer shared layoutId; the same read
     comes from one absolutely-positioned element whose offset and width
     are written on hover. Built here rather than in markup so all
     fifteen pages get it without touching any of them. */
  var navLinkWrap = $('#navLinks');
  if (navLinkWrap && !reduce) {
    var hoverPill = document.createElement('span');
    hoverPill.className = 'nav__hover';
    hoverPill.setAttribute('aria-hidden', 'true');
    navLinkWrap.appendChild(hoverPill);

    $$('a', navLinkWrap).forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        if (!nav.classList.contains('is-stuck')) return;
        hoverPill.style.setProperty('--x', a.offsetLeft + 'px');
        hoverPill.style.setProperty('--w', a.offsetWidth + 'px');
        hoverPill.style.setProperty('--h', a.offsetHeight + 'px');
        navLinkWrap.classList.add('has-hover');
      });
    });
    navLinkWrap.addEventListener('pointerleave', function () {
      navLinkWrap.classList.remove('has-hover');
    });
  }

  /* ==========================================================
     ADAPTIVE NOTCH NAV
     Desktop: a pill slides behind whichever link is "active" —
     scroll-spied against its section on the homepage, or read
     straight off aria-current="page" on every other page.
     Mobile (<900px, no menu existed before this): the same
     .nav__links list becomes a floating dropdown, opened by a
     notch-style trigger button that mirrors the active tab's
     label, closing on link choice, outside click, or Escape.
     ========================================================== */
  var navLinksEl = $('.nav__links');
  var navBurger  = $('.nav__burger');

  if (navLinksEl) {
    var navPill    = document.createElement('span');
    navPill.className = 'nav__pill';
    navPill.setAttribute('aria-hidden', 'true');
    navLinksEl.prepend(navPill);

    var navAnchors = $$('a', navLinksEl);
    var burgerLabel = navBurger && $('[data-nav-active-label]', navBurger);

    var movePill = function (a) {
      if (!a) return;
      var lr = navLinksEl.getBoundingClientRect();
      var ar = a.getBoundingClientRect();
      navPill.style.setProperty('--x', (ar.left - lr.left) + 'px');
      navPill.style.setProperty('--w', ar.width + 'px');
      navPill.classList.add('is-visible');
    };

    var setActive = function (a) {
      if (!a) return;
      navAnchors.forEach(function (x) { x.classList.toggle('is-active', x === a); });
      movePill(a);
      if (burgerLabel) burgerLabel.textContent = a.textContent.trim();
    };

    // scroll-spy on the homepage (links point at in-page sections);
    // every other page just trusts the server-rendered aria-current
    var hashSections = navAnchors.reduce(function (acc, a) {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        var sec = document.querySelector(href);
        if (sec) acc.push({ a: a, sec: sec });
      }
      return acc;
    }, []);

    var current = navAnchors.filter(function (a) {
      return a.getAttribute('aria-current') === 'page';
    })[0];

    if (hashSections.length && 'IntersectionObserver' in window) {
      var navSpy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var hit = hashSections.filter(function (h) { return h.sec === en.target; })[0];
          if (hit) setActive(hit.a);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      hashSections.forEach(function (h) { navSpy.observe(h.sec); });
      setActive(hashSections[0].a);
    } else if (current) {
      setActive(current);
    } else if (navAnchors[0]) {
      setActive(navAnchors[0]);
    }

    var repositionPill = function () {
      var active = navAnchors.filter(function (a) { return a.classList.contains('is-active'); })[0];
      if (active) movePill(active);
    };
    addEventListener('resize', repositionPill, { passive: true });
    // webfonts (Outfit/Inter) swap in after first paint and can reflow
    // link widths slightly — nudge the pill back into place once settled
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(repositionPill);
    }

    if (navBurger) {
      var closeNavMenu = function () {
        navBurger.setAttribute('aria-expanded', 'false');
        navLinksEl.classList.remove('is-open');
      };
      var openNavMenu = function () {
        navBurger.setAttribute('aria-expanded', 'true');
        navLinksEl.classList.add('is-open');
      };

      navBurger.addEventListener('click', function () {
        navLinksEl.classList.contains('is-open') ? closeNavMenu() : openNavMenu();
      });
      navAnchors.forEach(function (a) { a.addEventListener('click', closeNavMenu); });
      document.addEventListener('click', function (e) {
        if (!navLinksEl.contains(e.target) && !navBurger.contains(e.target)) closeNavMenu();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeNavMenu();
      });
    }
  }

  /* ==========================================================
     HERO DEPTH
     The hero pack and the defocused field behind it drift a little
     under the pointer, so the frame reads as a scene with depth
     rather than a flat composite. Everything here is deliberately
     small: the pointer moves the field a few pixels and the pack
     barely at all, which is what keeps the hierarchy readable.

     JS only writes the eased pointer position to --mx / --my / --px /
     --py; the stylesheet decides what each layer does with it.
     ========================================================== */
  var hero = $('.hero');

  if (hero && !reduce) {
    var tx = 0, ty = 0;          // target, normalised -1..1
    var cx = 0, cy = 0;          // current, eased toward the target
    var idle = 0;                // drives the resting breath
    var active = false;
    var raf = null;

    var onMove = function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      tx = clamp((px - 0.5) * 2, -1, 1);
      ty = clamp((py - 0.5) * 2, -1, 1);
      root.style.setProperty('--px', px.toFixed(4));
      root.style.setProperty('--py', py.toFixed(4));
      active = true;
    };

    var onLeave = function () { tx = 0; ty = 0; active = false; };

    var frame = function () {
      idle += 0.0042;
      // with the pointer away the scene breathes very slowly instead of
      // freezing dead still
      var restX = active ? 0 : Math.sin(idle) * 0.16;
      var restY = active ? 0 : Math.cos(idle * 0.8) * 0.10;

      // a slow lerp is what makes the drift feel weighted rather than
      // stuck to the cursor
      cx = lerp(cx, tx + restX, 0.045);
      cy = lerp(cy, ty + restY, 0.045);

      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));

      raf = requestAnimationFrame(frame);
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(frame);

    // stop the loop entirely once the hero has scrolled away
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame);
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(hero);
    }
  }

  /* ==========================================================
     360 DRAG VIEWER
     ========================================================== */
  var spin = $('[data-spin]');
  if (spin) {
    var imgs = $$('img', spin);
    var idx = 0, dragging = false, startX = 0, startIdx = 0;
    var STEP = 46; // px of drag per frame

    var render = function (i) {
      idx = ((i % imgs.length) + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.hidden = k !== idx; });
      spin.setAttribute('aria-valuenow', String(idx + 1));
    };

    spin.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX; startIdx = idx;
      spin.setPointerCapture(e.pointerId);
    });
    spin.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      render(startIdx + Math.round((e.clientX - startX) / STEP));
    });
    var stop = function () { dragging = false; };
    spin.addEventListener('pointerup', stop);
    spin.addEventListener('pointercancel', stop);
    spin.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { render(idx + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { render(idx - 1); e.preventDefault(); }
    });

    // idle auto-spin until the visitor takes over
    if (!reduce) {
      var auto = setInterval(function () { if (!dragging) render(idx + 1); }, 1400);
      // the 3D viewer calls this once it has taken over the stage
      window.__monqStopSpin = function () { clearInterval(auto); };
      spin.addEventListener('pointerdown', function () { clearInterval(auto); }, { once: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) clearInterval(auto);
        }, { threshold: 0 }).observe(spin);
      }
    }
  }

  /* ==========================================================
     SCROLL REVEALS + COUNTERS
     ========================================================== */
  // A position sweep rather than IntersectionObserver: an anchor jump or a
  // flung scroll can carry a section past the viewport without IO ever
  // reporting it, which would strand that content at opacity 0 forever.
  // Checking rects covers "already scrolled past" as well as "now visible".
  // stagger: give each child of a group its index, which CSS turns into a delay
  $$('[data-rv-group]').forEach(function (g) {
    $$('[data-rv]', g).forEach(function (el, i) { el.style.setProperty('--rv-i', i); });
  });
  // and stagger the direct [data-rv] blocks within each section too
  $$('section').forEach(function (sec) {
    if (sec.querySelector('[data-rv-group]')) return;
    $$(':scope > [data-rv]', sec).forEach(function (el, i) { el.style.setProperty('--rv-i', i); });
  });

  var pendingRv = $$('[data-rv]');
  var pendingCt = $$('[data-count]');

  var runCount = function (el) {
    var to = parseInt(el.dataset.count, 10) || 0;
    if (reduce || to === 0) { el.textContent = to.toLocaleString(); return; }
    var t = 0;
    var step = function () {
      t += 1 / 52;
      var e = 1 - Math.pow(1 - Math.min(t, 1), 3);
      el.textContent = Math.round(to * e).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  var sweep = function () {
    var vh = innerHeight;
    if (pendingRv.length) {
      pendingRv = pendingRv.filter(function (el) {
        if (el.getBoundingClientRect().top >= vh * 0.92) return true;
        el.classList.add('is-in');
        return false;
      });
    }
    if (pendingCt.length) {
      pendingCt = pendingCt.filter(function (el) {
        if (el.getBoundingClientRect().top >= vh * 0.86) return true;
        runCount(el);
        return false;
      });
    }
  };

  var queued = false;
  var onSweep = function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; sweep(); });
  };
  addEventListener('scroll', onSweep, { passive: true });
  addEventListener('resize', onSweep);
  sweep();

  /* ---------- hero parallax ----------
     The pack and the headline drift at different rates as the hero
     scrolls away, so the hero gains depth instead of sliding off as
     one flat plane. Written as a CSS variable the pack's own transform
     composes with, rather than overwriting that transform outright. */
  if (!reduce) {
    var heroEl = $('.hero');
    var packEl = $('[data-hero-pack]');
    var headEl = $('.hero__head');
    if (heroEl && packEl) {
      var pQueued = false;
      var pFrame = function () {
        pQueued = false;
        var y = window.scrollY;
        if (y > innerHeight * 1.2) return;          // stop once the hero is gone
        packEl.style.setProperty('--par', (y * -0.12).toFixed(1) + 'px');
        if (headEl) {
          headEl.style.transform = 'translateY(' + (y * 0.20).toFixed(1) + 'px)';
          headEl.style.opacity = Math.max(0, 1 - y / (innerHeight * 0.72)).toFixed(3);
        }
      };
      addEventListener('scroll', function () {
        if (pQueued) return;
        pQueued = true;
        requestAnimationFrame(pFrame);
      }, { passive: true });
      pFrame();
    }
  }

  /* ==========================================================
     OVERLAYS
     Shared open/close for the cart drawer and the auth modal:
     body lock, focus moved in and restored on close, and Tab kept
     inside the panel so keyboard users can't wander behind it.
     ========================================================== */
  var stack = [];
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  var focusables = function (root) {
    return $$(FOCUSABLE, root).filter(function (el) {
      return !el.hidden && el.offsetWidth + el.offsetHeight > 0;
    });
  };

  var openOverlay = function (host, panel, focusEl) {
    if (stack.some(function (o) { return o.host === host; })) return;
    stack.push({ host: host, panel: panel, prev: document.activeElement });
    host.hidden = false;
    // Flush layout so the transition has a start state to run from. A rAF
    // would do it too, but rAF is paused in a background tab, which would
    // leave the overlay stuck invisible until the tab came back.
    void host.offsetWidth;
    host.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var t = focusEl || focusables(panel)[0];
      if (t) t.focus();
    }, 70);
  };

  var closeOverlay = function (host) {
    var i = -1;
    stack.forEach(function (o, k) { if (o.host === host) i = k; });
    if (i < 0) return;
    var entry = stack.splice(i, 1)[0];
    host.classList.remove('is-open');
    if (!stack.length) document.body.style.overflow = '';
    setTimeout(function () { host.hidden = true; }, 460);
    if (entry.prev && entry.prev.focus) entry.prev.focus();
  };

  addEventListener('keydown', function (e) {
    if (!stack.length) return;
    var top = stack[stack.length - 1];
    if (e.key === 'Escape') { closeOverlay(top.host); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(top.panel);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!top.panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  /* ==========================================================
     CART
     Persisted to localStorage under CKEY so it survives navigating
     between pages (this is a static multi-page site, not an SPA --
     every page load re-runs this script from scratch).
     ========================================================== */
  var CKEY = 'monq.cart';
  var FREE_SHIP_AT = 35, SHIP_FEE = 5;
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var drawer = $('[data-drawer]');
  var list   = $('[data-cart-list]');
  var empty  = $('[data-cart-empty]');
  var total  = $('[data-cart-total]');
  var badge  = $('[data-cart-count]');
  var items  = load(CKEY, []);

  // full cart page (cart.html) -- optional, present only there
  var cpGrid  = $('[data-cart-page-grid]');
  var cpEmpty = $('[data-cart-page-empty]');
  var cpList  = $('[data-cart-page-list]');
  var cpSub   = $('[data-cart-page-subtotal]');
  var cpShip  = $('[data-cart-page-shipping]');
  var cpTot   = $('[data-cart-page-total]');

  var money = function (n) { return '$' + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, ''); };

  var paintCartPage = function () {
    if (!cpList) return;
    cpList.innerHTML = '';
    var sum = 0;
    items.forEach(function (it, i) {
      sum += it.price * it.qty;
      var row = document.createElement('div');
      row.className = 'line';
      row.innerHTML =
        '<div class="line__media">' + (it.img ? '<img src="' + esc(it.img) + '" alt="" loading="lazy">' : '') + '</div>' +
        '<div class="line__body">' +
          '<h3>' + esc(it.name) + '</h3>' +
          '<p class="line__unit">' + money(it.price) + ' each</p>' +
          '<div class="line__qty">' +
            '<button type="button" data-qty-dec aria-label="Decrease quantity">−</button>' +
            '<span>' + it.qty + '</span>' +
            '<button type="button" data-qty-inc aria-label="Increase quantity">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="line__end">' +
          '<b class="line__total">' + money(it.price * it.qty) + '</b>' +
          '<button type="button" class="line__rm" data-qty-rm>Remove</button>' +
        '</div>';
      $('[data-qty-dec]', row).addEventListener('click', function () { if (it.qty > 1) { it.qty--; paint(); } });
      $('[data-qty-inc]', row).addEventListener('click', function () { it.qty++; paint(); });
      $('[data-qty-rm]', row).addEventListener('click', function () { items.splice(i, 1); paint(); });
      cpList.appendChild(row);
    });
    var hasItems = items.length > 0;
    if (cpEmpty) cpEmpty.hidden = hasItems;
    if (cpGrid) cpGrid.hidden = !hasItems;
    var ship = (sum === 0 || sum >= FREE_SHIP_AT) ? 0 : SHIP_FEE;
    if (cpSub)  cpSub.textContent  = money(sum);
    if (cpShip) cpShip.textContent = sum === 0 ? '—' : (ship === 0 ? 'Free' : money(ship));
    if (cpTot)  cpTot.textContent  = money(sum + ship);
  };

  var paint = function () {
    list.innerHTML = '';
    var sum = 0, n = 0;
    items.forEach(function (it, i) {
      sum += it.price * it.qty; n += it.qty;
      var li = document.createElement('li');
      var info = document.createElement('div');
      var b = document.createElement('b'); b.textContent = it.name;
      var s = document.createElement('small'); s.textContent = 'Qty ' + it.qty + ' · $' + it.price;
      info.appendChild(b); info.appendChild(s);
      var rm = document.createElement('button');
      rm.type = 'button'; rm.textContent = 'Remove';
      rm.setAttribute('aria-label', 'Remove ' + it.name);
      rm.addEventListener('click', function () { items.splice(i, 1); paint(); });
      li.appendChild(info); li.appendChild(rm);
      list.appendChild(li);
    });
    total.textContent = '$' + sum;
    empty.hidden = items.length > 0;
    badge.textContent = String(n);
    badge.hidden = n === 0;
    save(CKEY, items);
    paintCartPage();
  };

  var openCart = function () { openOverlay(drawer, $('.drawer__panel', drawer)); };
  var closeCart = function () { closeOverlay(drawer); };

  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', openCart); });
  $$('[data-cart-close]').forEach(function (b) { b.addEventListener('click', closeCart); });

  $$('[data-add]').forEach(function (btn) {
    var label = $('.add__label', btn);   // swap only the label text, not the icon SVGs
    var card  = btn.closest('[data-product]');
    btn.addEventListener('click', function () {
      // price and subscription state live on the card, set by Subscribe & Save
      var sub = card && card.dataset.mode === 'sub';
      var base = card ? parseFloat(card.dataset.price) : parseFloat(btn.dataset.price);
      var price = sub ? +(base * (1 - SUB_OFF)).toFixed(2) : base;
      var name = btn.dataset.add + (sub ? ' · every ' + card.dataset.weeks + ' weeks' : '');
      var thumb = card ? $('.prod__media img', card) : null;
      var img = thumb ? thumb.getAttribute('src') : '';
      var found = items.filter(function (i) { return i.name === name; })[0];
      if (found) found.qty++; else items.push({ name: name, price: price, qty: 1, img: img || '' });
      paint();
      btn.classList.add('is-added');
      if (label) label.textContent = 'Added'; else btn.textContent = 'Added';
      setTimeout(function () {
        btn.classList.remove('is-added');
        if (label) label.textContent = 'Add'; else btn.textContent = 'Add';
      }, 1300);
    });
  });

  // "Add these products" cards inside the cart modal -- same items array
  // and paint(), just a lighter-weight add path since these cards carry
  // their price/image directly rather than a Subscribe & Save toggle.
  $$('[data-cart-quickadd]').forEach(function (card) {
    var btn = $('[data-cart-quickadd-btn]', card);
    if (!btn) return;
    var name = card.dataset.cartQuickadd, price = parseFloat(card.dataset.price), img = card.dataset.img || '';
    btn.addEventListener('click', function () {
      var found = items.filter(function (i) { return i.name === name; })[0];
      if (found) found.qty++; else items.push({ name: name, price: price, qty: 1, img: img });
      paint();
      btn.classList.add('is-added');
      btn.textContent = 'Added';
      setTimeout(function () { btn.classList.remove('is-added'); btn.textContent = '+ Add'; }, 1300);
    });
  });
  paint();

  /* ==========================================================
     AUTH  —  sign in / create account

     FRONT END ONLY. There is no server here: submit() resolves
     locally after a short delay so the states are all exercisable.
     Passwords are validated and then discarded — they are never
     stored, logged, or persisted anywhere. Only a display name and
     email are kept, in localStorage, to keep the session across
     reloads. Point submit() at a real endpoint to make it live.
     ========================================================== */
  var authEl = $('[data-auth]');
  if (authEl) {
    var authPanel = $('.modal__panel', authEl);
    var forms     = { in: $('[data-form="in"]'), up: $('[data-form="up"]') };
    var tabs      = $$('.tabs__b');
    var titleEl   = $('[data-auth-title]');
    var subEl     = $('[data-auth-sub]');
    var signInBtn = $('[data-auth-open]');
    var acct      = $('[data-acct]');
    var acctMenu  = $('[data-acct-menu]');
    var SKEY = 'monq.session', AKEY = 'monq.accounts';
    var afterAuth = null;   // what to resume once they are through

    var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    var load = function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
    };

    var COPY = {
      in: ['Sign in', 'Welcome back! Please sign in to your account.'],
      up: ['Sign up', 'Save your address, track deliveries, and reorder your sachets in a tap.']
    };

    /* ---- validation ---- */
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name.'; },
      email: function (v) { return EMAIL.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      password: function (v, mode) {
        if (!v) return 'Please enter your password.';
        if (mode === 'up') {
          if (v.length < 8) return 'Use at least 8 characters.';
          if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.';
        }
        return '';
      },
      confirm: function (v, mode, form) {
        if (!v) return 'Please confirm your password.';
        return v === form.elements.password.value ? '' : 'Those passwords do not match.';
      },
      terms: function (v) { return v ? '' : 'Please accept the terms to continue.'; }
    };

    var setErr = function (form, name, msg) {
      var box = $('[data-err="' + name + '"]', form);
      var input = form.elements[name];
      if (box) { box.textContent = msg; box.classList.toggle('is-on', !!msg); }
      if (input && input.type !== 'checkbox') {
        if (msg) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    };

    var checkField = function (form, mode, name) {
      var input = form.elements[name];
      if (!input || !rules[name]) return '';
      var v = input.type === 'checkbox' ? input.checked : input.value;
      var msg = rules[name](v, mode, form);
      setErr(form, name, msg);
      return msg;
    };

    var validate = function (form, mode) {
      var bad = null;
      Object.keys(rules).forEach(function (name) {
        if (!form.elements[name]) return;
        var msg = checkField(form, mode, name);
        if (msg && !bad) bad = form.elements[name];
      });
      return bad;
    };

    /* ---- password strength ---- */
    var LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    var strength = function (v) {
      var s = 0;
      if (v.length >= 8) s++;
      if (v.length >= 12) s++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
      if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
      return Math.min(4, s);
    };
    var pwWrap = $('[data-pw]');
    var pwLabel = $('[data-pw-label]');
    var upPass = forms.up.elements.password;
    upPass.addEventListener('input', function () {
      var v = upPass.value;
      pwWrap.hidden = !v;
      var s = strength(v);
      pwWrap.setAttribute('data-s', String(s));
      pwLabel.textContent = LABELS[s];
    });

    /* ---- mode switching ---- */
    var setMode = function (mode) {
      Object.keys(forms).forEach(function (k) { forms[k].hidden = k !== mode; });
      tabs.forEach(function (t) {
        var on = t.dataset.tab === mode;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      titleEl.textContent = COPY[mode][0];
      subEl.textContent = COPY[mode][1];
      var note = $('[data-note]', forms[mode]);
      if (note) { note.textContent = ''; note.classList.remove('is-err'); }
    };

    $$('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        setMode(b.dataset.tab);
        var first = focusables(forms[b.dataset.tab])[0];
        if (first) first.focus();
      });
    });

    /* ---- open / close ---- */
    var openAuth = function (mode) {
      setMode(mode || 'in');
      openOverlay(authEl, authPanel, forms[mode || 'in'].elements[mode === 'up' ? 'name' : 'email']);
    };
    var closeAuth = function () { closeOverlay(authEl); afterAuth = null; };

    $$('[data-auth-open]').forEach(function (b) {
      b.addEventListener('click', function () { openAuth(b.dataset.authOpen || 'in'); });
    });
    $$('[data-auth-close]').forEach(function (b) { b.addEventListener('click', closeAuth); });

    /* ---- show / hide password ---- */
    $$('[data-eye]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = $('input', btn.parentNode);
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-pressed', show ? 'true' : 'false');
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.classList.toggle('is-off', show);
        input.focus();
      });
    });

    /* ---- session ---- */
    var titleCase = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    var render = function () {
      var me = load(SKEY, null);
      if (me) {
        signInBtn.hidden = true;
        acct.hidden = false;
        $('[data-acct-initial]').textContent = (me.name || me.email).trim().charAt(0).toUpperCase();
        $('[data-acct-email]').textContent = me.email;
      } else {
        signInBtn.hidden = false;
        acct.hidden = true;
        acctMenu.hidden = true;
        $('[data-acct-toggle]').setAttribute('aria-expanded', 'false');
      }
      return me;
    };

    var signIn = function (user) {
      save(SKEY, user);
      var accounts = load(AKEY, []).filter(function (a) { return a.email !== user.email; });
      accounts.push(user);          // display name + email only, never a password
      save(AKEY, accounts);
      render();
    };

    // Swap this for a real request. Reject with an Error whose message is
    // safe to show, e.g. fetch('/api/auth/'+mode, {...}).then(r => r.json())
    var submit = function (mode, data) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          var known = load(AKEY, []).filter(function (a) { return a.email === data.email; })[0];
          resolve({
            email: data.email,
            name: data.name || (known && known.name) || titleCase(data.email.split('@')[0])
          });
        }, 750);
      });
    };

    Object.keys(forms).forEach(function (mode) {
      var form = forms[mode];
      var go = $('.af__go', form);
      var note = $('[data-note]', form);

      // validate on blur, and clear the error as soon as they start fixing it
      $$('input', form).forEach(function (input) {
        var name = input.name;
        if (!rules[name]) return;
        input.addEventListener('blur', function () {
          if (input.type === 'checkbox' || input.value) checkField(form, mode, name);
        });
        input.addEventListener('input', function () {
          if (input.getAttribute('aria-invalid')) setErr(form, name, '');
          if (note.textContent) { note.textContent = ''; note.classList.remove('is-err'); }
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = validate(form, mode);
        if (bad) { bad.focus(); return; }

        go.classList.add('is-busy');
        go.disabled = true;
        note.textContent = '';
        note.classList.remove('is-err');

        var data = {
          email: form.elements.email.value.trim().toLowerCase(),
          name: form.elements.name ? form.elements.name.value.trim() : ''
        };

        submit(mode, data).then(function (user) {
          signIn(user);
          note.textContent = mode === 'up'
            ? 'Account created. Welcome to monq., ' + user.name + '.'
            : 'Signed in. Good to see you, ' + user.name + '.';
          form.reset();
          pwWrap.hidden = true;
          setTimeout(function () {
            var resume = afterAuth;
            closeAuth();
            if (resume === 'cart') setTimeout(openCart, 320);
            else if (resume === 'checkout') { window.location.href = 'checkout.html'; }
            if (typeof syncCheckoutView === 'function') syncCheckoutView();
          }, 900);
        }).catch(function (err) {
          note.textContent = (err && err.message) || 'Something went wrong. Please try again.';
          note.classList.add('is-err');
        }).then(function () {
          go.classList.remove('is-busy');
          go.disabled = false;
        });
      });
    });

    /* ---- forgot password ---- */
    // No mail is sent — this is the UI state only. Wire it to your
    // password-reset endpoint alongside submit() above.
    $('[data-forgot]').addEventListener('click', function () {
      var form = forms.in, note = $('[data-note]', form);
      if (checkField(form, 'in', 'email')) { form.elements.email.focus(); return; }
      note.classList.remove('is-err');
      note.textContent = 'If that email is registered, reset instructions are on their way.';
    });

    /* ---- account menu ---- */
    var acctBtn = $('[data-acct-toggle]');
    acctBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = acctMenu.hidden;
      acctMenu.hidden = !open;
      acctBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    addEventListener('click', function (e) {
      if (!acctMenu.hidden && !acct.contains(e.target)) {
        acctMenu.hidden = true;
        acctBtn.setAttribute('aria-expanded', 'false');
      }
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !acctMenu.hidden) {
        acctMenu.hidden = true;
        acctBtn.setAttribute('aria-expanded', 'false');
        acctBtn.focus();
      }
    });
    $('[data-acct-orders]').addEventListener('click', function () {
      acctMenu.hidden = true;
      acctBtn.setAttribute('aria-expanded', 'false');
      openCart();
    });
    var acctTrack = $('[data-acct-track]');
    if (acctTrack) {
      acctTrack.addEventListener('click', function () { window.location.href = 'track-order.html'; });
    }
    $('[data-signout]').addEventListener('click', function () {
      try { localStorage.removeItem(SKEY); } catch (err) {}
      render();
      signInBtn.focus();
    });

    /* ---- checkout asks for an account first, then goes to checkout.html.
       $$ (not $) because the same [data-checkout] attribute appears on
       both the drawer's button and, on cart.html, the full page's own
       summary button -- querySelector would only ever wire the first. ---- */
    $$('[data-checkout]').forEach(function (checkout) {
      checkout.addEventListener('click', function () {
        if (render()) { window.location.href = 'checkout.html'; return; }  // already signed in
        afterAuth = 'checkout';
        closeCart();
        setTimeout(function () {
          openAuth('in');
          var note = $('[data-note]', forms.in);
          note.classList.remove('is-err');
          note.textContent = 'Sign in to complete your order.';
        }, 320);
      });
    });

    render();
  }

  /* ==========================================================
     ORDERS
     Front-end only order records, saved under OKEY so the checkout
     and order-tracking pages can both read them. There is no server
     here -- swap the setTimeout in the checkout submit handler for a
     real request to make this live.
     ========================================================== */
  var OKEY = 'monq.orders';
  var makeOrderId = function () {
    return 'MQ' + Date.now().toString(36).toUpperCase().slice(-6);
  };

  /* ==========================================================
     CHECKOUT PAGE  (checkout.html)
     ========================================================== */
  var coPage = $('[data-checkout-page]');
  if (coPage) {
    var coGate    = $('[data-checkout-gate]');
    var coEmptyEl = $('[data-checkout-empty]');
    var coMain    = $('[data-checkout-main]');
    var coConfirm = $('[data-checkout-confirm]');
    var coItemsEl = $('[data-checkout-items]');
    var coSub     = $('[data-checkout-subtotal]');
    var coShip    = $('[data-checkout-shipping]');
    var coTot     = $('[data-checkout-total]');
    var coForm    = $('[data-checkout-form]');

    var paintCheckoutSummary = function () {
      if (!coItemsEl) return { sum: 0, ship: 0 };
      coItemsEl.innerHTML = '';
      var sum = 0;
      items.forEach(function (it) {
        sum += it.price * it.qty;
        var row = document.createElement('div');
        row.className = 'summary__item';
        var a = document.createElement('span'), b = document.createElement('span');
        a.textContent = it.name + ' \u00d7 ' + it.qty;
        b.textContent = money(it.price * it.qty);
        row.appendChild(a); row.appendChild(b);
        coItemsEl.appendChild(row);
      });
      var ship = (sum === 0 || sum >= FREE_SHIP_AT) ? 0 : SHIP_FEE;
      if (coSub)  coSub.textContent  = money(sum);
      if (coShip) coShip.textContent = sum === 0 ? '\u2014' : (ship === 0 ? 'Free' : money(ship));
      if (coTot)  coTot.textContent  = money(sum + ship);
      return { sum: sum, ship: ship };
    };

    var syncCheckoutView = function () {
      var me = load(SKEY, null);
      var hasItems = items.length > 0;
      if (coGate)    coGate.hidden    = !!me;
      if (coEmptyEl) coEmptyEl.hidden = !me || !hasItems;
      if (coMain)    coMain.hidden    = !me || !hasItems;
      if (me && hasItems) paintCheckoutSummary();
    };
    syncCheckoutView();

    $$('[data-checkout-signin]').forEach(function (b) {
      b.addEventListener('click', function () { openAuth('in'); });
    });

    if (coForm) {
      var coEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      var coRules = {
        name:    function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
        email:   function (v) { return coEmailRe.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
        address: function (v) { return v.trim().length >= 4 ? '' : 'Please enter your street address.'; },
        city:    function (v) { return v.trim().length >= 2 ? '' : 'Please enter your city.'; },
        state:   function (v) { return v.trim().length >= 2 ? '' : 'Please enter your state.'; },
        zip:     function (v) { return /^[0-9A-Za-z\- ]{4,10}$/.test(v.trim()) ? '' : 'Please enter a valid postal code.'; },
        phone:   function (v) { return v.trim().length >= 7 ? '' : 'Please enter a phone number.'; }
      };
      var coSetErr = function (name, msg) {
        var box = $('[data-err="' + name + '"]', coForm);
        var input = coForm.elements[name];
        if (box) { box.textContent = msg; box.classList.toggle('is-on', !!msg); }
        if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
      };
      var coCheck = function (name) {
        var input = coForm.elements[name];
        if (!input || !coRules[name]) return '';
        var msg = coRules[name](input.value);
        coSetErr(name, msg);
        return msg;
      };
      $$('input', coForm).forEach(function (input) {
        var name = input.name;
        if (!coRules[name]) return;
        input.addEventListener('blur', function () { if (input.value) coCheck(name); });
        input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) coSetErr(name, ''); });
      });

      var coGo = $('.af__go', coForm);
      coForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = null;
        Object.keys(coRules).forEach(function (name) {
          var msg = coCheck(name);
          if (msg && !bad) bad = coForm.elements[name];
        });
        if (bad) { bad.focus(); return; }

        coGo.classList.add('is-busy');
        coGo.disabled = true;

        setTimeout(function () {
          var me = load(SKEY, null);
          var totals = paintCheckoutSummary();
          var order = {
            id: makeOrderId(),
            email: me ? me.email : '',
            date: Date.now(),
            items: items.map(function (it) { return { name: it.name, price: it.price, qty: it.qty }; }),
            subtotal: totals.sum,
            shipping: totals.ship,
            total: totals.sum + totals.ship,
            address: {
              name: coForm.elements.name.value.trim(),
              line1: coForm.elements.address.value.trim(),
              city: coForm.elements.city.value.trim(),
              state: coForm.elements.state.value.trim(),
              zip: coForm.elements.zip.value.trim()
            }
          };
          var orders = load(OKEY, []);
          orders.unshift(order);
          save(OKEY, orders);

          items.length = 0;
          paint();

          if (coMain) coMain.hidden = true;
          if (coConfirm) {
            coConfirm.hidden = false;
            var idEl = $('[data-confirm-id]', coConfirm);
            if (idEl) idEl.textContent = order.id;
            var trackLink = $('[data-confirm-track]', coConfirm);
            if (trackLink) trackLink.href = 'track-order.html?order=' + encodeURIComponent(order.id);
          }

          coGo.classList.remove('is-busy');
          coGo.disabled = false;
        }, 900);
      });
    }
  }

  /* ==========================================================
     TRACK ORDER PAGE  (track-order.html)
     Shows the signed-in user's own orders, plus a guest lookup by
     order number + email against every order ever placed on this
     browser (there is no server, so that is the realistic scope).
     ========================================================== */
  var trPage = $('[data-track-page]');
  if (trPage) {
    var STAGES = ['Placed', 'Packed', 'Shipped', 'Delivered'];
    var STAGE_TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var stageFor = function (order) {
      var hrs = (Date.now() - order.date) / 36e5;
      if (hrs < 2) return 0;
      if (hrs < 24) return 1;
      if (hrs < 96) return 2;
      return 3;
    };

    var renderOrderCard = function (order) {
      var stage = stageFor(order);
      var card = document.createElement('article');
      card.className = 'order-card';

      var head = document.createElement('div');
      head.className = 'order-card__head';
      head.innerHTML =
        '<div><p class="order-card__id">Order ' + esc(order.id) + '</p>' +
        '<p class="order-card__date">' + esc(new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) + '</p></div>' +
        '<span class="order-card__status">' + esc(STAGES[stage]) + '</span>';
      card.appendChild(head);

      var tl = document.createElement('div');
      tl.className = 'timeline';
      var bar = document.createElement('div');
      bar.className = 'timeline__bar';
      bar.style.setProperty('--pct', (stage / (STAGES.length - 1) * 100) + '%');
      tl.appendChild(bar);
      STAGES.forEach(function (label, i) {
        var step = document.createElement('div');
        step.className = 'timeline__step' + (i <= stage ? ' is-done' : '');
        step.innerHTML = '<span class="timeline__dot">' + (i <= stage ? STAGE_TICK : '') + '</span><span class="timeline__l">' + label + '</span>';
        tl.appendChild(step);
      });
      card.appendChild(tl);

      var itemsWrap = document.createElement('div');
      itemsWrap.className = 'order-card__items';
      order.items.forEach(function (it) {
        var row = document.createElement('div');
        row.className = 'summary__item';
        var a = document.createElement('span'), b = document.createElement('span');
        a.textContent = it.name + ' \u00d7 ' + it.qty;
        b.textContent = money(it.price * it.qty);
        row.appendChild(a); row.appendChild(b);
        itemsWrap.appendChild(row);
      });
      var totRow = document.createElement('div');
      totRow.className = 'summary__row summary__row--tot';
      totRow.innerHTML = '<span>Total</span><span>' + money(order.total) + '</span>';
      itemsWrap.appendChild(totRow);
      card.appendChild(itemsWrap);

      return card;
    };

    var trMine      = $('[data-track-mine]');
    var trMineList  = $('[data-track-mine-list]');
    var trMineEmpty = $('[data-track-mine-empty]');

    var paintMine = function () {
      var me = load(SKEY, null);
      if (!trMine) return;
      if (!me) { trMine.hidden = true; return; }
      trMine.hidden = false;
      var mine = load(OKEY, []).filter(function (o) { return o.email === me.email; });
      if (trMineList) {
        trMineList.innerHTML = '';
        mine.forEach(function (o) { trMineList.appendChild(renderOrderCard(o)); });
      }
      if (trMineEmpty) trMineEmpty.hidden = mine.length > 0;
    };
    paintMine();

    var trForm     = $('[data-track-form]');
    var trResult   = $('[data-track-result]');
    var trNotFound = $('[data-track-notfound]');

    if (trForm) {
      trForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var id = trForm.elements.orderId.value.trim();
        var email = trForm.elements.email.value.trim();
        var order = load(OKEY, []).filter(function (o) {
          return o.id.toLowerCase() === id.toLowerCase() && o.email.toLowerCase() === email.toLowerCase();
        })[0];
        if (trResult) trResult.innerHTML = '';
        if (order) {
          if (trResult) { trResult.hidden = false; trResult.appendChild(renderOrderCard(order)); }
          if (trNotFound) trNotFound.hidden = true;
        } else {
          if (trResult) trResult.hidden = true;
          if (trNotFound) trNotFound.hidden = false;
        }
      });

      // arriving from the checkout confirmation's "track your order" link
      var qOrder = new URLSearchParams(window.location.search).get('order');
      if (qOrder) trForm.elements.orderId.value = qOrder;
    }
  }

  /* ==========================================================
     3D PRODUCT VIEWER — lazy bootstrap
     three.js is ~400 KB, so it is never in the critical path: the
     module is dynamically imported only when the viewer approaches
     the viewport, and only after a WebGL context has been confirmed.
     Until then (and forever, if WebGL is unavailable, the device is
     low-power, or reduced motion is requested) the image-sequence
     fallback below is what the visitor gets.
     ========================================================== */
  var stage3d = $('[data-spin3d]');
  if (stage3d) {
    var hasWebGL = (function () {
      try {
        var c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
          (c.getContext('webgl2') || c.getContext('webgl')));
      } catch (e) { return false; }
    })();
    // don't spend 400 KB + a GPU context on a 2-core phone
    var lowPower = (navigator.hardwareConcurrency || 4) <= 2 ||
                   (navigator.connection && navigator.connection.saveData);

    if (hasWebGL && !lowPower && !reduce && 'IntersectionObserver' in window) {
      var booted = false;
      var boot = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting || booted) return;
        booted = true;
        boot.disconnect();
        import('./viewer3d.js')
          .then(function (mod) {
            mod.mount($('[data-gl]', stage3d), { texture: 'assets/img/pack-0.webp' });
            stage3d.classList.add('is-3d');
            // the fallback's drag handler and auto-spin are now redundant
            var fb = $('[data-spin]', stage3d);
            if (fb) { fb.removeAttribute('tabindex'); fb.setAttribute('aria-hidden', 'true'); }
            if (window.__monqStopSpin) window.__monqStopSpin();
          })
          .catch(function (err) {
            // any failure leaves the working image fallback in place
            console.warn('[monq.] 3D viewer unavailable, using image fallback:', err);
          });
      }, { rootMargin: '400px 0px' });   // start loading before it is on screen
      boot.observe(stage3d);
    }
  }

  /* ==========================================================
     POUR / DISSOLVE LOOP  —  lazy bootstrap
     Same gating as the 3D product viewer: WebGL confirmed, not
     reduced-motion, not a low-power device, dynamic import only once
     the widget nears the viewport. The image fallback underneath is
     fully valid markup on its own if any of that fails.
     ========================================================== */
  var pourStage = $('[data-pour-stage]');
  if (pourStage) {
    var hasWebGL2 = (function () {
      try {
        var c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
      } catch (e) { return false; }
    })();
    var lowPower2 = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.connection && navigator.connection.saveData);

    if (hasWebGL2 && !lowPower2 && !reduce && 'IntersectionObserver' in window) {
      var pourBooted = false;
      var pourBoot = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting || pourBooted) return;
        pourBooted = true;
        pourBoot.disconnect();
        import('./pourAnim.js')
          .then(function (mod) {
            mod.mount($('[data-pour-gl]', pourStage));
            pourStage.classList.add('is-3d');
          })
          .catch(function (err) {
            console.warn('[monq.] pour animation unavailable, using image fallback:', err);
          });
      }, { rootMargin: '400px 0px' });
      pourBoot.observe(pourStage);
    }
  }

  /* ==========================================================
     3D TILT ON HOVER  —  product cards
     Cursor position relative to the card centre drives rotateX/rotateY,
     capped at MAX_TILT so it stays a suggestion rather than a stunt. The
     drop shadow direction is derived from the same vector, so the card
     reads as lit from where the cursor is. Pointer-fine only; touch
     devices never get a hover state and are skipped entirely.
     ========================================================== */
  var MAX_TILT = 9;   // degrees
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.prod').forEach(function (card) {
      var gloss = document.createElement('span');
      gloss.className = 'prod__gloss';
      gloss.setAttribute('aria-hidden', 'true');
      card.appendChild(gloss);

      var rect = null;
      var tQueued = false;
      var px = 0, py = 0;

      var apply = function () {
        tQueued = false;
        if (!rect) return;
        // -1..1 from card centre
        var nx = (px - rect.left) / rect.width * 2 - 1;
        var ny = (py - rect.top) / rect.height * 2 - 1;
        nx = clamp(nx, -1, 1); ny = clamp(ny, -1, 1);

        var rotY = nx * MAX_TILT;
        var rotX = -ny * MAX_TILT;
        card.style.transform =
          'perspective(1100px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' +
          rotY.toFixed(2) + 'deg) translateZ(14px)';
        // shadow opposes the tilt, as if cast by the light the card leans into
        card.style.boxShadow =
          (-nx * 22).toFixed(1) + 'px ' + (18 - ny * 12).toFixed(1) +
          'px 42px rgba(8,5,2,.5)';
        gloss.style.setProperty('--gx', (((px - rect.left) / rect.width) * 100).toFixed(1) + '%');
        gloss.style.setProperty('--gy', (((py - rect.top) / rect.height) * 100).toFixed(1) + '%');
      };

      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        rect = card.getBoundingClientRect();     // measured once per enter, not per move
        card.classList.add('is-tilting');
        px = e.clientX; py = e.clientY;
        apply();
      });

      card.addEventListener('pointermove', function (e) {
        if (!rect) return;
        px = e.clientX; py = e.clientY;
        if (tQueued) return;
        tQueued = true;
        requestAnimationFrame(apply);
      });

      var release = function () {
        rect = null;
        card.classList.remove('is-tilting');    // restores the eased transition
        card.style.transform = '';
        card.style.boxShadow = '';
      };
      card.addEventListener('pointerleave', release);
      card.addEventListener('pointercancel', release);
    });
  }

  /* ==========================================================
     SCROLL DEPTH PARALLAX
     Layers declare [data-par="<speed>"]; negative moves against the
     scroll (background, slowest), positive with it (foreground text,
     fastest). Only sections currently intersecting are animated, and
     all writes happen inside one rAF — no scroll-handler layout work.
     ========================================================== */
  if (!reduce) {
    var parLayers = $$('[data-par]').map(function (el) {
      var host = el.closest('section') || el.parentElement;
      return { el: el, host: host, speed: parseFloat(el.dataset.par) || 0, live: false };
    });

    if (parLayers.length) {
      var live = [];
      var parQueued = false;

      var parFrame = function () {
        parQueued = false;
        var vh = innerHeight;
        live.forEach(function (o) {
          var r = o.host.getBoundingClientRect();
          // progress: -1 (section below viewport) .. 1 (above it)
          var p = clamp((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1, 1);
          // cap keeps layers from ever sliding far enough to collide
          var shift = clamp(p * o.speed * 100, -90, 90);
          o.el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
        });
        if (live.length) parQueued = true, requestAnimationFrame(parFrame);
      };

      var parObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          parLayers.forEach(function (o) {
            if (o.host !== en.target) return;
            o.live = en.isIntersecting;
          });
        });
        live = parLayers.filter(function (o) { return o.live; });
        if (live.length && !parQueued) { parQueued = true; requestAnimationFrame(parFrame); }
      }, { rootMargin: '10% 0px 10% 0px' });

      // observe each distinct host once
      parLayers.map(function (o) { return o.host; })
        .filter(function (h, i, a) { return h && a.indexOf(h) === i; })
        .forEach(function (h) { parObs.observe(h); });
    }
  }

  /* ==========================================================
     SUBSCRIBE & SAVE
     Each product card carries its own mode (one-time / subscription)
     and cadence. The card is the source of truth for price, so the
     cart reads it at add time rather than a static data-price.
     ========================================================== */
  var SUB_OFF = 0.15;   // 15% off on subscription
  $$('[data-product]').forEach(function (card) {
    var base    = parseFloat(card.dataset.price);
    var msrp    = parseFloat(card.dataset.msrp);   // optional compare-at price
    var out     = $('[data-price-out]', card);
    var was     = $('[data-was]', card);
    var msrpOut = $('[data-msrp-out]', card);
    var saveOut = $('[data-save-out]', card);
    var cadence = $('[data-cadence]', card);
    var modes   = $$('.buy__mode', card);
    var opts    = $$('.buy__opt', card);

    var paintPrice = function () {
      var sub = card.dataset.mode === 'sub';
      var now = sub ? base * (1 - SUB_OFF) : base;
      out.textContent = '$' + (now % 1 ? now.toFixed(2) : now);
      was.textContent = '$' + base;
      was.hidden = !sub;
      cadence.classList.toggle('is-on', sub);

      // compare-at (MSRP) sale badge — one-time mode only, so it never
      // competes visually with the subscribe was/now pair above
      if (msrpOut && saveOut && !isNaN(msrp) && msrp > base) {
        var show = !sub;
        msrpOut.hidden = !show;
        saveOut.hidden = !show;
        if (show) {
          msrpOut.textContent = '$' + msrp;
          saveOut.textContent = 'Save ' + Math.round((1 - base / msrp) * 100) + '%';
        }
      }
    };

    modes.forEach(function (b) {
      b.addEventListener('click', function () {
        card.dataset.mode = b.dataset.mode;
        modes.forEach(function (m) {
          var on = m === b;
          m.classList.toggle('is-on', on);
          m.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        paintPrice();
      });
    });

    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        card.dataset.weeks = b.dataset.weeks;
        opts.forEach(function (o) { o.classList.toggle('is-on', o === b); });
      });
    });

    card.dataset.mode = 'once';
    card.dataset.weeks = '4';
    paintPrice();
  });

  /* ==========================================================
     REVIEWS
     Three columns drift on a CSS animation loop (hover/focus already
     pauses them via CSS) -- this replaced the old scroll-snap track and
     its page arrows. This just wires the manual toggle button, required
     since WCAG 2.2.2 asks for a stop control on any auto-moving content
     that runs longer than five seconds, on top of the hover pause.
     ========================================================== */
  var wall = $('.wall');
  if (wall) {
    var wallBtn = $('[data-wall-pause]', wall);
    var wallPauseIc = $('[data-wall-ic-pause]', wall);
    var wallPlayIc = $('[data-wall-ic-play]', wall);
    var wallLabel = $('[data-wall-pause-label]', wall);
    if (wallBtn) {
      var setWallPaused = function (paused) {
        wall.classList.toggle('is-paused', paused);
        wallBtn.setAttribute('aria-pressed', String(paused));
        if (wallPauseIc) wallPauseIc.hidden = paused;
        if (wallPlayIc) wallPlayIc.hidden = !paused;
        if (wallLabel) wallLabel.textContent = paused ? 'Play' : 'Pause';
      };
      wallBtn.addEventListener('click', function () {
        setWallPaused(!wall.classList.contains('is-paused'));
      });
      setWallPaused(reduce);
    }
  }

  /* ==========================================================
     INTERACTIVE COMPARISON
     Two teaspoons (~8 g) of sweetener per cup. Cane sugar is
     3.87 kcal/g with a glycemic index of 65; monk fruit and
     artificial sweeteners are both zero on both counts — the
     difference between those two is the ingredient list, which
     the copy below the figures carries.
     ========================================================== */
  var calc = $('[data-calc]');
  if (calc) {
    var G_PER_CUP  = 8;        // ~2 tsp
    var KCAL_PER_G = 3.87;     // cane sugar
    var GI_SUGAR   = 65;
    var range = $('[data-cups-input]', calc);
    var cupsOut = $('[data-cups]', calc);
    var say = $('[data-calc-say]', calc);
    var outs = {};
    $$('[data-out]', calc).forEach(function (el) { outs[el.dataset.out] = el; });

    var fmt = function (n) { return Math.round(n).toLocaleString(); };

    var render = function () {
      var cups = parseInt(range.value, 10);
      var gPerDay = cups * G_PER_CUP;
      var kcalYear = gPerDay * KCAL_PER_G * 365;
      var kgYear = gPerDay * 365 / 1000;
      // glycemic load = GI x available carb (g) / 100
      var glSugar = GI_SUGAR * gPerDay / 100;

      cupsOut.textContent = cups;
      range.style.setProperty('--pct', ((cups - 1) / 9 * 100).toFixed(1) + '%');

      outs['monq-cal'].textContent = '0';
      outs['monq-gl'].textContent = '0';
      outs['monq-sugar'].textContent = '0 kg';
      outs['art-cal'].textContent = '0';
      outs['art-gl'].textContent = '0';
      outs['art-sugar'].textContent = '0 kg';
      outs['sugar-cal'].textContent = fmt(kcalYear);
      outs['sugar-gl'].textContent = fmt(glSugar);
      outs['sugar-sugar'].textContent = kgYear.toFixed(1) + ' kg';

      say.innerHTML = 'At ' + cups + ' cup' + (cups === 1 ? '' : 's') + ' a day, choosing monq. over cane sugar leaves out <b>' +
        fmt(kcalYear) + ' calories</b> and <b>' + kgYear.toFixed(1) + ' kg of sugar</b> a year.';
    };

    range.addEventListener('input', render);
    render();
  }

  /* ==========================================================
     ACCORDION  —  FAQ
     Each .acc group opens one item at a time. The panel's max-height
     is measured from its content so the open/close transition animates
     smoothly regardless of answer length; no [hidden] on the panel
     itself, since the answers hold no focusable content of their own.
     ========================================================== */
  $$('.acc').forEach(function (acc) {
    var items = $$('.acc__item', acc);
    var closeItem = function (item) {
      var q = $('.acc__q', item), a = $('.acc__a', item);
      q.setAttribute('aria-expanded', 'false');
      a.style.maxHeight = '0px';
    };
    var openItem = function (item) {
      var q = $('.acc__q', item), a = $('.acc__a', item);
      q.setAttribute('aria-expanded', 'true');
      a.style.maxHeight = a.scrollHeight + 'px';
    };
    items.forEach(function (item) {
      var q = $('.acc__q', item);
      q.addEventListener('click', function () {
        var isOpen = q.getAttribute('aria-expanded') === 'true';
        items.forEach(closeItem);
        if (!isOpen) openItem(item);
      });
    });
    // keep an open panel's height correct if content reflows (e.g. font load, resize)
    addEventListener('resize', function () {
      items.forEach(function (item) {
        var q = $('.acc__q', item), a = $('.acc__a', item);
        if (q.getAttribute('aria-expanded') === 'true') a.style.maxHeight = a.scrollHeight + 'px';
      });
    });
  });

  /* ==========================================================
     CONTACT FORM

     FRONT END ONLY, same shape as the auth forms above: blur-validate,
     inline errors tied to each field via aria-describedby, then a
     loading -> success state on submit(). Point submit() at a real
     endpoint (e.g. fetch('/api/contact', {...})) to make it live.
     ========================================================== */
  var ctForm = $('[data-contact]');
  if (ctForm) {
    var ctEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var ctRules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name.'; },
      email: function (v) { return ctEmailRe.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      subject: function (v) { return v.trim().length >= 3 ? '' : 'Please add a short subject.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Please write a few more words so we know how to help.'; }
    };

    var ctSetErr = function (name, msg) {
      var box = $('[data-err="' + name + '"]', ctForm);
      var input = ctForm.elements[name];
      if (box) { box.textContent = msg; box.classList.toggle('is-on', !!msg); }
      if (input) {
        if (msg) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    };

    var ctCheck = function (name) {
      var input = ctForm.elements[name];
      if (!input || !ctRules[name]) return '';
      var msg = ctRules[name](input.value);
      ctSetErr(name, msg);
      return msg;
    };

    var ctGo = $('.af__go', ctForm);
    var ctNote = $('[data-note]', ctForm);

    $$('input,textarea', ctForm).forEach(function (input) {
      var name = input.name;
      if (!ctRules[name]) return;
      input.addEventListener('blur', function () { if (input.value) ctCheck(name); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid')) ctSetErr(name, '');
        if (ctNote.textContent) { ctNote.textContent = ''; ctNote.classList.remove('is-err'); }
      });
    });

    ctForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      Object.keys(ctRules).forEach(function (name) {
        var msg = ctCheck(name);
        if (msg && !bad) bad = ctForm.elements[name];
      });
      if (bad) { bad.focus(); return; }

      ctGo.classList.add('is-busy');
      ctGo.disabled = true;
      ctNote.textContent = '';
      ctNote.classList.remove('is-err');

      setTimeout(function () {
        ctNote.textContent = 'Thank you — we’ll be in touch within one business day.';
        ctForm.reset();
        ctGo.classList.remove('is-busy');
        ctGo.disabled = false;
      }, 750);
    });
  }

  /* ==========================================================
     NEWSLETTER
     ========================================================== */
  var nl = $('[data-nl]');
  if (nl) {
    var msg = $('[data-nl-msg]');
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#email').value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      msg.classList.toggle('is-err', !ok);
      msg.textContent = ok
        ? 'Thank you. Check your inbox for a welcome note.'
        : 'Please enter a valid email address.';
      if (ok) nl.reset();
    });
  }
})();
