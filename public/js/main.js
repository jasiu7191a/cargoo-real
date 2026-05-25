document.addEventListener('DOMContentLoaded', () => {
    // Current Year for Footer
    const currentYear = document.getElementById('currentYear');
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);

    // Close the drawer whenever ANY .mobile-link is clicked — event
    // delegation so it also catches dynamically injected items (the
    // estimate trigger and the auto-injected "My Account" link).
    // We do NOT call preventDefault — the link's default navigation
    // (or the open-estimate button's own click handler) still runs after.
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (ev) => {
            const link = ev.target.closest('.mobile-link');
            if (!link) return;
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // Customer account link, shared across all language versions.
    const accountCopy = {
        en: { login: 'Login', account: 'My Account' },
        pl: { login: 'Logowanie', account: 'Moje konto' },
        de: { login: 'Einloggen', account: 'Mein Konto' },
        fr: { login: 'Connexion', account: 'Mon compte' }
    };

    function detectLang() {
        const path = window.location.pathname;
        if (path.includes('/cargoo-pl/')) return 'pl';
        if (path.includes('/cargoo-de/')) return 'de';
        if (path.includes('/cargoo-fr/')) return 'fr';
        return 'en';
    }

    function installAccountLinks() {
        const lang = detectLang();
        const copy = accountCopy[lang] || accountCopy.en;
        const href = 'account.html';

        let desktopLink = document.querySelector('.btn-account-header');
        if (!desktopLink) {
            desktopLink = document.createElement('a');
            desktopLink.className = 'btn btn-secondary btn-account-header';
            desktopLink.href = href;
            desktopLink.innerHTML = `<i class="fa-solid fa-user"></i> <span>${copy.login}</span>`;
            const navActions = document.querySelector('.nav-actions');
            const estimateButton = document.querySelector('.btn-estimate-header');
            if (navActions) navActions.insertBefore(desktopLink, estimateButton || navActions.firstChild);
        }

        const mobileList = document.querySelector('.mobile-nav-links');
        let mobileLink = document.querySelector('.account-mobile-link');
        if (!mobileLink && mobileList) {
            const item = document.createElement('li');
            mobileLink = document.createElement('a');
            mobileLink.className = 'mobile-link account-mobile-link';
            mobileLink.href = href;
            mobileLink.textContent = copy.login;
            mobileLink.addEventListener('click', () => {
                if (mobileMenu && mobileMenu.classList.contains('active')) toggleMenu();
            });
            item.appendChild(mobileLink);
            mobileList.appendChild(item);
        }

        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : { user: null })
            .then(data => {
                const label = data.user ? copy.account : copy.login;
                const span = desktopLink && desktopLink.querySelector('span');
                if (span) span.textContent = label;
                if (mobileLink) mobileLink.textContent = label;
            })
            .catch(() => {
                const span = desktopLink && desktopLink.querySelector('span');
                if (span) span.textContent = copy.login;
                if (mobileLink) mobileLink.textContent = copy.login;
            });
    }

    installAccountLinks();

    // Sticky Header
    const header = document.getElementById('header');
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                header.classList.toggle('scrolled', window.scrollY > 50);
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Estimate Badge Synchronization — update ALL .badge-count elements,
    // not just the first one. The estimate appears in two places now: the
    // header pill (desktop) and the mobile-menu list item (mobile).
    function updateEstimateBadge(count) {
        document.querySelectorAll('.badge-count').forEach(badge => {
            badge.textContent = count;
        });
        // Pop animation only on the visible header pill if it's present.
        const btn = document.querySelector('.btn-estimate-header');
        if (btn) {
            btn.classList.add('pop');
            setTimeout(() => btn.classList.remove('pop'), 400);
        }
    }

    // Initial Badge State
    if (window.EstimateState) {
        updateEstimateBadge(window.EstimateState.getCount());
    }

    // Listen for state changes
    window.addEventListener('estimateUpdated', (e) => {
        updateEstimateBadge(e.detail.count);
    });

    // Scroll Animations
    const scrollTriggers = document.querySelectorAll('.scroll-trigger, .fade-up, .fade-in, .fade-right');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    scrollTriggers.forEach(el => {
        if (!el.classList.contains('in-view')) {
            observer.observe(el);
        }
    });
    
    // Check elements already in view on load
    setTimeout(() => {
        scrollTriggers.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && !el.classList.contains('in-view')) {
                el.classList.add('in-view');
            }
        });
    }, 100);

    // Pricing Calculator Logic
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const productCost = parseFloat(document.getElementById('productCost').value) || 0;
            const weight = parseFloat(document.getElementById('weight').value) || 0;
            const shippingRadio = document.querySelector('input[name="shippingMethod"]:checked');
            const shippingSelect = document.getElementById('shippingMethod');
            const shippingMethod = shippingRadio ? shippingRadio.value : (shippingSelect ? shippingSelect.value : 'air_standard');
            
            if (productCost <= 0) {
                alert('Please enter a valid product cost.');
                return;
            }

            let shippingRate = 0;
            switch(shippingMethod) {
                case 'air_standard':
                    shippingRate = Math.max(weight * 15, 15);
                    break;
                case 'air_express':
                    shippingRate = Math.max(weight * 18, 18);
                    break;
            }

            const serviceFee = productCost * 0.12 + 25;
            const customs = productCost * 0.05;
            const total = productCost + shippingRate + serviceFee + customs;

            function formatCurrency(amount) {
                return '€' + amount.toFixed(2);
            }

            document.getElementById('resProduct').textContent = formatCurrency(productCost);
            document.getElementById('resShipping').textContent = formatCurrency(shippingRate);
            document.getElementById('resService').textContent = formatCurrency(serviceFee);
            document.getElementById('resCustoms').textContent = formatCurrency(customs);
            document.getElementById('resTotal').textContent = formatCurrency(total);
            
            // Show Results
            const calcResults = document.getElementById('calcResults');
            calcResults.classList.remove('hidden');
            
            // Scroll down a bit to show results
            setTimeout(() => {
                calcResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.getElementById('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
