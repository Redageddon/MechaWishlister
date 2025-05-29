class AmiamiStore extends BaseStore {
    static {
        StoreRegistry.register('amiami.com', AmiamiStore);
    }

    getTitle = () => {
        return this.doc.querySelector('.item-detail__section-title')?.innerText || '';
    }

    getPrices = () => {
        const regularPriceElement = this.doc.querySelector('.item-detail__price_state_discount-price');
        const salePriceElement = this.doc.querySelector('.item-detail__price_selling-price');

        // if no prices are found, return 0.00f
        if (!regularPriceElement && !salePriceElement) return { regularPrice: '0.00', salePrice: '0.00' };

        let regularPrice = this._formatPrice(regularPriceElement);
        let salePrice = this._formatPrice(salePriceElement);

        // if no regular price is found, use sale price
        if (!regularPrice) regularPrice = salePrice;

        return { regularPrice, salePrice };
    }

    _formatPrice = (element) => {
        if (!element) return;

        const priceText = element.innerText.toLowerCase();

        if (priceText.includes('jpy')) {
            let price = priceText.replace('jpy', '').trim();
            return `¥${price}`;
        }
        return `¥${price}`;
    }

    getImages = () => {
        const imageContainer = this.doc.querySelector('.item-detail__image');
        const imageElements = imageContainer?.querySelectorAll('img'); // removed `.doc`

        return Array.from(imageElements || [])
            .map(img => img.getAttribute('src'))
            .filter(src => src)
            .map(src => this.formatImageUrl(src));
    }
}