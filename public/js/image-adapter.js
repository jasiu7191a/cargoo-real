// Central Image Architecture Adapter
window.ImageAdapter = {
    /**
     * Internal resolver enforcing descending priority chain.
     */
    _resolveSource: function(product, variant="thumbnail") {
        if (!product) return this.getFallbackPlaceholder('default');

        // Priority 0: Product/SKU keyed image maps (real product photos, bypasses placeholder override)
        if (product.id && window.ProductImagesById && window.ProductImagesById[product.id]) {
            return window.ProductImagesById[product.id];
        }

        if (product.sku && window.ProductImages && window.ProductImages[product.sku]) {
            return window.ProductImages[product.sku];
        }

        // Force all products to use category placeholder images
        if (window.ImageConfig.forcePlaceholders) {
            return this.getFallbackPlaceholder(product.categorySlug || 'default');
        }

        // Priority 1: CMS Backend Image (Future Proofing)
        if (window.ImageConfig.sourceMode === 'cms' && product.cmsImageUrl) {
            return `${window.ImageConfig.cmsBaseUrl}/${product.cmsImageUrl}`;
        }

        // Priority 2: CDN Transformed Mode (Cloudinary, Imgix)
        if (window.ImageConfig.sourceMode === 'cloudinary' && product.code) {
            const tx = window.ImageConfig.transformations[variant] || '';
            return `${window.ImageConfig.cdnBaseUrl}/${tx}/products/${product.code}.jpg`;
        }
        
        // Priority 3: Safely resolve Gallery if multiple exist
        if (product.imageGallery && product.imageGallery.length > 0) {
            return product.imageGallery[0];
        }

        // Priority 4: Direct Assigned Mock Object Image
        if (product.image) {
            return product.image;
        }

        // Priority 5: Deterministic Premium Category Placeholder
        return this.getFallbackPlaceholder(product.categorySlug || 'default');
    },

    /**
     * Resolves context-aware placeholders maintaining white/clean premium visual states.
     */
    getFallbackPlaceholder: function(categorySlug) {
        let type = "default";
        
        switch (categorySlug) {
            case 'sneakers': case 'footwear': type = "sneaker"; break;
            case 'fragrance': case 'colognes': type = "fragrance"; break;
            case 'designer': case 'streetwear': case 'apparel': 
            case 'hoodies': case 'outerwear': case 'pants': case 'tees': type = "apparel"; break;
            case 'accessories': case 'bags': case 'slg': case 'sunglasses': case 'belts': type = "accessory"; break;
            case 'watches': case 'jewelry': type = "watch"; break;
            case 'tech-acc': case 'electronics': type = "tech"; break;
            case 'collectibles': type = "collectible"; break;
        }

        if (window.ImageConfig.placeholderMode === 'placehold.co') {
            return `https://placehold.co/600x600/ffffff/dddddd?text=${type}`;
        }

        return `${window.ImageConfig.localPlaceholderPath}${type}.png`;
    },

    /**
     * Externally exposed presentation standardizer. Returns full accessible <img> DOM structures.
     */
    renderImage: function(product, variant="thumbnail", className="", inlineStyles="") {
        const src = this._resolveSource(product, variant);
        const alt = product ? `${product.name} by ${product.brand}`.replace(/"/g, '&quot;') : 'Product Image';
        
        const fallback = this.getFallbackPlaceholder(product ? product.categorySlug : 'default');
        
        const loading = variant === 'detail' ? 'eager' : 'lazy';
        const fetchp = variant === 'detail' ? 'fetchpriority="high"' : '';
        
        const classAttr = className ? `class="${className}"` : '';
        const styleAttr = inlineStyles
            ? `style="${inlineStyles}"`
            : (className ? 'style="background: #ffffff;"' : 'style="width: 100%; height: 100%; object-fit: contain; background: #ffffff;"');
        
        return `<img src="${src}" alt="${alt}" ${classAttr} ${styleAttr} loading="${loading}" ${fetchp} onerror="this.onerror=null;this.src='${fallback}';">`;
    }
};
