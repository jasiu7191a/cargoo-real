// UI Logic for Premium Search & Estimate Drawer

document.addEventListener('DOMContentLoaded', () => {
    /* --- STATE --- */
    let searchHistory = JSON.parse(localStorage.getItem('cargoo_search_history') || '[]');
    let highlightIndex = -1;
    
    /* --- DOM ELEMENTS --- */
    const searchInputs = document.querySelectorAll('.search-input'); // Catch multiple if mobile/desktop
    const searchDropdown = document.getElementById('searchDropdown');
    const searchResultsArea = document.getElementById('searchResultsArea');
    const searchClearBtns = document.querySelectorAll('.search-clear');
    
    const estimateDrawer = document.getElementById('estimateDrawer');
    const estimateOverlay = document.getElementById('estimateOverlay');
    const closeDrawerBtn = document.getElementById('closeEstimateDrawer');
    const openDrawerBtns = document.querySelectorAll('.open-estimate-btn'); // For manual opening
    const estimateItemsList = document.getElementById('estimateItemsList');
    const estimateForm = document.getElementById('estimateForm');

    /* --- GLOBAL DRAWER CONTROLS --- */
    window.openEstimateDrawer = () => {
        if (!estimateDrawer) return;
        estimateDrawer.classList.add('open');
        if (estimateOverlay) estimateOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeSearch();
        renderEstimateTray();
    };

    window.closeEstimateDrawer = () => {
        if (!estimateDrawer) return;
        estimateDrawer.classList.remove('open');
        if (estimateOverlay) estimateOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    /* --- INITIALIZATION --- */
    const initSearch = () => {
        if (!searchDropdown) return;
        searchInputs.forEach(input => {
            input.addEventListener('focus', () => handleFocus(input));
            input.addEventListener('input', SearchAPI.debounce(() => handleInput(input), 250));
            input.addEventListener('keydown', (e) => handleKeydown(e, input));
        });

        searchClearBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                searchInputs.forEach(inp => inp.value = '');
                searchDropdown.classList.remove('active');
            });
        });

        // Outside click to close dropdown
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.global-search') && !e.target.closest('.search-dropdown')) {
                closeSearch();
            }
        });

        // Sync tray on load
        renderEstimateTray();
    };

    // Listen for global estimate updates to refresh the local drawer tray
    window.addEventListener('estimateUpdated', () => {
        renderEstimateTray();
    });

    /* --- SEARCH UI HANDLERS --- */
    const handleFocus = async (input) => {
        highlightIndex = -1;
        searchDropdown.classList.add('active');
        input.closest('.global-search').classList.add('is-focused');
        
        if (!input.value.trim()) {
            await renderEmptyState();
        } else {
            handleInput(input);
        }
        
        // Tracking hook
        console.log('[Analytics] search_focus triggered');
    };

    const handleInput = async (input) => {
        const term = input.value.trim();
        highlightIndex = -1;
        
        if (!term) {
            await renderEmptyState();
            return;
        }

        // Tracking hook
        console.log(`[Analytics] search_query: ${term}`);

        showLoading();
        const results = await SearchAPI.query(term);
        renderResults(results, term);
    };

    const closeSearch = () => {
        if (searchDropdown) searchDropdown.classList.remove('active');
        if (searchInputs) searchInputs.forEach(inp => inp.value = '');
        highlightIndex = -1;
        document.querySelectorAll('.global-search').forEach(gs => gs.classList.remove('is-focused'));
    };

    const handleKeydown = (e, input) => {
        const items = searchDropdown.querySelectorAll('.search-item, .btn-select');
        if (!searchDropdown.classList.contains('active') || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightIndex = (highlightIndex + 1) % items.length;
            updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightIndex = (highlightIndex - 1 + items.length) % items.length;
            updateHighlight(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIndex >= 0) {
                items[highlightIndex].click();
            } else {
                // If nothing highlighted but text exists, REDIRECT to search results page
                const term = input.value.trim();
                if(term) {
                    saveToHistory(term);
                    window.location.href = `search.html?q=${encodeURIComponent(term)}`;
                }
            }
        } else if (e.key === 'Escape') {
            closeSearch();
            input.blur();
        }
    };

    const updateHighlight = (items) => {
        items.forEach((item, idx) => {
            if (idx === highlightIndex) {
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.setAttribute('aria-selected', 'false');
            }
        });
    };

    /* --- history management --- */
    const saveToHistory = (term) => {
        if(!searchHistory.includes(term)) {
            searchHistory.unshift(term);
            if(searchHistory.length > 5) searchHistory.pop();
            localStorage.setItem('cargoo_search_history', JSON.stringify(searchHistory));
        }
    };

    /* --- SUGGESTION SEARCH TRIGGER --- */
    // Global function called when a user clicks a suggestion chip
    window.triggerSuggestionSearch = (queryText) => {
        // Redirection for "real result pages" as per requirement
        saveToHistory(queryText);
        window.location.href = `search.html?q=${encodeURIComponent(queryText)}`;
        console.log(`[Analytics] suggestion_redirect: ${queryText}`);
    };

    /* --- RENDERING LOGIC --- */
    const showLoading = () => {
        searchResultsArea.innerHTML = `<div style="padding: 2rem; text-align:center; color: var(--clr-text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Searching...</div>`;
    };

    const renderEmptyState = async () => {
        const data = await SearchAPI.getEmptyState();
        let html = '';

        if (searchHistory.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-title">Recent Searches</div>
                    ${searchHistory.map(term => `
                        <div class="search-item" onclick="window.triggerSuggestionSearch('${term.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                            <div class="search-item-info">
                                <span class="search-item-title">${term}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Popular suggestion chips
        const popularSuggestions = window.SearchCatalog.suggestions.slice(0, 16);
        if (popularSuggestions.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-title">Popular Searches</div>
                    <div class="suggestion-chips">
                        ${popularSuggestions.map(s => `
                            <button class="suggestion-chip" onclick="window.triggerSuggestionSearch('${s.query.replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                ${s.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += renderSection('Trending Products', 'stars', data.trending);
        html += renderSection('Popular Brands', 'fire', data.popularBrands);

        searchResultsArea.innerHTML = html || '<div style="padding: 1rem;">No suggestions.</div>';
        attachSelectListeners();
    };


    const renderResults = (results, query) => {
        let html = '';
        html += renderSection('Suggestions', 'magnifying-glass', results.suggestions, query);
        
        // Group Products by Brand
        if (results.products && results.products.length > 0) {
            const groupedProducts = {};
            results.products.forEach(p => {
                const brand = p.brand || 'Other Products';
                if (!groupedProducts[brand]) groupedProducts[brand] = [];
                groupedProducts[brand].push(p);
            });
            
            Object.keys(groupedProducts).sort().forEach(brandName => {
                html += renderSection(brandName, 'box', groupedProducts[brandName], query);
            });
        }
        
        html += renderSection('Brands', 'tag', results.brands, query);
        html += renderSection('Categories', 'folder', results.categories, query);

        if (!html) {
            html = `<div style="padding: 2rem; text-align:center; color: var(--clr-text-muted);">No results found for "${query}"</div>`;
        }

        searchResultsArea.innerHTML = html;
        attachSelectListeners();
    };

    const renderSection = (title, icon, items, query = '') => {
        if (!items || items.length === 0) return '';
        
        const markup = items.map(item => {
            // Determine type fields
            let id = item.code || item.slug || item.id;
            let nameText = highlightText(item.name || item.text, query);
            let img = item.image || item.logo;
            
            let metaLabel = '';
            let href = '';
            let itemType = 'product';
            
            if (item.brand) {
                // It's a product
                metaLabel = `<a href="brand.html?slug=${item.brandSlug}" class="brand-link" onclick="event.stopPropagation();">${item.brand}</a> • <a href="category.html?slug=${item.categorySlug}" class="brand-link" onclick="event.stopPropagation();">${item.category}</a>`;
                href = `product.html?id=${item.id}`;
            } else if (item.type === 'brand') {
                // It's a brand result
                metaLabel = `Brand`;
                href = `brand.html?slug=${item.slug}`;
                itemType = 'brand';
            } else if (item.query) {
                // ── SUGGESTION: inject query into search bar and trigger live search ──
                metaLabel = `Search Suggestion`;
                const escapedQuery = item.query.replace(/'/g, "\\'");
                return `
                    <div class="search-item suggestion-item" role="option" onclick="window.triggerSuggestionSearch('${escapedQuery}')">
                        <div style="width:40px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i class="fa-solid fa-magnifying-glass" style="color:var(--clr-orange); font-size:0.9rem;"></i>
                        </div>
                        <div class="search-item-info">
                            <span class="search-item-title">${highlightText(item.text, query)}</span>
                            <span class="search-item-meta">Search Suggestion</span>
                        </div>
                        <div style="color:var(--clr-text-muted); font-size:0.75rem; padding: 0 0.5rem; white-space:nowrap;">
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                    </div>
                `;
            } else {
                metaLabel = `Category`;
                href = `category.html?slug=${item.slug}`;
                itemType = 'category';
            }

            let imgMarkup = '';
            if (itemType === 'product') {
                imgMarkup = window.ImageAdapter.renderImage(item, 'thumbnail', 'search-item-img');
            } else {
                imgMarkup = img ? `<img src="${img}" class="search-item-img ${(item.logo && !item.image) ? 'brand-logo' : ''}" alt="">` : `<div style="width:50px; text-align:center;"><i class="fa-solid fa-${icon} text-muted"></i></div>`;
            }

            return `
                <div class="search-item" role="option">
                    ${imgMarkup}
                    <div class="search-item-info" onclick="window.location.href='${href}'">
                        <span class="search-item-title">${nameText}</span>
                        <span class="search-item-meta">${metaLabel ? `${metaLabel} <span class="seq-code">${id}</span>` : `<span class="seq-code">${id}</span>`}</span>
                    </div>
                    ${!item.query ? `<button class="btn-select request-estimate-btn" onclick="event.stopPropagation(); window.addToEstimate(${item.id}, '${itemType}', this);">${itemType === 'product' ? 'Select' : 'Request'}</button>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="search-section">
                <div class="search-section-title">${title}</div>
                ${markup}
            </div>
        `;
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, `<span class="search-match">$1</span>`);
    };

    /* --- ESTIMATE LOGIC --- */
    const attachSelectListeners = () => {
        // Obsolete: Handled cleanly by global inline onClick
    };

    window.addToEstimate = (id, type = 'product', btn = null) => {
        let item;
        if (type === 'brand') item = window.SearchCatalog.brands.find(b => b.id === id);
        else if (type === 'category') item = window.SearchCatalog.categories.find(c => c.id === id);
        else item = window.SearchCatalog.products.find(p => p.id === id);

        if(!item) return;

        if (window.EstimateState) {
            window.EstimateState.addItem(item, type);
            console.log(`[Analytics] estimate_select_item: [${type}] ${item.code || item.slug}`);
            
            // UI FEEL: Feedback & Auto-open
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.classList.add('btn-added-state');
                btn.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
                
                setTimeout(() => {
                    btn.classList.remove('btn-added-state');
                    btn.innerHTML = originalHTML;
                }, 1500);
            }

            // Pop up the window as per requirement
            if (typeof window.openEstimateDrawer === 'function') {
                setTimeout(() => {
                    window.openEstimateDrawer();
                }, 200); // Small delay for better visual layering
            }
        }
    };

    const renderEstimateTray = () => {
        if (!estimateItemsList) return;
        const items = window.EstimateState ? window.EstimateState.getItems() : [];

        if (items.length === 0) {
            estimateItemsList.innerHTML = `<p class="text-muted" style="text-align:center; padding: 2rem 0;">No items selected yet.</p>`;
            return;
        }

        estimateItemsList.innerHTML = items.map(item => {
            const qty = item.quantity || 1;
            const imgHtml = item.type === 'product' 
                ? window.ImageAdapter.renderImage(item, 'thumbnail', 'estimate-thumb') 
                : (item.image || item.logo 
                    ? `<img src="${item.image || item.logo}" class="estimate-thumb" alt="">` 
                    : `<div class="placeholder-icon"><i class="fa-solid fa-folder"></i></div>`);

            return `
                <div class="selected-item">
                    ${imgHtml}
                    <div class="selected-item-info">
                        <div class="selected-item-title">${item.name}</div>
                        <div class="selected-item-meta">
                            <span class="meta-brand">${item.brand || ''}</span>
                            ${item.brand && item.category ? '<span class="meta-sep">•</span>' : ''}
                            <span class="meta-cat">${item.category || ''}</span>
                        </div>
                    </div>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="window.updateEstimateQuantity(${item.id}, '${item.type}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-val">${qty}</span>
                        <button class="qty-btn" onclick="window.updateEstimateQuantity(${item.id}, '${item.type}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button class="btn-remove" onclick="window.removeEstimateItem(${item.id}, '${item.type}')" title="Remove item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        }).join('');
    };

    // Global handlers for quantity
    window.updateEstimateQuantity = (id, type, delta) => {
        if (window.EstimateState) {
            window.EstimateState.updateQuantity(id, type, delta);
            console.log(`[Analytics] estimate_update_qty: [${type}] ID ${id} Delta ${delta}`);
        }
    };

    // Make global for inline handler
    window.removeEstimateItem = (id, type = 'product') => {
        if (window.EstimateState) {
            window.EstimateState.removeItem(id, type);
            console.log(`[Analytics] estimate_remove_item: [${type}] ID ${id}`);
        }
    };

    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', window.closeEstimateDrawer);
    if (estimateOverlay) estimateOverlay.addEventListener('click', window.closeEstimateDrawer);
    openDrawerBtns.forEach(b => b.addEventListener('click', window.openEstimateDrawer));

    /* Submit Logic */
    if (estimateForm) {
        estimateForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email    = document.getElementById('estEmail').value.trim();
            const msg      = document.getElementById('estMsg').value.trim();
            const items    = window.EstimateState ? window.EstimateState.getItems() : [];
            const submitBtn = estimateForm.querySelector('button[type="submit"]');

            if (!email) {
                alert('Please enter your email address.');
                return;
            }

            // UI: show loading state
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }

            const API_URL = 'https://admin.cargooimport.eu/api/leads';

            try {
                let leadsToSubmit = [];

                if (items.length > 0) {
                    // Submit one lead per selected item
                    leadsToSubmit = items.map(item => ({
                        email,
                        productName: item.name,
                        productUrl:  item.productUrl || item.href || null,
                        quantity:    item.quantity || 1,
                        notes:       msg || null,
                    }));
                } else {
                    // No items — use the message as a free-text product request
                    leadsToSubmit = [{
                        email,
                        productName: msg || 'General Sourcing Inquiry',
                        quantity:    1,
                        notes:       msg || null,
                    }];
                }

                // Fire all leads in parallel
                const results = await Promise.all(
                    leadsToSubmit.map(lead =>
                        fetch(API_URL, {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body:    JSON.stringify(lead),
                        }).then(r => r.json())
                    )
                );

                const allOk = results.every(r => r.success || r.leadId);
                console.log('[Analytics] estimate_submit → API', allOk ? 'OK' : 'PARTIAL', results);

                if (allOk) {
                    // Success: show confirmation inside the drawer
                    estimateForm.innerHTML = `
                        <div style="text-align:center; padding: 2rem 0;">
                            <i class="fa-solid fa-circle-check" style="font-size:2.5rem; color:#22c55e; margin-bottom:1rem;"></i>
                            <h3 style="margin-bottom:0.5rem;">Request Sent!</h3>
                            <p style="color:var(--clr-text-muted); font-size:0.9rem;">
                                We've received your inquiry and will email <strong>${email}</strong> within 24–48 hours with a sourcing quote.
                            </p>
                        </div>
                    `;
                    if (window.EstimateState) window.EstimateState.clearAll();
                    setTimeout(() => window.closeEstimateDrawer(), 4000);
                } else {
                    throw new Error('Some leads failed to save.');
                }

            } catch (err) {
                console.error('[Lead] submission error:', err);
                // Restore the button and show a friendly error
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
                const errDiv = estimateForm.querySelector('.lead-error');
                if (!errDiv) {
                    const div = document.createElement('p');
                    div.className = 'lead-error';
                    div.style.cssText = 'color:#f87171; font-size:0.85rem; margin-top:0.75rem; text-align:center;';
                    div.textContent = 'Something went wrong. Please try again or email us at contact@cargooimport.eu.';
                    estimateForm.appendChild(div);
                }
            }
        });
    }

    initSearch();
});
