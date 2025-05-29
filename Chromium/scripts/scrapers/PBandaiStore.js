class PBandaiStore extends BaseStore {
    static {
        StoreRegistry.register('p-bandai.com', PBandaiStore);
    }

    getTitle() {
        return this.doc.querySelector('.o-product__name')?.innerText;
    }

    getPrices() {
        const productContainer = this.doc.querySelector('.o-product__price__wrapper');
        const regularPrice = '$ ' + productContainer?.querySelector('.o-product__price')?.innerText;
        return { regularPrice, salePrice: regularPrice };
    }

    getImages() {
        const imageContainer = this.doc.querySelector('.js-slider__thumbs .swiper-wrapper');
        const imageElements = imageContainer?.querySelectorAll('img');
        return Array.from(imageElements || [])
            .map(img => img.getAttribute('src'))
            .filter(src => src)
            .map(src => this.formatImageUrl(src))
            .map(src => src.replace('/p/t/', '/p/m/'));
    }
}