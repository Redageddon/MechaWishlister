class GundamPlaceStore extends BaseStore {
    static {
        StoreRegistry.register('gundamplacestore.com', GundamPlaceStore);
    }

    getTitle() {
        return this.doc.querySelector('.product__title')?.innerText;
    }

    getPrices() {
        const priceElementRegular = this.doc.querySelector('.price__compare .price-item.price-item--regular');
        const priceElementSale = this.doc.querySelector('.price-item.price-item--sale');
        let regularPrice = this._formatPrice(priceElementRegular);
        let salePrice = this._formatPrice(priceElementSale);
        if (!regularPrice) regularPrice = salePrice;
        return { regularPrice, salePrice };
    }

    _formatPrice(element) {
        if (!element) return null;
        const bdi = element.querySelector('bdi');
        if (!bdi) return null;

        const dollars = bdi.querySelector('span')?.nextSibling?.textContent || '';
        const cents = element.querySelector('sup')?.textContent.replace('.', '') || '';

        return cents ? `$${dollars}.${cents}` : bdi.textContent;
    }

    getImages() {
        const imageContainer = this.doc.querySelector('.thumbnail-list');
        const imageElements = imageContainer?.querySelectorAll('.media--square img');
        return Array.from(imageElements || [])
            .map(img => img.getAttribute('src'))
            .filter(src => src)
            .map(src => this.formatImageUrl(src));
    }
}