// ===== TELEGRAM BOT CONFIGURATION =====
const BOT_TOKEN = "8559726245:AAE_DZjrgQKNXm5LzYegwlIyuL-xS8sip3g";
const CHAT_ID = "1126151371";

// ===== LANGUAGE SYSTEM =====
let currentLang = 'ru';

// ===== EXPANDABLE HERO ITEMS =====
document.addEventListener('DOMContentLoaded', function () {
    const expandableItems = document.querySelectorAll('.expandable-item');
    expandableItems.forEach(item => {
        item.addEventListener('click', function () {
            const expandId = this.getAttribute('data-expand');
            const expandContent = document.getElementById('expand-' + expandId);
            document.querySelectorAll('.expand-content').forEach(c => {
                if (c.id !== 'expand-' + expandId) c.classList.remove('active');
            });
            document.querySelectorAll('.expandable-item').forEach(li => {
                if (li !== this) li.classList.remove('active');
            });
            expandContent.classList.toggle('active');
            this.classList.toggle('active');
            if (expandContent.classList.contains('active')) {
                setTimeout(() => expandContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }
        });
    });
    initScrollProgress();
    initAnimations();
    initMobileMenu();
    initCounters();
    initFormValidation();
    const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
    setLanguage(savedLang);
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            setLanguage(this.getAttribute('data-lang'));
        });
    });
});

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('selectedLanguage', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    updatePageLanguage(lang);
}

function updatePageLanguage(lang) {
    document.querySelectorAll('.lang-text').forEach(el => {
        const t = el.getAttribute('data-' + lang);
        if (t) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
            else el.textContent = t;
        }
    });
}

// ===== MAP FUNCTIONS =====
function openMap(mapType) {
    const lat = '41.2232151', lng = '69.1408283';
    const url = mapType === 'yandex'
        ? 'https://yandex.ru/maps/?pt=' + lng + ',' + lat + '&z=16&l=map'
        : 'https://www.google.com/maps?q=' + lat + ',' + lng;
    window.open(url, '_blank');
}

// ===== SCROLL PROGRESS =====
function initScrollProgress() {
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.getElementById('scroll-progress').style.width = (scrollTop / docHeight * 100) + '%';
        document.querySelector('header').classList.toggle('scrolled', scrollTop > 50);
    });
}

// ===== ANIMATIONS =====
function initAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animated'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle) return;

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('active');
        this.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    document.querySelectorAll('#mainNav a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
            if (window.innerWidth > 768) {
                nav.classList.remove('active');
                toggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, 250);
    });
}

// ===== COUNTERS =====
function initCounters() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !e.target.classList.contains('counted')) {
                e.target.classList.add('counted');
                animateCounter(e.target);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const inc = target / (2000 / 16);
    let cur = 0;
    const tick = () => {
        cur += inc;
        if (cur < target) { el.textContent = Math.floor(cur); requestAnimationFrame(tick); }
        else el.textContent = target;
    };
    tick();
}

// ===== MODAL =====
let originalFormHTML = null;

document.addEventListener('DOMContentLoaded', function () {
    const fs = document.getElementById('formSection');
    if (fs) originalFormHTML = fs.innerHTML;
});

function openModal() {
    const modal = document.getElementById('modal');
    const formSection = document.getElementById('formSection');
    const successMessage = document.getElementById('successMessage');
    if (originalFormHTML) formSection.innerHTML = originalFormHTML;
    updatePageLanguage(currentLang);
    formSection.style.display = 'block';
    successMessage.style.display = 'none';
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => { initFormHandler(); initFormValidation(); }, 100);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    const fs = document.getElementById('formSection');
    if (originalFormHTML) fs.innerHTML = originalFormHTML;
    document.getElementById('successMessage').style.display = 'none';
}

window.addEventListener('click', e => {
    const modal = document.getElementById('modal');
    if (e.target === modal) closeModal();
});

function showServiceDetails(button) {
    const card = button.closest('.service-card-new');
    if (!card) return;
    const title = (card.querySelector('h3') || {}).textContent || '';
    const listHTML = (card.querySelector('.service-list') || {}).innerHTML || '';
    const modal = document.getElementById('modal');
    const fs = document.getElementById('formSection');
    fs.innerHTML = `
        <span class="modal-close" onclick="closeModal()" style="position:absolute;top:1.2rem;right:1.2rem;font-size:1.8rem;color:rgba(232,240,255,0.5);cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);">&times;</span>
        <h2 style="color:var(--white);margin-bottom:1rem;text-align:center;font-size:1.7rem;">${title}</h2>
        <p style="color:rgba(232,240,255,0.6);text-align:center;margin-bottom:2rem;font-size:0.95rem;">Подробная информация об услуге</p>
        <ul style="text-align:left;margin:1.5rem 0;color:rgba(232,240,255,0.85);list-style:none;padding:0;">${listHTML}</ul>
        <button onclick="showServiceForm('${title.replace(/'/g,"\\'")}');" style="margin-top:1.5rem;width:100%;padding:1rem;background:linear-gradient(135deg,#cc1122,#8b0010);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:0.04em;">Получить услугу</button>`;
    fs.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showServiceForm(serviceTitle) {
    const fs = document.getElementById('formSection');
    if (originalFormHTML) fs.innerHTML = originalFormHTML;
    fs.style.display = 'block';
    setTimeout(() => {
        const c = document.getElementById('modalComment');
        if (c) c.value = 'Интересует услуга: ' + serviceTitle;
        initFormHandler();
        initFormValidation();
    }, 100);
}


// ===== PHONE & NAME VALIDATION (задачи No5) =====
// Валидные коды мобильных операторов Узбекистана
const UZ_VALID_OPERATORS = [
  '90','91','93','94','95','97','98','99',  // Beeline, Ucell, Mobiuz
  '33',                                      // UMS
  '71','74','75','77','78',                  // UzTelecom/UzMobile
  '55','88',                                 // Perfectum Mobile
  '50','52','53','54','56','57','58',        // прочие зарегистрированные
  '60','61','62','63','64','65','66','67','68','69',
  '70','72','73','76','79','80','81','82','83','84','85','86','87','89'
];

// Список точно известных действующих операторов (приоритетная проверка)
const UZ_KNOWN_OPERATORS = ['90','91','93','94','95','97','98','99','33','71','74','75','77','78','55','88','50'];

function initFormValidation() {
  // ---- Имя ----
  const nameInput = document.getElementById('modalName');
  if (nameInput && !nameInput.dataset.validated) {
    nameInput.dataset.validated = 'true';

    // Запрет ввода цифр и спецсимволов в реальном времени
    nameInput.addEventListener('input', function (e) {
      // Убрать цифры и запрещённые спецсимволы
      let val = e.target.value;
      // Оставить только буквы (кирилл, лат, узб, дефис, пробел)
      val = val.replace(/[^а-яА-ЯёЁa-zA-Z\u00C0-\u024F\u0100-\u024F\s\-]/g, '');
      // Убрать цифры (двойная гарантия)
      val = val.replace(/[0-9]/g, '');
      e.target.value = val;

      const len = val.trim().length;
      if (len === 0) {
        e.target.style.borderColor = '';
      } else if (len < 2) {
        e.target.style.borderColor = '#FFA500';
      } else {
        e.target.style.borderColor = '#4CAF50';
      }
    });

    // Запрет вставки цифр и спецсимволов
    nameInput.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const clean = pasted.replace(/[^а-яА-ЯёЁa-zA-Z\u00C0-\u024F\s\-]/g, '').replace(/[0-9]/g, '');
      this.value = clean;
      this.dispatchEvent(new Event('input'));
    });

    // Запрет нажатий цифр и спецсимволов
    nameInput.addEventListener('keydown', function (e) {
      const blocked = /^[0-9!"#$%&'()*+,.\/:;<=>?@\[\\\]^_`{|}~]$/;
      if (blocked.test(e.key)) e.preventDefault();
    });
  }

  // ---- Телефон ----
  const phoneInput = document.getElementById('modalPhone');
  if (!phoneInput || phoneInput.dataset.validated) return;
  phoneInput.dataset.validated = 'true';

  const phoneHint = document.getElementById('phoneHint');

  // Авто-заполнение +998
  if (!phoneInput.value || phoneInput.value.trim() === '') {
    phoneInput.value = '+998';
  }

  function getLabels() {
    const l = {
      ru: {
        tip: 'Формат: +998 XX XXXXXXX',
        ok: 'Номер введён корректно ✓',
        long: 'Номер слишком длинный (макс. 12 цифр)',
        short: 'Введите полный номер (12 цифр)',
        badOp: 'Такой код оператора не существует в Узбекистане',
        noDigits: 'Введите только цифры после +998'
      },
      en: {
        tip: 'Format: +998 XX XXXXXXX',
        ok: 'Number is valid ✓',
        long: 'Number is too long (max 12 digits)',
        short: 'Enter full number (12 digits)',
        badOp: 'This operator code does not exist in Uzbekistan',
        noDigits: 'Enter only digits after +998'
      },
      uz: {
        tip: 'Format: +998 XX XXXXXXX',
        ok: 'Raqam to\'g\'ri ✓',
        long: 'Raqam juda uzun (maksimal 12 raqam)',
        short: 'To\'liq raqam kiriting (12 raqam)',
        badOp: 'Bunday operator kodi O\'zbekistonda mavjud emas',
        noDigits: '+998 dan keyin faqat raqamlar kiriting'
      }
    };
    return l[currentLang] || l.ru;
  }

  function hint(text, type) {
    if (!phoneHint) return;
    phoneHint.textContent = text;
    phoneHint.className = 'phone-hint ' + (type || 'neutral');
  }

  function validatePhone(val) {
    const labels = getLabels();
    const digits = val.replace(/\D/g, '');

    if (digits.length === 0) {
      phoneInput.style.borderColor = '';
      hint(labels.tip, 'neutral');
      return;
    }

    // Должно начинаться с 998
    if (!digits.startsWith('998')) {
      phoneInput.style.borderColor = '#FF4444';
      hint(labels.tip + ' — начните с +998', 'invalid');
      return;
    }

    // Слишком длинный
    if (digits.length > 12) {
      phoneInput.style.borderColor = '#FF4444';
      hint(labels.long, 'invalid');
      return;
    }

    // Проверка кода оператора (4-й и 5-й символ после 998)
    if (digits.length >= 5) {
      const opCode = digits.substring(3, 5);
      const isKnown = UZ_KNOWN_OPERATORS.includes(opCode);
      const isAny   = UZ_VALID_OPERATORS.includes(opCode);

      if (!isAny) {
        phoneInput.style.borderColor = '#FF4444';
        hint(labels.badOp, 'invalid');
        return;
      }

      if (digits.length === 12) {
        phoneInput.style.borderColor = '#4CAF50';
        hint(labels.ok, 'valid');
        return;
      }

      if (digits.length < 12) {
        phoneInput.style.borderColor = '#FFA500';
        hint(labels.short, 'neutral');
        return;
      }
    } else {
      // Неполный
      phoneInput.style.borderColor = '#FFA500';
      hint(labels.tip, 'neutral');
    }
  }

  phoneInput.addEventListener('focus', function () {
    if (!this.value || this.value.trim() === '') this.value = '+998';
    validatePhone(this.value);
  });

  phoneInput.addEventListener('input', function (e) {
    let val = e.target.value;
    // Убрать всё кроме + в начале и цифр
    // Запрет букв и спецсимволов кроме +
    val = val.replace(/[^+\d]/g, '');
    // + только в начале
    if (val.indexOf('+') > 0) val = val.replace(/\+/g, '');
    if (val && !val.startsWith('+')) val = '+' + val;
    // Ограничение: +998 + 9 цифр = max 13 символов с +
    const digits = val.replace(/\D/g, '');
    if (digits.length > 12) {
      val = '+' + digits.substring(0, 12);
    }
    e.target.value = val;
    validatePhone(val);
  });

  phoneInput.addEventListener('keydown', function (e) {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
    const isDigit = /^\d$/.test(e.key);
    const isPlus = e.key === '+' && this.selectionStart === 0;
    if (!allowed.includes(e.key) && !isDigit && !isPlus) {
      e.preventDefault();
    }
    // Запрет превышения длины
    const digits = this.value.replace(/\D/g, '');
    if (isDigit && digits.length >= 12) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener('paste', function (e) {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
    // Очистить от всего кроме цифр и +
    let clean = pasted.replace(/[^+\d]/g, '');
    if (!clean.startsWith('+')) clean = '+' + clean.replace(/\+/g, '');
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 12) clean = '+' + digits.substring(0, 12);
    this.value = clean;
    validatePhone(this.value);
  });

  // Блокировка удаления +998 (первые 4 символа)
  phoneInput.addEventListener('keydown', function (e) {
    if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectionStart <= 4 && this.selectionEnd <= 4) {
      // Не удалять +998
      if (this.value.length <= 4) {
        e.preventDefault();
        return;
      }
    }
  });

  validatePhone(phoneInput.value);
}


// ===== FORM HANDLER =====
function initFormHandler() {
    const form = document.getElementById('modalForm');
    if (!form || form.dataset.initialized) return;
    form.dataset.initialized = 'true';

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nameEl  = document.getElementById('modalName');
        const phoneEl = document.getElementById('modalPhone');
        const name    = nameEl  ? nameEl.value.trim()  : '';
        const phone   = phoneEl ? phoneEl.value.trim() : '';
        const comment  = (document.getElementById('modalComment')  || {}).value || '';
        const telegram = (document.getElementById('modalTelegram') || {}).value || '';
        const instagram= (document.getElementById('modalInstagram')|| {}).value || '';

        // Валидация имени
        if (name.length < 2) {
            const m = { ru:'Введите ваше имя (минимум 2 символа)', en:'Enter your name (at least 2 characters)', uz:'Ismingizni kiriting (kamida 2 ta belgi)' };
            alert(m[currentLang] || m.ru);
            if (nameEl) nameEl.focus();
            return;
        }

        // Валидация телефона — только длина (гибкая, без привязки к оператору)
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 12 || !digits.startsWith('998')) {
            const m = { ru:'Введите корректный номер телефона', en:'Enter a valid phone number', uz:'To\'g\'ri telefon raqamini kiriting' };
            alert(m[currentLang] || m.ru);
            if (phoneEl) phoneEl.focus();
            return;
        }
        if (digits.length > 12) {
            const m = { ru:'Номер телефона слишком длинный', en:'Phone number is too long', uz:'Telefon raqami juda uzun' };
            alert(m[currentLang] || m.ru);
            if (phoneEl) phoneEl.focus();
            return;
        }

        const btn = form.querySelector('.btn-submit');
        const origText = btn ? btn.textContent : '';
        const loading = { ru:'Отправка...', en:'Sending...', uz:'Yuborilmoqda...' };
        if (btn) { btn.textContent = loading[currentLang] || loading.ru; btn.disabled = true; }

        const src = { ru:'Форма заявки', en:'Request Form', uz:'Ariza shakli' };
        const ok = await sendToTelegram(name, phone, src[currentLang] || src.ru, comment.trim(), telegram.trim(), instagram.trim());

        if (btn) { btn.textContent = origText; btn.disabled = false; }

        if (ok) {
            document.getElementById('formSection').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            form.reset();
        } else {
            const m = { ru:'❌ Ошибка отправки. Попробуйте ещё раз.', en:'❌ Sending error. Please try again.', uz:'❌ Xato. Qayta urinib ko\'ring.' };
            alert(m[currentLang] || m.ru);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(initFormHandler, 500));

// ===== TELEGRAM =====
async function sendToTelegram(name, phone, source, comment, telegram, instagram) {
    const tr = {
        ru: { hd:'🆕 НОВАЯ ЗАЯВКА!', src:'Источник', nm:'Имя', ph:'Телефон', cmt:'Комментарий', tg:'Telegram', ig:'Instagram', tm:'Время' },
        en: { hd:'🆕 NEW REQUEST!',  src:'Source',   nm:'Name', ph:'Phone',   cmt:'Comment',      tg:'Telegram', ig:'Instagram', tm:'Time' },
        uz: { hd:"🆕 YANGI SO'ROV!",src:'Manba',    nm:'Ism',  ph:'Telefon', cmt:'Izoh',         tg:'Telegram', ig:'Instagram', tm:'Vaqt' }
    };
    const t  = tr[currentLang] || tr.ru;
    const cx = comment   ? '\n' + t.cmt + ': ' + comment   : '';
    const tx = telegram  ? '\n' + t.tg  + ': ' + telegram  : '';
    const ix = instagram ? '\n' + t.ig  + ': ' + instagram : '';
    const text = t.hd + '\n\n' + t.src + ': ' + source + '\n' + t.nm + ': ' + name + '\n' + t.ph + ': ' + phone + cx + tx + ix + '\n' + t.tm + ': ' + new Date().toLocaleString('ru-RU');

    try {
        const r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
        });
        return (await r.json()).ok === true;
    } catch (err) {
        console.error('Telegram error:', err);
        return false;
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const hh = document.querySelector('header').offsetHeight;
            window.scrollTo({ top: target.offsetTop - hh - 20, behavior: 'smooth' });
        }
    });
});

console.log('%c🚀 MoyDeklarant.uz', 'color:#cc1122;font-size:24px;font-weight:bold;');
console.log('%c💼 Ваш надежный таможенный партнер', 'color:#FFD700;font-size:16px;');
console.log('%c📞 +998 97 408 70 03', 'color:#FFD700;font-size:12px;');
