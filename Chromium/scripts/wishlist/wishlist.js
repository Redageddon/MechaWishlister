const GUNPLA_GRADES = [
    'Advanced Grade', 'Entry Grade', 'Full Mechanics', 'High Grade',
    'Master Grade', 'Master Grade SD', 'Mega Size Model', 'No Grade',
    'Other', 'Perfect Grade', 'Real Grade', 'Reborn-100', 'Super Deformed'
];

class WishlistUI {
    constructor(state) {
        this.state = state;
        this.template = document.getElementById('wishlist-item-template');
        this.setupEventListeners();
        this.setupGradeOptions();
    }

    setupEventListeners() {
        document.getElementById('clear').addEventListener('click', () => this.handleClear());
        document.getElementById('export').addEventListener('click', () => this.handleExport());
        document.getElementById('import').addEventListener('click', () => this.handleImport());
        document.getElementById('refresh').addEventListener('click', () => this.handleRefresh());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileInput(e));
    }

    setupGradeOptions() {
        const gradeSelects = this.template.content.querySelectorAll('.mkw-grade-select');
        gradeSelects.forEach(select => {
            GUNPLA_GRADES.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = grade;
                select.appendChild(option);
            });
        });
    }

    createGradeFilters() {
        const filterContainer = document.getElementById('grade-filters');
        const template = document.getElementById('grade-filter-template');
        filterContainer.innerHTML = '';

        GUNPLA_GRADES.forEach(grade => {
            const clone = template.content.cloneNode(true);
            const checkbox = clone.querySelector('input');
            const label = clone.querySelector('.grade-name');

            checkbox.value = grade;
            checkbox.checked = this.state.selectedGrades.has(grade);
            checkbox.addEventListener('change', (e) => {
                this.state.toggleGrade(grade, e.target.checked);
                this.render();
            });

            label.textContent = grade;
            filterContainer.appendChild(clone);
        });
    }

    async handleClear() {
        if (confirm('Are you sure you want to clear your wishlist?')) {
            await this.state.clearWishlist();
            location.reload();
        }
    }

    async handleExport() {
        const wishlist = await this.state.getWishlist();
        normalizePreferences(wishlist);
        downloadJson(wishlist, 'wishlist.json');
    }

    handleImport() {
        document.getElementById('fileInput').click();
    }

    async handleFileInput(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const wishlistData = await readFileAsJson(file);
            normalizePreferences(wishlistData);
            await this.state.saveWishlist(wishlistData);
            this.render();
        } catch (error) {
            alert('Invalid wishlist file');
        }
    }

    async handleRefresh() {
        const refreshButton = document.getElementById('refresh');
        refreshButton.textContent = 'Refreshing...';
        refreshButton.disabled = true;

        try {
            const wishlist = await this.state.getWishlist();
            const updatedWishlist = await Promise.all(
                wishlist.map(item => this.state.refreshItemData(item))
            );
            await this.state.saveWishlist(updatedWishlist);
            alert('Wishlist data has been refreshed!');
        } catch (error) {
            console.error('Error refreshing wishlist:', error);
            alert('There was an error refreshing the wishlist data.');
        } finally {
            refreshButton.textContent = 'Refresh Prices';
            refreshButton.disabled = false;
        }
    }

    createWishlistItem(item, index, wishlist) {
        const clone = this.template.content.cloneNode(true);
        const wrapper = clone.querySelector('.mkw-wrapper');

        this.setupItemBasics(clone, item, index);
        this.setupItemGrade(clone, item, wishlist);
        this.setupItemStatus(clone, item, wishlist);
        this.setupItemPreferences(clone, item, wishlist);
        this.setupItemImages(clone, item, index);
        this.setupItemDeletion(clone, item, wishlist);

        return wrapper;
    }

    setupItemBasics(clone, item, index) {
        const mainImage = clone.querySelector('.mkw-main-image');
        const link = clone.querySelector('.mkw-link');
        const [regularPrice, salePrice] = [
            clone.querySelector('.mkw-regular-price'),
            clone.querySelector('.mkw-sale-price')
        ];

        Object.assign(mainImage, {
            src: item.images[0],
            id: `main-image-${index}`
        });

        Object.assign(link, {
            href: item.url,
            textContent: item.title
        });

        regularPrice.textContent = item.regularPrice;
        salePrice.textContent = item.salePrice;
    }

    setupItemGrade(clone, item, wishlist) {
        const gradeSelect = clone.querySelector('.mkw-grade-select');
        gradeSelect.value = item.grade || '';
        gradeSelect.addEventListener('change', async e => {
            item.grade = e.target.value;
            await this.state.saveWishlist(wishlist);
        });
    }

    setupItemStatus(clone, item, wishlist) {
        const checkboxes = {
            inProgress: clone.querySelector('[data-status="inProgress"]'),
            built: clone.querySelector('[data-status="built"]')
        };

        Object.entries(checkboxes).forEach(([status, checkbox]) => {
            checkbox.checked = item[status] || false;
            checkbox.addEventListener('change', async e => {
                item[status] = e.target.checked;
                if (e.target.checked) {
                    const otherStatus = status === 'inProgress' ? 'built' : 'inProgress';
                    checkboxes[otherStatus].checked = false;
                    item[otherStatus] = false;
                }
                await this.state.saveWishlist(wishlist);
            });
        });
    }

    setupItemPreferences(clone, item, wishlist) {
        const controls = {
            input: clone.querySelector('.mkw-preference-input'),
            decrease: clone.querySelector('.mkw-preference-button:first-child'),
            increase: clone.querySelector('.mkw-preference-button:last-child')
        };

        controls.input.value = item.preference;
        controls.input.max = wishlist.length;

        const updatePreference = async newPosition => {
            const oldPosition = item.preference;
            const targetPosition = Math.min(Math.max(1, newPosition), wishlist.length);
            
            if (oldPosition === targetPosition) return;

            const items = document.querySelectorAll('.mkw-wrapper');
            await positionSwapAnimation(items, oldPosition, targetPosition);
            
            swapPositions(wishlist, item, targetPosition);
            await this.state.saveWishlist(wishlist);
        };

        controls.increase.addEventListener('click', () =>
            item.preference > 1 && updatePreference(item.preference - 1));
        controls.decrease.addEventListener('click', () =>
            item.preference < wishlist.length && updatePreference(item.preference + 1));
        controls.input.addEventListener('change', e =>
            updatePreference(Math.min(Math.max(1, parseInt(e.target.value) || 1), wishlist.length)));
    }

    setupItemImages(clone, item, index) {
        const grid = clone.querySelector('.mkw-images');
        const gridSize = Math.floor(Math.sqrt(item.images.length)) + 1;
        grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        item.images.forEach(imgUrl => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.addEventListener('click', () => {
                document.getElementById(`main-image-${index}`).src = imgUrl;
            });
            grid.appendChild(thumb);
        });
    }

    setupItemDeletion(clone, item, wishlist) {
        clone.querySelector('.mkw-delete-button').addEventListener('click', async () => {
            if (confirm('Are you sure you want to remove this item from your wishlist?')) {
                const updatedWishlist = wishlist.filter(i => i.url !== item.url);
                await this.state.saveWishlist(updatedWishlist);
            }
        });
    }

    async render() {
        const wishlist = await this.state.getWishlist();
        const container = document.getElementById('wishlist');
        container.innerHTML = '';

        normalizePreferences(wishlist);
        const filteredWishlist = this.state.filterWishlist(wishlist);
        const sortedWishlist = filteredWishlist.sort((a, b) =>
            (a.preference || filteredWishlist.length) - (b.preference || filteredWishlist.length)
        );

        sortedWishlist.forEach((item, index) => {
            container.appendChild(this.createWishlistItem(item, index, wishlist));
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const wishlistUI = new WishlistUI();
    wishlistUI.state = new WishlistState(() => wishlistUI.render());
    wishlistUI.createGradeFilters();
    wishlistUI.render();
});