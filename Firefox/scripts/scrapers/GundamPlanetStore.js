class GundamPlanetStore extends BaseStore {
    getTitle() {
        return this.doc.querySelector('.product__title, h1')?.innerText;
    }

    getPrices() {
        const productContainer = this.doc.querySelector('.price__container .price__sale');
        let regularPrice = productContainer?.querySelector('.price__sale-old')?.innerText;
        let salePrice = productContainer.querySelector('.price__sale-current')?.childNodes[2]?.textContent;
        if (!regularPrice) regularPrice = salePrice;
        return { regularPrice, salePrice };
    }

    getImages() {
        const imageContainer = this.doc.querySelector('.product-thumb-wrapper .swiper-wrapper');
        const imageElements = imageContainer?.querySelectorAll('.imageslide-item img');
        return Array.from(imageElements || [])
            .map(img => img.getAttribute('src'))
            .filter(src => src)
            .map(src => this.formatImageUrl(src))
            .map(src => src.replace('_105x105_crop_center', ''));
    }
}