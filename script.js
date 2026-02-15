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
        initFormValidation();
        
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
        
        if (originalFormHTML) {
            formSection.innerHTML = originalFormHTML;
        }
        
        formSection.style.display = 'block';
        successMessage.style.display = 'none';
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            initFormHandler();
            initFormValidation();
        }, 100);
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        const formSection = document.getElementById('formSection');
        if (originalFormHTML) {
            formSection.innerHTML = originalFormHTML;
        }
        
        document.getElementById('successMessage').style.display = 'none';
    }

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // ===== ПОКАЗ ДЕТАЛЕЙ УСЛУГИ =====
    function showServiceDetails(button) {
        const serviceCard = button.closest('.service-card-new');
        if (!serviceCard) return;
        
        const serviceTitle = serviceCard.querySelector('h3');
        const serviceList = serviceCard.querySelector('.service-list');
        
        if (!serviceTitle || !serviceList) return;
        
        const title = serviceTitle.textContent;
        const listHTML = serviceList.innerHTML;
        
        const modal = document.getElementById('modal');
        const formSection = document.getElementById('formSection');
        
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
        
        formSection.innerHTML = detailsHTML;
        formSection.style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // ===== ПОКАЗ ФОРМЫ ЗАЯВКИ =====
    function showServiceForm(serviceTitle) {
        const formSection = document.getElementById('formSection');
        
        if (originalFormHTML) {
            formSection.innerHTML = originalFormHTML;
        }
        
        formSection.style.display = 'block';
        
        setTimeout(() => {
            const commentField = document.getElementById('modalComment');
            if (commentField) {
                commentField.value = `Интересует услуга: ${serviceTitle}`;
            }
            
            initFormHandler();
            initFormValidation();
        }, 100);
    }

    // ===== ВАЛИДАЦИЯ ФОРМЫ =====
    function initFormValidation() {
        // ВАЛИДАЦИЯ ИМЕНИ
        const nameInput = document.getElementById('modalName');
        if (nameInput && !nameInput.dataset.validated) {
            nameInput.dataset.validated = 'true';
            
            nameInput.addEventListener('input', function(e) {
                // Разрешаем только буквы и пробелы
                let value = e.target.value;
                value = value.replace(/[^а-яА-ЯёЁa-zA-Z\s]/g, '');
                e.target.value = value;
                
                // Визуальная обратная связь
                if (value.trim().length >= 3) {
                    e.target.style.borderColor = '#4CAF50';
                } else if (value.trim().length > 0) {
                    e.target.style.borderColor = '#FFA500';
                } else {
                    e.target.style.borderColor = '';
                }
            });
        }
        
        // ВАЛИДАЦИЯ ТЕЛЕФОНА
        const phoneInput = document.getElementById('modalPhone');
        if (phoneInput && !phoneInput.dataset.validated) {
            phoneInput.dataset.validated = 'true';
            
            // Устанавливаем начальное значение
            phoneInput.value = '+998 ';
            phoneInput.setAttribute('maxlength', '17'); // +998 XX XXX XX XX = 17 символов
            
            // Автоматически вставляем +998 при фокусе
            phoneInput.addEventListener('focus', function(e) {
                if (!e.target.value || e.target.value === '' || e.target.value === '+998974087003') {
                    e.target.value = '+998 ';
                }
            });
            
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value;
                
                // Удаляем всё кроме цифр
                let numbers = value.replace(/\D/g, '');
                
                // Если удалили всё, возвращаем +998
                if (numbers.length === 0) {
                    e.target.value = '+998 ';
                    return;
                }
                
                // Если не начинается с 998, добавляем
                if (!numbers.startsWith('998')) {
                    numbers = '998' + numbers;
                }
                
                // Ограничиваем 12 цифр (998 + 9 цифр номера)
                if (numbers.length > 12) {
                    numbers = numbers.slice(0, 12);
                }
                
                // Форматируем с автоматическими пробелами: +998 XX XXX XX XX
                let formatted = '+998';
                
                if (numbers.length > 3) {
                    formatted += ' ' + numbers.slice(3, 5); // Первые 2 цифры (код оператора)
                }
                if (numbers.length > 5) {
                    formatted += ' ' + numbers.slice(5, 8); // Следующие 3 цифры
                }
                if (numbers.length > 8) {
                    formatted += ' ' + numbers.slice(8, 10); // Следующие 2 цифры
                }
                if (numbers.length > 10) {
                    formatted += ' ' + numbers.slice(10, 12); // Последние 2 цифры
                }
                
                e.target.value = formatted;
                
                // Визуальная обратная связь с проверкой кода оператора
                const digitsOnly = numbers.slice(3);
                const operatorCode = digitsOnly.slice(0, 2);
                
                // Все валидные коды операторов Узбекистана
                const validCodes = ['90', '91', '93', '94', '50', '97', '88', '99', '95', '77', '98', '33', '20'];
                
                if (digitsOnly.length === 9 && validCodes.includes(operatorCode)) {
                    e.target.style.borderColor = '#4CAF50'; // Зелёный - валидный
                } else if (digitsOnly.length >= 2 && !validCodes.includes(operatorCode)) {
                    e.target.style.borderColor = '#FF0000'; // Красный - неверный код
                } else if (digitsOnly.length > 0) {
                    e.target.style.borderColor = '#FFA500'; // Оранжевый - заполняется
                } else {
                    e.target.style.borderColor = '';
                }
            });
            
            // Запрещаем удаление +998 и разрешаем только цифры
            phoneInput.addEventListener('keydown', function(e) {
                const cursorPosition = e.target.selectionStart;
                const value = e.target.value;
                
                // Запрещаем удаление префикса +998 
                if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 5) {
                    e.preventDefault();
                    return;
                }
                
                // Разрешаем только цифры, backspace, delete, стрелки
                const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                    e.preventDefault();
                }
            });
            
            // Запрещаем вставку некорректных данных
            phoneInput.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = pastedText.replace(/\D/g, '');
                
                if (numbers) {
                    // Симулируем ввод цифр
                    const input = e.target;
                    const start = input.selectionStart;
                    const currentValue = input.value;
                    
                    // Вставляем только цифры
                    const newValue = currentValue.slice(0, start) + numbers + currentValue.slice(input.selectionEnd);
                    input.value = newValue;
                    
                    // Триггерим событие input для форматирования
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });
        }
    }

    // ===== ОБРАБОТЧИК ФОРМЫ =====
    function initFormHandler() {
        const modalForm = document.getElementById("modalForm");
        if (!modalForm || modalForm.dataset.initialized) return;
        
        modalForm.dataset.initialized = 'true';
        
        modalForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById("modalName");
            const phoneInput = document.getElementById("modalPhone");
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const comment = document.getElementById("modalComment").value.trim();
            const telegram = document.getElementById("modalTelegram").value.trim();
            const instagram = document.getElementById("modalInstagram").value.trim();
            
            // Валидация имени
            if (name.length < 3) {
                const errorMessages = {
                    ru: 'Имя должно содержать минимум 3 буквы',
                    en: 'Name must contain at least 3 letters',
                    uz: 'Ism kamida 3 ta harfdan iborat bo\'lishi kerak'
                };
                alert(errorMessages[currentLang]);
                nameInput.focus();
                return;
            }
            
            if (!/^[а-яА-ЯёЁa-zA-Z\s]+$/.test(name)) {
                const errorMessages = {
                    ru: 'Имя может содержать только буквы',
                    en: 'Name can only contain letters',
                    uz: 'Ism faqat harflardan iborat bo\'lishi mumkin'
                };
                alert(errorMessages[currentLang]);
                nameInput.focus();
                return;
            }
            
            // Валидация телефона
            const phoneNumbers = phone.replace(/\D/g, '');
            const digitsOnly = phoneNumbers.slice(3);
            const operatorCode = digitsOnly.slice(0, 2);
            
            // Все валидные коды операторов Узбекистана
            const validCodes = ['90', '91', '93', '94', '50', '97', '88', '99', '95', '77', '98', '33', '20'];
            
            if (digitsOnly.length !== 9) {
                const errorMessages = {
                    ru: 'Введите полный номер (9 цифр после +998)',
                    en: 'Enter complete number (9 digits after +998)',
                    uz: 'To\'liq raqamni kiriting (+998 dan keyin 9 ta raqam)'
                };
                alert(errorMessages[currentLang]);
                phoneInput.focus();
                return;
            }
            
            if (!validCodes.includes(operatorCode)) {
                const errorMessages = {
                    ru: 'Неверный код оператора.\nДопустимые коды:\nBeeline: 90, 91\nUcell: 93, 94, 50\nMobiuz: 97, 88\nUzmobile: 99, 95, 77\nPerfectum: 98\nHumans: 33\nOQ: 20',
                    en: 'Invalid operator code.\nValid codes:\nBeeline: 90, 91\nUcell: 93, 94, 50\nMobiuz: 97, 88\nUzmobile: 99, 95, 77\nPerfectum: 98\nHumans: 33\nOQ: 20',
                    uz: 'Noto\'g\'ri operator kodi.\nTo\'g\'ri kodlar:\nBeeline: 90, 91\nUcell: 93, 94, 50\nMobiuz: 97, 88\nUzmobile: 99, 95, 77\nPerfectum: 98\nHumans: 33\nOQ: 20'
                };
                alert(errorMessages[currentLang]);
                phoneInput.focus();
                return;
            }
            
            const submitBtn = modalForm.querySelector('.btn-submit');
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
                modalForm.reset();
            } else {
                const errorMessages = {
                    ru: '❌ Ошибка отправки.',
                    en: '❌ Sending error.',
                    uz: '❌ Yuborishda xato.'
                };
                alert(errorMessages[currentLang]);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            initFormHandler();
        }, 500);
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

    console.log('%c🚀 MoyDeklarant.uz', 'color: #8B0000; font-size: 24px; font-weight: bold;');
    console.log('%c💼 Ваш надежный таможенный партнер', 'color: #FFD700; font-size: 16px;');
    console.log('%c📞 +998 97 408 70 03', 'color: #FFD700; font-size: 12px;');
