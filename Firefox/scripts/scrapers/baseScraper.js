class StoreRegistry {
    static stores = new Map();

    static register(domainPattern, StoreClass) {
        StoreRegistry.stores.set(domainPattern, StoreClass);
    }

    static getStoreClass(url) {
        const domain = new URL(url).hostname;
        for (const [pattern, StoreClass] of StoreRegistry.stores) {
            if (domain.includes(pattern)) {
                return StoreClass;
            }
        }
        return null;
    }
}

class BaseStore {
    constructor(doc, url) {
        this.doc = doc;
        this.url = url;
    }

    getTitle() {
        throw new Error('Must be implemented by subclass');
    }

    getPrices() {
        throw new Error('Must be implemented by subclass');
    }

    getImages() {
        throw new Error('Must be implemented by subclass');
    }

    scrape() {
        const { regularPrice: r, salePrice: s } = this.getPrices(); 
        
        const data = {
            title: this.getTitle().trim(),
            regularPrice: this._convertUSD(r),
            salePrice: this._convertUSD(s),
            images: this.getImages(),
            url: this.url
        };
        this._validate(data);
        return data;
    }

    _convertUSD(price) {
        const sign = price.slice(0, 1);
        const money = (parseFloat(price.slice(1).replace('\,', '').trim()));

        if (sign === '$') return '$' + money;
        if (sign === '¥') return '$' + (money * (1 / 144.198)).toFixed(2);
        return null;
    }

    _validate(data) {
        const { title, regularPrice, salePrice, images, url } = data;
        if (!title) throw new Error('Title is required');
        if (!regularPrice) throw new Error('Regular price is required');
        if (!salePrice) throw new Error('Sale price is required');
        if (!Array.isArray(images) || images.length === 0) throw new Error('At least one image is required');
        if (!url) throw new Error('URL is required');
    }

    formatImageUrl(src) {
        if (!src) return null;
        const cleanSrc = src.split('?')[0];
        return cleanSrc.startsWith('http') ? cleanSrc : 'https:' + cleanSrc;
    }
}

function getProductData(doc, url) {
    const StoreClass = StoreRegistry.getStoreClass(url);
    if (!StoreClass) return null;
    
    const store = new StoreClass(doc, url);
    return store.scrape();
}