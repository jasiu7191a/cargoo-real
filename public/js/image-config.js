// Central Configuration for Image Pipeline
window.ImageConfig = {
    // Mode toggles where images are sourced from natively.
    sourceMode: 'mock', // Options: 'mock', 'cms', 'cloudinary', 's3'
    
    // Remote Base URLs
    cmsBaseUrl: 'https://api.cargoo.example.com/assets',
    cdnBaseUrl: 'https://res.cloudinary.com/cargoo/image/upload',
    
    // Placeholder resolution
    placeholderMode: 'local', // 'local' uses local assets, 'placehold.co' generates on the fly
    localPlaceholderPath: 'img/placeholders/',
    forcePlaceholders: true, // Skip product-specific images; use category placeholder for all

    // Transform bindings to switch resolutions for bandwidth optimization
    transformations: {
        thumbnail: 'w_400,h_400,c_fill,q_auto,f_auto',
        detail: 'w_1200,h_1200,c_fit,q_auto,f_auto'
    }
};
