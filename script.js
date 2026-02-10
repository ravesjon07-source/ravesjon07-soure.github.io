// ===== TELEGRAM BOT CONFIGURATION =====
const BOT_TOKEN = "8559726245:AAE_DZjrgQKNXm5LzYegwlIyuL-xS8sip3g";
const CHAT_ID = "1126151371";

// ===== LANGUAGE SYSTEM =====
let currentLang = 'ru';

// ===== EXPANDABLE HERO ITEMS =====
document.addEventListener('DOMContentLoaded', function() {
    const expandableItems = document.querySelectorAll('.expandable-item');
    
    expandableItems.forEach(item => {
        item.addEventListener('click', function() {
            const expandId = this.getAttribute('data-expand');
            const expandContent = document.getElementById(`expand-${expandId}`);
            const allExpands = document.querySelectorAll('.expand-content');
            const allItems = document.querySelectorAll('.expandable-item');
            
            allExpands.forEach(content => {
                if (content.id !== `expand-${expandId}`) {
                    content.classList.remove('active');
                }
            });
            
            allItems.forEach(li => {
                if (li !== this) {
                    li.classList.remove('active');
                }
            });
            
            expandContent.classList.toggle('active');
            this.classList.toggle('active');
            
            if (expandContent.classList.contains('active')) {
                setTimeout(() => {
                    expandContent.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 100);
            }
        });
    });
    
    initScrollProgress();
    initAnimations();
    initMobileMenu();
    initCounters();
    
    const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
    setLanguage(savedLang);
});

// Функция установки языка
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    updatePageLanguage(lang);
}

// Добавляем обработчики на кнопки языков
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
});

// ===== MAP FUNCTIONS =====
function openMap(mapType) {
    const lat = '41.2232151';
    const lng = '69.1408283';
    
    let url = '';
    
    if (mapType === 'yandex') {
        url = `https://yandex.ru/maps/?pt=${lng},${lat}&z=16&l=map`;
    } else if (mapType === 'google') {
        url = `https://www.google.com/maps?q=${lat},${lng}`;
    }
    
    if (url) {
        window.open(url, '_blank');
    }
}

// Функция обновления текста на странице
function updatePageLanguage(lang) {
    const elements = document.querySelectorAll('.lang-text');
    
    elements.forEach(element => {
        const translation = element.getAttribute(`data-${lang}`);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

// ===== SCROLL PROGRESS BAR =====
function initScrollProgress() {
    window.addEventListener('scroll', function() {
        const scrollProgress = document.getElementById('scroll-progress');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        scrollProgress.style.width = scrollPercent + '%';
        
        const header = document.querySelector('header');
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ===== SCROLL ANIMATIONS =====
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
            
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        document.querySelectorAll('#mainNav a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
        
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, 250);
        });
    }
}

// ===== ANIMATED COUNTERS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
}

// ===== СОХРАНЕНИЕ ОРИГИНАЛЬНОЙ ФОРМЫ =====
let originalFormHTML = null;

document.addEventListener('DOMContentLoaded', function() {
    // Сохраняем оригинальную форму при загрузке страницы
    const formSection = document.getElementById('formSection');
    if (formSection) {
        originalFormHTML = formSection.innerHTML;
    }
});

// ===== MODAL FUNCTIONS =====
function openModal() {
    const modal = document.getElementById('modal');
    const formSection = document.getElementById('formSection');
    const successMessage = document.getElementById('successMessage');
    
    // Восстанавливаем оригинальную форму
    if (originalFormHTML) {
        formSection.innerHTML = originalFormHTML;
    }
    
    formSection.style.display = 'block';
    successMessage.style.display = 'none';
    
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Переинициализируем обработчик формы
    setTimeout(() => {
        initFormHandler();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Восстанавливаем оригинальную форму
    const formSection = document.getElementById('formSection');
    if (originalFormHTML) {
        formSection.innerHTML = originalFormHTML;
    }
    
    document.getElementById('successMessage').style.display = 'none';
}

// Закрытие при клике вне окна
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
});

// ===== ПОКАЗ ДЕТАЛЕЙ УСЛУГИ (только для раздела "Наши услуги") =====
function showServiceDetails(button) {
    console.log('showServiceDetails вызвана');
    
    const serviceCard = button.closest('.service-card-new');
    if (!serviceCard) {
        console.error('Не найдена карточка услуги');
        return;
    }
    
    const serviceTitle = serviceCard.querySelector('h3');
    const serviceList = serviceCard.querySelector('.service-list');
    
    if (!serviceTitle || !serviceList) {
        console.error('Не найдены элементы услуги');
        return;
    }
    
    const title = serviceTitle.textContent;
    const listHTML = serviceList.innerHTML;
    
    console.log('Название услуги:', title);
    
    const modal = document.getElementById('modal');
    const formSection = document.getElementById('formSection');
    
    // Создаём контент с деталями
    const detailsHTML = `
        <span class="modal-close" onclick="closeModal()" style="position: absolute; top: 1.5rem; right: 1.5rem; font-size: 2rem; color: var(--text-light); cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255, 70, 85, 0.1);">&times;</span>
        
        <h2 style="color: var(--white); margin-bottom: 1rem; text-align: center; font-size: 1.8rem;">
            ${title}
        </h2>
        
        <p style="color: var(--text-light); text-align: center; margin-bottom: 2rem; font-size: 1rem;">
            Подробная информация об услуге
        </p>
        
        <ul style="text-align: left; margin: 1.5rem 0; color: var(--text-light); list-style: none; padding: 0;">
            ${listHTML}
        </ul>
        
        <button onclick="showServiceForm('${title.replace(/'/g, "\\'")}');" style="margin-top: 1.5rem; width: 100%; padding: 1rem; background: linear-gradient(135deg, #8B0000, #ff1744); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
            Получить услугу
        </button>
    `;
    
    // Заменяем содержимое
    formSection.innerHTML = detailsHTML;
    formSection.style.display = 'block';
    
    // Скрываем сообщение об успехе
    document.getElementById('successMessage').style.display = 'none';
    
    // Показываем модальное окно
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    console.log('Модальное окно открыто с деталями');
}

// ===== ПОКАЗ ФОРМЫ ЗАЯВКИ С АВТОЗАПОЛНЕНИЕМ =====
function showServiceForm(serviceTitle) {
    console.log('showServiceForm вызвана для:', serviceTitle);
    
    const formSection = document.getElementById('formSection');
    
    // Восстанавливаем оригинальную форму
    if (originalFormHTML) {
        formSection.innerHTML = originalFormHTML;
    }
    
    formSection.style.display = 'block';
    
    // Автозаполняем комментарий через небольшую задержку
    setTimeout(() => {
        const commentField = document.getElementById('modalComment');
        if (commentField) {
            commentField.value = `Интересует услуга: ${serviceTitle}`;
            console.log('Комментарий заполнен');
        }
        
        // Переинициализируем обработчик формы
        initFormHandler();
    }, 100);
}

// ===== ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКА ФОРМЫ =====
function initFormHandler() {
    const modalForm = document.getElementById("modalForm");
    if (!modalForm) return;
    
    // Удаляем старые обработчики
    const newForm = modalForm.cloneNode(true);
    modalForm.parentNode.replaceChild(newForm, modalForm);
    
    // Добавляем новый обработчик
    newForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const name = document.getElementById("modalName").value.trim();
        const phone = document.getElementById("modalPhone").value.trim();
        const comment = document.getElementById("modalComment").value.trim();
        const telegram = document.getElementById("modalTelegram").value.trim();
        const instagram = document.getElementById("modalInstagram").value.trim();
        
        if (!name || !phone) {
            const errorMessages = {
                ru: 'Пожалуйста, заполните имя и телефон',
                en: 'Please fill in name and phone',
                uz: 'Iltimos, ism va telefonni to\'ldiring'
            };
            alert(errorMessages[currentLang]);
            return;
        }
        
        const submitBtn = newForm.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        const loadingTexts = {
            ru: 'Отправка...',
            en: 'Sending...',
            uz: 'Yuborilmoqda...'
        };
        submitBtn.textContent = loadingTexts[currentLang];
        submitBtn.disabled = true;
        
        const sourceTexts = {
            ru: 'Форма заявки',
            en: 'Request Form',
            uz: 'Ariza shakli'
        };
        
        const success = await sendToTelegram(name, phone, sourceTexts[currentLang], comment, telegram, instagram);
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (success) {
            document.getElementById("formSection").style.display = "none";
            document.getElementById("successMessage").style.display = "block";
            newForm.reset();
        } else {
            const errorMessages = {
                ru: '❌ Ошибка отправки. Попробуйте позже.',
                en: '❌ Sending error. Try later.',
                uz: '❌ Yuborishda xato.'
            };
            alert(errorMessages[currentLang]);
        }
    });
}

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initFormHandler();
});

// ===== TELEGRAM INTEGRATION =====
async function sendToTelegram(name, phone, source, comment = '', telegram = '', instagram = '') {
    const translations = {
        ru: {
            newRequest: '🆕 НОВАЯ ЗАЯВКА!',
            source: 'Источник',
            name: 'Имя',
            phone: 'Телефон',
            comment: 'Комментарий',
            telegram: 'Telegram',
            instagram: 'Instagram',
            time: 'Время'
        },
        en: {
            newRequest: '🆕 NEW REQUEST!',
            source: 'Source',
            name: 'Name',
            phone: 'Phone',
            comment: 'Comment',
            telegram: 'Telegram',
            instagram: 'Instagram',
            time: 'Time'
        },
        uz: {
            newRequest: '🆕 YANGI SO\'ROV!',
            source: 'Manba',
            name: 'Ism',
            phone: 'Telefon',
            comment: 'Izoh',
            telegram: 'Telegram',
            instagram: 'Instagram',
            time: 'Vaqt'
        }
    };
    
    const t = translations[currentLang];
    const commentText = comment ? `\n${t.comment}: ${comment}` : '';
    const telegramText = telegram ? `\n${t.telegram}: ${telegram}` : '';
    const instagramText = instagram ? `\n${t.instagram}: ${instagram}` : '';
    const text = `${t.newRequest}\n\n${t.source}: ${source}\n${t.name}: ${name}\n${t.phone}: ${phone}${commentText}${telegramText}${instagramText}\n${t.time}: ${new Date().toLocaleString('ru-RU')}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                text: text,
                parse_mode: "HTML" 
            })
        });
        
        const data = await response.json();
        return data.ok === true;
    } catch (error) {
        console.error("Telegram error:", error);
        return false;
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== PHONE NUMBER FORMATTER =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0 && !value.startsWith('998')) {
                    value = '998' + value;
                }
                
                if (value.length >= 3) {
                    value = '+' + value.slice(0, 3) + ' ' + value.slice(3);
                }
                if (value.length >= 7) {
                    value = value.slice(0, 7) + ' ' + value.slice(7);
                }
                if (value.length >= 11) {
                    value = value.slice(0, 11) + ' ' + value.slice(11);
                }
                if (value.length >= 14) {
                    value = value.slice(0, 14) + ' ' + value.slice(14, 16);
                }
                
                e.target.value = value;
            });
            
            if (!input.value) {
                input.value = '+998 ';
            }
        });
    }, 500);
});

console.log('%c🚀 MoyDeklarant.uz', 'color: #8B0000; font-size: 24px; font-weight: bold;');
console.log('%c💼 Ваш надежный таможенный партнер', 'color: #FFD700; font-size: 16px;');
console.log('%c📞 +998 97 408 70 03', 'color: #FFD700; font-size: 12px;');
