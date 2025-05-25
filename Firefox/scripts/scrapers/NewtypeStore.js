class NewtypeStore extends BaseStore {
    getTitle() {
        return this.doc.querySelector('h2')?.innerText;
    }

    getPrices() {
        const priceContainer = this.doc.querySelector('div.flex.flex-row.items-center.mb-1.text-lg');
        let regularPrice = priceContainer?.querySelector('.original-price')?.innerText;
        let salePrice = priceContainer?.querySelector('.text-base')?.innerText;
        if (!regularPrice) regularPrice = salePrice;
        return { regularPrice, salePrice };
    }

    getImages() {
        const imageContainer = this.doc.querySelector('.scroller');
        const imageElements = imageContainer.querySelectorAll('[class*="w-thumbnail"][style*="background-image"]');
        return Array.from(imageElements)
            .map(div => {
                const style = div.style.backgroundImage;
                return style.replace(/^url\(['"](.+)['"]\)$/, '$1');
            })
            .filter(src => src)
            .map(src => this.formatImageUrl(src));
    }
}