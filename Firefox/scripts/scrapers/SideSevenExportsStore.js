class SideSevenExportsStore extends BaseStore {
    static {
        StoreRegistry.register('sidesevenexports.com', SideSevenExportsStore);
    }

    getTitle() {
        return this.doc.querySelector('h2')?.innerText;
    }

    getPrices() {
        const productContainer = this.doc.querySelector('.product__price');
        const regularPrice = productContainer?.querySelector('.product__price--reg')?.innerText;
        return { regularPrice, salePrice: regularPrice };
    }

    getImages() {
        const imageElements = this.doc.querySelectorAll('img');
        return Array.from(imageElements || [])
            .map(img => img.getAttribute('src'))
            .filter(src => src)
            .map(src => this.formatImageUrl(src))
            .map(src => src.replace('_300x', ''));
    }
}