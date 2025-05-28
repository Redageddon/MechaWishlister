class ProductData {
    static validate(data) {
        const { title, regularPrice, salePrice, images, url } = data;
        if (!title) throw new Error('Title is required');
        if (!regularPrice) throw new Error('Regular price is required');
        if (!salePrice) throw new Error('Sale price is required');
        if (!Array.isArray(images) || images.length === 0) throw new Error('At least one image is required');
        if (!url) throw new Error('URL is required');
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
        ProductData.validate(data);
        return data;
    }

    _convertUSD(price) {
        const sign = price.slice(0, 1);
        const money = (parseFloat(price.slice(1).replace('\,', '').trim()));

        if (sign === '$') return '$' + money;
        if (sign === '¥') return '$' + (money * (1 / 144.198)).toFixed(2);
        return null;
    }

    formatImageUrl(src) {
        if (!src) return null;
        const cleanSrc = src.split('?')[0];
        return cleanSrc.startsWith('http') ? cleanSrc : 'https:' + cleanSrc;
    }
}

function getProductData(doc, url) {
    const domain = new URL(url).hostname;
    let store = null;

    if (domain.includes("usagundamstore.com")) {
        store = new UsaGundamStore(doc, url);
    } else if (domain.includes("gundamplacestore.com")) {
        store = new GundamPlaceStore(doc, url);
    } else if (domain.includes("newtype.us")) {
        store = new NewtypeStore(doc, url);
    } else if (domain.includes("gundamplanet.com")) {
        store = new GundamPlanetStore(doc, url);
    } else if (domain.includes("p-bandai.com")) {
        store = new PBandaiStore(doc, url);
    } else if (domain.includes("sidesevenexports.com")) {
        store = new SideSevenExportsStore(doc, url);
    } else if (domain.includes("amiami.com")) {
        store = new AmiamiPlaceStore(doc, url);
    }

    return store?.scrape();
}