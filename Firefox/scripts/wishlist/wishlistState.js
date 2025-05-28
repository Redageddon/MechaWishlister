const local_storage = (typeof browser !== 'undefined' ? browser : chrome).storage.local;

class WishlistState {
    constructor(onUpdate) {
        this.selectedGrades = new Set();
        this.onUpdate = onUpdate;
    }

    async saveWishlist(wishlist) {
        await local_storage.set({ wishlist });
        if (this.onUpdate) {
            this.onUpdate();
        }
    }

    async getWishlist() {
        const data = await local_storage.get({ wishlist: [] });
        return data.wishlist;
    }

    async clearWishlist() {
        await this.saveWishlist([]);
    }

    toggleGrade(grade, isSelected) {
        if (isSelected) {
            this.selectedGrades.add(grade);
        } else {
            this.selectedGrades.delete(grade);
        }
    }

    filterWishlist(wishlist) {
        if (this.selectedGrades.size === 0) return wishlist;
        return wishlist.filter(item => item.grade && this.selectedGrades.has(item.grade));
    }

    async refreshItemData(item) {
        try {
            const response = await fetch(item.url);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const updatedData = getProductData(doc, item.url);

            if (updatedData.regularPrice) {
                item.regularPrice = updatedData.regularPrice;
            }
            if (updatedData.salePrice) {
                item.salePrice = updatedData.salePrice;
            }
            return item;
        } catch (error) {
            console.error('Error refreshing item:', error);
            return item;
        }
    }
}