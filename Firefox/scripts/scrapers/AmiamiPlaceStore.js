class AmiamiPlaceStore extends BaseStore {
    getTitle = () => {
        return this.doc.querySelector('.item-detail__section-title')?.innerText || '';
    }

    getPrices = () => {
        const regularPriceElement = this.doc.querySelector('.item-detail__price_state_discount-price');
        const salePriceElement = this.doc.querySelector('.item-detail__price_selling-price');

        // if no prices are found, return 'Sold Out'
        if (!regularPriceElement && !salePriceElement) return { regularPrice: 'Sold Out', salePrice: 'Sold Out' };

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
            const price = priceText.replace('jpy', '').trim();
            return `¥${price}`;
        }

        return `¥${priceText}`;
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