/* =========================================================
   МойДекларант — script.js
   Header scroll state, mobile menu, smooth anchors, request
   modal, expandable service cards, sliders, stat counters,
   scroll-reveal animations, language switcher.
   ========================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Hero photo carousel ----------
     Cross-fades between background photos every 7s. Images after the
     first are lazy-loaded so the hero paints fast. Pauses when the tab
     is hidden or the hero is scrolled out of view. */
  (function heroCarousel() {
    var wrap = document.getElementById('heroSlides');
    if (!wrap) return;
    var slides = Array.prototype.slice.call(wrap.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;

    var dotsHost = document.getElementById('heroDots');
    var index = 0;
    var timer = null;
    var INTERVAL = 7000;

    function loadSlide(i) {
      var img = slides[i] && slides[i].querySelector('img[data-src]');
      if (img) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      }
    }
    // preload the next one so the fade never reveals a blank frame
    function preloadNext(i) { loadSlide((i + 1) % slides.length); }

    var dots = [];
    if (dotsHost) {
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'Изображение ' + (i + 1));
        d.addEventListener('click', function () { show(i); restart(); });
        dotsHost.appendChild(d);
        dots.push(d);
      });
    }

    function show(i) {
      if (i === index) return;
      loadSlide(i);
      slides[index].classList.remove('is-active');
      slides[i].classList.add('is-active');
      if (dots.length) {
        dots[index].classList.remove('is-active');
        dots[i].classList.add('is-active');
      }
      index = i;
      preloadNext(i);
    }
    function next() { show((index + 1) % slides.length); }
    function start() {
      if (timer !== null || prefersReducedMotion) return;
      timer = setInterval(next, INTERVAL);
    }
    function stop() { if (timer !== null) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    preloadNext(0);
    start();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0 }).observe(wrap);
    }
  })();

  /* ---------- Header scroll shadow ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 6);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Smooth anchor scroll with header offset ---------- */
  function scrollToHash(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    var headerH = header ? header.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
    window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var hash = a.getAttribute('href');
    if (!hash || hash === '#' || hash.length < 2) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      scrollToHash(hash);
      history.pushState(null, '', hash);
    });
  });

  /* ---------- Mobile menu ---------- */
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  var mobileMenuClose = document.getElementById('mobileMenuClose');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuBackdrop.hidden = false;
    requestAnimationFrame(function () { mobileMenuBackdrop.classList.add('is-open'); });
    document.body.classList.add('no-scroll');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuBackdrop.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    if (window.__closeLangMenu) window.__closeLangMenu();
    setTimeout(function () { if (mobileMenuBackdrop) mobileMenuBackdrop.hidden = true; }, 250);
  }
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMobileMenu(); closeModal(); }
  });

  /* ---------- Expandable service / free-service cards ---------- */
  document.querySelectorAll('.card-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.service-card, .free-card');
      if (!card) return;
      var isOpen = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      var label = btn.querySelector('span');
      if (label) {
        var openKey = 'common.less', closeKey = 'common.more';
        label.setAttribute('data-i18n', isOpen ? openKey : closeKey);
        label.textContent = translate(isOpen ? openKey : closeKey);
      }
      if (isOpen) {
        // Let the expand transition run, then ensure the opened content is in view.
        setTimeout(function () {
          var headerH = header ? header.offsetHeight : 0;
          var rect = card.getBoundingClientRect();
          var viewportH = window.innerHeight;
          if (rect.bottom > viewportH) {
            var delta = Math.min(rect.bottom - viewportH + 24, rect.top - headerH - 16);
            window.scrollBy({ top: Math.max(delta, 0), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          } else if (rect.top < headerH) {
            window.scrollBy({ top: rect.top - headerH - 16, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          }
        }, 340);
      }
    });
  });

  /* ---------- Sliders (directions / partners) ---------- */
  document.querySelectorAll('[data-slider-arrows]').forEach(function (group) {
    var trackId = group.getAttribute('data-slider-arrows');
    var track = document.getElementById(trackId);
    if (!track) return;
    var buttons = group.querySelectorAll('.slider-arrow');
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      buttons[0].disabled = track.scrollLeft <= 2;
      buttons[1].disabled = track.scrollLeft >= max;
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var dir = parseInt(b.getAttribute('data-dir'), 10);
        var card = track.querySelector(':scope > *');
        var step = card ? card.getBoundingClientRect().width + 18 : 220;
        track.scrollBy({ left: dir * step * 2, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Stat counters (animate on scroll into view) ---------- */
  var statEls = document.querySelectorAll('.stat-number');
  if (statEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterObserver.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (prefersReducedMotion) { el.textContent = target.toLocaleString('ru-RU') + suffix; return; }
        var start = null;
        var duration = 1400;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = Math.round(eased * target);
          el.textContent = value.toLocaleString('ru-RU') + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Scroll-reveal ----------
     IntersectionObserver handles the normal case. A throttled scroll
     sweep guarantees nothing is ever left invisible if the observer
     misses an element during a fast jump (anchor link, End key, etc.). */
  var revealEls = document.querySelectorAll('[data-reveal]');
  function revealNow(el) { el.classList.add('is-visible'); }

  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var sweepScheduled = false;
    function sweepReveals() {
      sweepScheduled = false;
      var vh = window.innerHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var r = el.getBoundingClientRect();
        // Reveal anything at or above the fold line — this covers elements
        // currently on screen AND elements the user has already scrolled
        // past (which must not stay invisible when scrolling back up).
        if (r.top < vh - 20) {
          revealNow(el);
          revealObserver.unobserve(el);
        }
      });
    }
    function scheduleSweep() {
      if (sweepScheduled) return;
      sweepScheduled = true;
      requestAnimationFrame(sweepReveals);
    }
    window.addEventListener('scroll', scheduleSweep, { passive: true });
    window.addEventListener('resize', scheduleSweep);
    window.addEventListener('load', scheduleSweep);
    scheduleSweep();
  } else {
    revealEls.forEach(revealNow);
  }

  /* ---------- Request modal ---------- */
  var modalOverlay = document.getElementById('modalOverlay');
  var modalClose = document.getElementById('modalClose');
  var modalCloseSuccess = document.getElementById('modalCloseSuccess');
  var modalFormState = document.getElementById('modalFormState');
  var modalSuccessState = document.getElementById('modalSuccessState');
  var requestForm = document.getElementById('requestForm');
  var lastFocusedEl = null;

  function openModal() {
    if (!modalOverlay) return;
    if (window.__closeLangMenu) window.__closeLangMenu();
    lastFocusedEl = document.activeElement;
    modalOverlay.hidden = false;
    requestAnimationFrame(function () { modalOverlay.classList.add('is-open'); });
    document.body.classList.add('no-scroll');
    modalFormState.hidden = false;
    modalSuccessState.hidden = true;
    var firstField = document.getElementById('fName');
    if (firstField) setTimeout(function () { firstField.focus(); }, 200);
  }
  function closeModal() {
    if (!modalOverlay || modalOverlay.hidden) return;
    modalOverlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(function () { modalOverlay.hidden = true; }, 200);
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCloseSuccess) modalCloseSuccess.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  if (requestForm) {
    /* ---------- Telegram bot notification ----------
       Sends a copy of every request straight to the team's Telegram via
       the Bot API, so a lead is captured even if the visitor never
       finishes the WhatsApp step below.

       SECURITY NOTE: a bot token embedded in client-side JS is visible
       to anyone who views the page source — there is no way to hide it
       on a static site without a small server-side proxy. This token
       can only call this bot's own sendMessage-style methods (it can't
       touch the Telegram account that owns the bot), but it can still
       be used by a stranger to spam this chat. This exact token was
       already found published in a public GitHub repository, so it
       should be treated as already exposed — regenerating it via
       @BotFather ("/revoke") and swapping in the new one here is
       recommended regardless of this change. */
    var TELEGRAM_BOT_TOKEN = '8559726245:AAE_DZjrgQKNXm5LzYegwlIyuL-xS8sip3g';
    var TELEGRAM_CHAT_ID = '1126151371';

    function sendToTelegramBot(fields) {
      var lines = [
        '🆕 Новая заявка с сайта МойДекларант',
        '',
        'Имя: ' + fields.name,
        'Телефон: ' + fields.phone
      ];
      if (fields.telegram) lines.push('Telegram: ' + fields.telegram);
      if (fields.comment) lines.push('Комментарий: ' + fields.comment);
      lines.push('Время: ' + new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }));

      return fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join('\n') })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok) console.error('Telegram bot declined the message:', data);
          return !!data.ok;
        })
        .catch(function (err) {
          // Never block the visitor's flow on this — WhatsApp below still
          // carries the lead through if the Telegram call fails.
          console.error('Telegram notify failed:', err);
          return false;
        });
    }

    requestForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('fName').value.trim();
      var phone = document.getElementById('fPhone').value.trim();
      var telegram = document.getElementById('fTelegram').value.trim();
      var comment = document.getElementById('fComment').value.trim();
      var consent = document.getElementById('fConsent').checked;

      if (!name || !phone || !consent) {
        requestForm.reportValidity();
        return;
      }

      // Fire-and-forget: intentionally not awaited, so the WhatsApp
      // window.open() below still fires inside this same click's user
      // gesture rather than after a network round trip (which some
      // browsers would otherwise treat as a blocked popup).
      sendToTelegramBot({ name: name, phone: phone, telegram: telegram, comment: comment });

      var lines = [
        'Заявка с сайта МойДекларант',
        'Имя: ' + name,
        'Телефон: ' + phone
      ];
      if (telegram) lines.push('Telegram: ' + telegram);
      if (comment) lines.push('Комментарий: ' + comment);
      var text = encodeURIComponent(lines.join('\n'));

      // Open WhatsApp with a pre-filled message so the lead reaches the team
      // even though this is a static site with no backend.
      window.open('https://wa.me/998974087003?text=' + text, '_blank', 'noopener');

      modalFormState.hidden = true;
      modalSuccessState.hidden = false;
      requestForm.reset();
    });
  }

  /* =========================================================
     Language switcher
     Covers navigation, hero, section headers/subheaders,
     buttons, footer and contact labels. Detailed card body
     copy (bullet lists, long descriptions) stays in Russian
     across languages.
     ========================================================= */
  var translations = {
    // Russian is the source text in the DOM; this dictionary only holds
    // strings that have no static counterpart there (e.g. the collapsed
    // state of an expandable card).
    ru: {
      'common.more': 'Подробнее',
      'common.less': 'Свернуть'
    },
    en: {
      'tagline': 'Customs services',
      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.free': 'Free services',
      'nav.logistics': 'Logistics',
      'nav.directions': 'Directions',
      'nav.contacts': 'Contacts',
      'nav.cta': 'Get a quote',
      'hero.eyebrow': 'Customs services & logistics in Tashkent',
      'hero.title': 'Your reliable<br>customs partner',
      'hero.lead': 'Professional customs clearance in Tashkent — full declarant support from consultation to cargo release, across Uzbekistan.',
      'hero.cta1': 'Our services',
      'hero.cta2': 'Contact us',
      'benefits.1': 'Reliable clearance',
      'benefits.2': 'Time savings',
      'benefits.3': 'Transparent rates',
      'benefits.4': 'Personal manager',
      'benefits.5': 'Across Uzbekistan and abroad',
      'benefits.6': '24/7 support',
      'about.title': 'About us',
      'about.text': 'We are a team of professional customs declarants in Tashkent, helping businesses clear customs quickly and safely — from the first consultation to cargo release.',
      'common.more': 'Learn more',
      'common.less': 'Show less',
      'stats.1': 'Shipments cleared',
      'stats.2': 'Satisfied clients',
      'stats.3': 'Years on the market',
      'stats.4': 'Hours of support',
      'services.eyebrow': 'Our services',
      'services.title': 'Complete solutions for your business',
      'services.sub': 'A full range of declarant services: customs clearance, consultations and logistics for foreign trade activity.',
      'svc.1.title': 'Customs clearance',
      'svc.1.text': 'Customs clearance for cargo, equipment and goods of any kind, start to finish.',
      'svc.2.title': 'Consultations',
      'svc.2.text': 'Professional advice on customs law and foreign trade.',
      'svc.3.title': 'Goods classification',
      'svc.3.text': 'The correct HS code is the basis for accurate payments.',
      'svc.4.title': 'Contract support',
      'svc.4.text': 'Review and support of foreign trade contracts.',
      'svc.5.title': 'Certification',
      'svc.5.text': 'Confirming goods meet requirements and standards.',
      'svc.6.title': 'Customs value',
      'svc.6.text': 'Accurate calculation with no risk of underpayment or surcharges.',
      'free.eyebrow': 'Free services',
      'free.badge': '100% free',
      'free.title': 'Support at every stage',
      'free.1.title': 'Free consultation',
      'free.1.text': 'Get an initial consultation from our customs specialists.',
      'free.2.title': 'Cost calculation',
      'free.2.text': 'We calculate all possible costs and suggest the best option for your cargo.',
      'free.3.title': '24/7 consultation',
      'free.3.text': 'Prompt support and answers to your questions any time.',
      'logistics.eyebrow': 'Logistics services',
      'logistics.title': 'Full-cycle logistics services',
      'logistics.text': 'We arrange delivery by any mode of transport — road, sea, air and rail — together with our partner KDD Trans.',
      'logistics.cta': 'Learn more',
      'directions.eyebrow': 'Import & export directions',
      'directions.title': 'Popular countries',
      'directions.sub': "We work with the world's leading countries and help arrange import, export and customs clearance of any goods.",
      'dir.cn': 'China', 'dir.tr': 'Turkey', 'dir.ae': 'UAE', 'dir.eu': 'Europe', 'dir.kr': 'Korea',
      'dir.us': 'USA', 'dir.ru': 'Russia', 'dir.kz': 'Kazakhstan', 'dir.in': 'India', 'dir.other': 'Other countries',
      'dir.label': 'import/export',
      'partners.title': 'Our partners',
      'partners.sub': 'Trusted by leading importers and trading companies.',
      'contacts.title': 'Contacts',
      'contacts.sub': 'Reach us any way that is convenient for you.',
      'contacts.phone': 'Phone',
      'contacts.write': 'Message us',
      'contacts.location': 'We are located',
      'contacts.city': 'Tashkent region, Zangiata district, Tariktehar mahalla, Tashkent, Uzbekistan',
      'contacts.showmap': 'Show on map',
      'footer.rights': 'MoyDeklarant. All rights reserved.',
      'footer.privacy': 'Privacy policy',
      'footer.terms': 'Terms of use',
      'legal.privacy.title': 'Privacy Policy',
      'legal.eyebrow': 'Documents',
      'legal.privacy.lead': 'How MoyDeklarant collects, uses and protects the personal data of website visitors and clients.',
      'legal.terms.title': 'Terms of Use',
      'legal.terms.lead': 'The terms and conditions for using the moydeklarant.uz website and its services.',
      'legal.langNote': 'This document is maintained in Russian, the original and authoritative language of the text.',
      'modal.title': 'Send a request',
      'modal.text': 'Leave your contacts — we will get back to you within one business day.',
      'modal.name': 'Your name',
      'modal.phone': 'Phone number',
      'modal.telegram': 'Telegram',
      'modal.optional': '(optional)',
      'modal.comment': 'Comment',
      'modal.consent': 'I agree to the processing of personal data',
      'modal.submit': 'Send request',
      'modal.okTitle': 'Thank you for reaching out!',
      'modal.okText': "We've received your request and will contact you within one business day. WhatsApp will also open so you can send a message directly.",
      'modal.close': 'Close'
    },
    uz: {
      'tagline': 'Bojxona xizmatlari',
      'nav.about': 'Biz haqimizda',
      'nav.services': 'Xizmatlar',
      'nav.free': 'Bepul xizmatlar',
      'nav.logistics': 'Logistika xizmatlari',
      'nav.directions': "Yo'nalishlar",
      'nav.contacts': 'Kontaktlar',
      'nav.cta': "So'rov qoldirish",
      'hero.eyebrow': 'Toshkentda bojxona xizmatlari va logistika',
      'hero.title': 'Sizning ishonchli<br>bojxona hamkoringiz',
      'hero.lead': "Toshkentda professional bojxona rasmiylashtiruvi — konsultatsiyadan yukni chiqarishgacha, O'zbekiston bo'ylab deklarant qo'llab-quvvatlashi.",
      'hero.cta1': 'Xizmatlarimiz',
      'hero.cta2': "Biz bilan bog'laning",
      'benefits.1': 'Ishonchli rasmiylashtiruv',
      'benefits.2': 'Vaqtni tejash',
      'benefits.3': "Shaffof tariflar",
      'benefits.4': "Shaxsiy menejer",
      'benefits.5': "O'zbekiston bo'ylab va chet elda",
      'benefits.6': "24/7 qo'llab-quvvatlash",
      'about.title': 'Biz haqimizda',
      'about.text': "Biz — Toshkentdagi professional deklarantlar jamoasimiz, birlamchi maslahatdan yukni chiqarishgacha bizneslarga bojxona rasmiylashtiruvini tez va xavfsiz o'tishga yordam beramiz.",
      'common.more': "Batafsil",
      'common.less': "Yopish",
      'stats.1': 'Rasmiylashtirilgan yuklar',
      'stats.2': 'Mamnun mijozlar',
      'stats.3': 'Bozordagi yillar',
      'stats.4': "Qo'llab-quvvatlash soati",
      'services.eyebrow': 'Xizmatlarimiz',
      'services.title': 'Biznesingiz uchun kompleks yechimlar',
      'services.sub': "Deklarant xizmatlarining to'liq spektri: bojxona rasmiylashtiruvi, konsultatsiyalar va logistika.",
      'svc.1.title': 'Bojxona rasmiylashtiruvi',
      'svc.1.text': "Har qanday yuk, uskuna va tovarlarni bojxona rasmiylashtiruvi, boshidan oxirigacha.",
      'svc.2.title': 'Konsultatsiyalar',
      'svc.2.text': 'Bojxona qonunchiligi va TIF boʻyicha professional maslahatlar.',
      'svc.3.title': 'Tovarlarni klassifikatsiya qilish',
      'svc.3.text': "To'g'ri TIF TN kodi — to'g'ri to'lovlar asosi.",
      'svc.4.title': 'Shartnomalar bilan ishlash',
      'svc.4.text': 'Tashqi savdo shartnomalarini tekshirish va qoʻllab-quvvatlash.',
      'svc.5.title': 'Sertifikatlash',
      'svc.5.text': "Tovarlarning talablar va standartlarga muvofiqligini tasdiqlash.",
      'svc.6.title': 'Bojxona qiymati',
      'svc.6.text': "Kam baholash yoki qo'shimcha to'lovlar xavfisiz aniq hisob-kitob.",
      'free.eyebrow': 'Bepul xizmatlar',
      'free.badge': '100% bepul',
      'free.title': 'Har bir bosqichda yordam',
      'free.1.title': 'Bepul konsultatsiya',
      'free.1.text': 'Bojxona rasmiylashtiruvi boʻyicha mutaxassislarimizdan birlamchi maslahat oling.',
      'free.2.title': 'Qiymatni hisoblash',
      'free.2.text': 'Barcha mumkin bo\'lgan xarajatlarni hisoblaymiz va yukingiz uchun eng yaxshi yechimni taklif qilamiz.',
      'free.3.title': '24/7 konsultatsiya',
      'free.3.text': "Har qanday vaqtda tezkor yordam va savollaringizga javoblar.",
      'logistics.eyebrow': 'Logistika xizmatlari',
      'logistics.title': "To'liq logistika xizmatlari sikli",
      'logistics.text': "KDD Trans hamkorimiz bilan birgalikda avtomobil, dengiz, havo va temir yo'l transporti orqali yuk yetkazib berishni tashkil qilamiz.",
      'logistics.cta': "Batafsil ma'lumot",
      'directions.eyebrow': 'Import va eksport yoʻnalishlari',
      'directions.title': "Mashhur davlatlar",
      'directions.sub': "Dunyoning yetakchi davlatlari bilan ishlaymiz. Har qanday tovarlarni import, eksport va bojxona rasmiylashtirishda yordam beramiz.",
      'dir.cn': 'Xitoy', 'dir.tr': 'Turkiya', 'dir.ae': 'BAA', 'dir.eu': 'Yevropa', 'dir.kr': 'Koreya',
      'dir.us': 'AQSH', 'dir.ru': 'Rossiya', 'dir.kz': "Qozog'iston", 'dir.in': 'Hindiston', 'dir.other': 'Boshqa davlatlar',
      'dir.label': 'import/eksport',
      'partners.title': 'Hamkorlarimiz',
      'partners.sub': "Yetakchi importchilar va savdo kompaniyalari bizga ishonadi.",
      'contacts.title': 'Kontaktlar',
      'contacts.sub': "Biz bilan qulay usulda bog'laning.",
      'contacts.phone': 'Telefon',
      'contacts.write': 'Bizga yozing',
      'contacts.location': 'Manzilimiz',
      'contacts.city': "Toshkent viloyati, Zangiota tumani, Tariktepar MFY, Toshkent, O'zbekiston",
      'contacts.showmap': "Xaritada ko'rsatish",
      'footer.rights': 'MoyDeklarant. Barcha huquqlar himoyalangan.',
      'footer.privacy': 'Maxfiylik siyosati',
      'footer.terms': 'Foydalanuvchi kelishuvi',
      'legal.privacy.title': 'Maxfiylik siyosati',
      'legal.eyebrow': 'Hujjatlar',
      'legal.privacy.lead': "MoyDeklarant sayt tashrif buyuruvchilari va mijozlarining shaxsiy ma'lumotlarini qanday to'playdi, ishlatadi va himoya qiladi.",
      'legal.terms.title': 'Foydalanuvchi kelishuvi',
      'legal.terms.lead': "moydeklarant.uz saytidan va uning xizmatlaridan foydalanish shartlari.",
      'legal.langNote': "Ushbu hujjat matnning asl va vakolatli tili bo'lgan rus tilida yuritiladi.",
      'modal.title': "So'rov qoldirish",
      'modal.text': "Kontaktlaringizni qoldiring — bir ish kuni ichida siz bilan bog'lanamiz.",
      'modal.name': 'Ismingiz',
      'modal.phone': 'Telefon raqami',
      'modal.telegram': 'Telegram',
      'modal.optional': '(ixtiyoriy)',
      'modal.comment': 'Izoh',
      'modal.consent': "Shaxsiy ma'lumotlarni qayta ishlashga roziman",
      'modal.submit': "So'rovni yuborish",
      'modal.okTitle': "Murojaatingiz uchun rahmat!",
      'modal.okText': "So'rovingizni oldik va bir ish kuni ichida siz bilan bog'lanamiz. Xabar yuborishingiz uchun WhatsApp ham ochiladi.",
      'modal.close': 'Yopish'
    }
  };

  var originalStrings = {};
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (!(key in originalStrings)) originalStrings[key] = el.innerHTML;
  });

  var currentLang = 'ru';

  function stripTags(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  /* Resolve a key for the active language: an explicit dictionary entry wins,
     otherwise fall back to the original Russian markup in the DOM. */
  function resolve(key, lang) {
    var dict = translations[lang] || {};
    if (dict[key] !== undefined) return dict[key];
    if (originalStrings[key] !== undefined) return originalStrings[key];
    var ruDict = translations.ru || {};
    if (ruDict[key] !== undefined) return ruDict[key];
    return '';
  }

  function translate(key) {
    return stripTags(resolve(key, currentLang));
  }

  var LANG_NAMES = { ru: 'Русский', en: 'English', uz: 'O‘zbekcha' };

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = resolve(key, lang);
      if (value !== '') el.innerHTML = value;
    });
    document.querySelectorAll('.lang-option').forEach(function (opt) {
      var isActive = opt.getAttribute('data-lang') === lang;
      opt.classList.toggle('is-active', isActive);
      var li = opt.closest('[role="option"]');
      if (li) li.setAttribute('aria-selected', String(isActive));
    });
    document.querySelectorAll('[data-lang-trigger]').forEach(function (trigger) {
      var codeEl = trigger.querySelector('.lang-trigger-code');
      if (codeEl) codeEl.textContent = lang.toUpperCase();
      trigger.setAttribute('aria-label', 'Выбрать язык сайта: ' + (LANG_NAMES[lang] || lang));
    });
  }

  /* ---------- Language dropdown ----------
     A single shared <ul class="lang-menu"> (a direct child of <body>) is
     repositioned under whichever trigger was clicked. Keeping one shared
     menu — rather than one per trigger — avoids position:fixed being
     re-anchored by the mobile menu's CSS transform, and keeps every
     instance perfectly in sync automatically. */
  (function initLangSwitch() {
    var menu = document.getElementById('langMenu');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lang-trigger]'));
    if (!menu || !triggers.length) return;
    var options = Array.prototype.slice.call(menu.querySelectorAll('.lang-option'));
    var activeTrigger = null;

    function positionMenu(trigger) {
      var r = trigger.getBoundingClientRect();
      var mw = menu.offsetWidth || 188;
      var mh = menu.offsetHeight || 168;
      var left = r.right - mw;
      left = Math.max(10, Math.min(left, window.innerWidth - mw - 10));
      var top = r.bottom + 10;
      var openUp = false;
      if (top + mh > window.innerHeight - 10 && r.top - mh - 10 > 0) {
        top = r.top - mh - 10;
        openUp = true;
      }
      menu.style.left = Math.round(left) + 'px';
      menu.style.top = Math.round(top) + 'px';
      menu.classList.toggle('lang-menu--up', openUp);
    }
    function onReposition() { if (activeTrigger) positionMenu(activeTrigger); }
    function onDocClick(e) {
      if (menu.contains(e.target)) return;
      if (activeTrigger && activeTrigger.contains(e.target)) return;
      closeMenu(false);
    }
    function onKeydown(e) {
      if (e.key === 'Escape') { closeMenu(true); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var idx = options.indexOf(document.activeElement);
        var next = e.key === 'ArrowDown' ? (idx + 1 + options.length) % options.length : (idx - 1 + options.length) % options.length;
        options[next].focus();
      }
      if (e.key === 'Tab') closeMenu(false);
    }
    function closeMenu(focusBack) {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      if (activeTrigger) {
        activeTrigger.setAttribute('aria-expanded', 'false');
        if (focusBack) activeTrigger.focus();
      }
      activeTrigger = null;
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKeydown, true);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    }
    function openMenu(trigger, moveFocusIn) {
      if (activeTrigger === trigger) { closeMenu(true); return; }
      if (activeTrigger) closeMenu(false);
      activeTrigger = trigger;
      positionMenu(trigger);
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
      window.addEventListener('resize', onReposition);
      window.addEventListener('scroll', onReposition, true);
      if (moveFocusIn) {
        var current = options.filter(function (o) { return o.classList.contains('is-active'); })[0] || options[0];
        setTimeout(function () { current.focus(); }, 60);
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        // click events fired by keyboard activation (Enter/Space) report
        // detail 0; genuine mouse clicks report >=1. Use that to decide
        // whether to jump focus into the list for keyboard users.
        openMenu(trigger, e.detail === 0);
      });
    });
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        applyLanguage(opt.getAttribute('data-lang'));
        closeMenu(true);
      });
    });

    window.__closeLangMenu = function () { closeMenu(false); };
  })();

})();

