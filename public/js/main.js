document.addEventListener('DOMContentLoaded', () => {
    // Current Year for Footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) toggleMenu();
        });
    });

    // Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Estimate Badge Synchronization
    function updateEstimateBadge(count) {
        const badge = document.querySelector('.btn-estimate-header .badge-count');
        const btn = document.querySelector('.btn-estimate-header');
        if (badge) {
            badge.textContent = count;
            // Visible feedback if count > 0 (could hide if 0, but usually looks better always present)
            // badge.style.display = count > 0 ? 'flex' : 'none';
            
            // Trigger pop animation
            if (btn) {
                btn.classList.add('pop');
                setTimeout(() => btn.classList.remove('pop'), 400);
            }
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

            const serviceFee = productCost * 0.18 + 10;
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
