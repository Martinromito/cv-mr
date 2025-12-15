// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
        }
    });
});

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Scroll to top button functionality
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Animate skill bars on scroll
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-progress').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const skillsSection = document.querySelector('.skills-section');
if (skillsSection) {
    observer.observe(skillsSection);
}

// Add fade-in animation for timeline items
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.timeline-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    timelineObserver.observe(item);
});

// Log page view for analytics (placeholder)
console.log('CV Page Loaded - Martin Nicolas Romito');

// Prevent console errors in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
}

/* ===========================
   i18n Implementation
   =========================== */
let currentLang = localStorage.getItem('cv_lang') || 'es';
const langToggleBtn = document.getElementById('langToggle');
const langText = langToggleBtn.querySelector('.lang-text');

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}

function updateContent() {
    // Update basic text elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[currentLang], key);
        if (translation) {
            element.textContent = translation;
        }
    });

    // Update list items (for job responsibilities)
    document.querySelectorAll('[data-i18n-list]').forEach(list => {
        const key = list.getAttribute('data-i18n-list');
        const items = getNestedTranslation(translations[currentLang], key);
        if (Array.isArray(items)) {
            list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }
    });

    // Update button text and html lang attribute
    langText.textContent = currentLang.toUpperCase();
    document.documentElement.lang = currentLang;
}

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('cv_lang', currentLang);
        updateContent();
    });
}

// Initialize content on load
if (typeof translations !== 'undefined') {
    updateContent();
} else {
    console.error('Translations not loaded');
}

/* ===========================
   PDF Export
   =========================== */
const pdfBtn = document.getElementById('pdfBtn');

if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
        const element = document.body;
        
        // Configuration for better PDF output
        const opt = {
            margin:       [10, 0, 10, 0], // Top, Right, Bottom, Left margins in mm
            filename:     `CV_Martin_Romito_${currentLang.toUpperCase()}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true,
                logging: false,
                letterRendering: true,
                scrollY: 0
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Add a class to body to trigger print styles specifically for html2pdf
        document.body.classList.add('generating-pdf');

        // Generate PDF and then cleanup
        html2pdf().set(opt).from(element).save().then(() => {
            document.body.classList.remove('generating-pdf');
        }, (err) => {
            console.error(err);
            document.body.classList.remove('generating-pdf');
        });
    });
}
