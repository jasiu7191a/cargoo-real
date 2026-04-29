/**
 * Global State Manager for Multi-Product Estimates
 * Manages localStorage persistence and dispatches 'estimateUpdated' events.
 */

window.EstimateState = {
    STORAGE_KEY: 'cargoo_selected_estimate_items',

    /**
     * Get all items currently in the estimate basket.
     */
    getItems: function() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            console.error('[EstimateState] Error parsing localStorage', e);
            return [];
        }
    },

    /**
     * Get total count of items (sum of all quantities).
     */
    getCount: function() {
        return this.getItems().reduce((total, item) => total + (item.quantity || 1), 0);
    },

    /**
     * Add an item or increment quantity if it exists.
     */
    addItem: function(item, type = 'product') {
        const items = this.getItems();
        const existing = items.find(i => i.id === item.id && i.type === type);
        
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            items.push({
                ...item,
                type: type,
                quantity: 1,
                estTypeLabel: type === 'brand' ? 'Brand' : type === 'category' ? 'Category' : '',
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        this.notify();
        return true;
    },

    /**
     * Update quantity by delta (+1 or -1). Removes item if quantity reaches 0.
     */
    updateQuantity: function(id, type, delta) {
        let items = this.getItems();
        const item = items.find(i => i.id === id && i.type === type);
        
        if (item) {
            item.quantity = (item.quantity || 1) + delta;
            if (item.quantity <= 0) {
                return this.removeItem(id, type);
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
            this.notify();
            return true;
        }
        return false;
    },

    /**
     * Remove an item by ID and type.
     */
    removeItem: function(id, type) {
        let items = this.getItems();
        const originalLength = items.length;
        items = items.filter(i => !(i.id === id && i.type === type));
        
        if (items.length !== originalLength) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
            this.notify();
            return true;
        }
        return false;
    },

    /**
     * Clear all selected items.
     */
    clearAll: function() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.notify();
    },

    /**
     * Dispatch event to notify UI components.
     */
    notify: function() {
        const event = new CustomEvent('estimateUpdated', {
            detail: { 
                count: this.getCount(),
                items: this.getItems()
            }
        });
        window.dispatchEvent(event);
    }
};
