class UsaGundamStore extends BaseStore {
    getTitle() {
        return this.doc.querySelector('.product__title, h1')?.innerText;
    }

    getPrices() {
        const productContainer = this.doc.querySelector('.product__info-wrapper');
        const regularPrice = productContainer?.querySelector('s.price-item.price-item--regular')?.innerText;
        const salePrice = productContainer?.querySelector('.price-item--sale')?.innerText;
        return { regularPrice, salePrice };
    }

    getImages() {
        const imageContainer = this.doc.querySelector('.product__media-list');
        const imageElements = imageContainer?.querySelectorAll('.product__media img');
        return Array.from(imageElements || [])
            .map(img => img.getAttribute('src'))
            .filter(src => src)
            .map(src => this.formatImageUrl(src))
    }
}