function addWishlistButton() {
    console.log('Attempting adding wishlist button...');
    const selectors = [
        '.product-form',                 // usagundamstore, gundamplacestore
        '[class*="grid-cols-add-bag-"]', // newtype
        '.product-form__buttons',        // gundamplanet
        '.add_to_cart_form',             // p-bandai
        '.product__form--add-to-cart'    // sidesevenexports
    ];

    const container = selectors.map(selector => document.querySelector(selector)).find(el => el);
    if (!container || document.querySelector('.mkw-wishlist-button')) return;

    const button = createWishlistButton();
    container.appendChild(button);
}

function createWishlistButton() {
    const button = document.createElement('button');
    button.classList.add('mkw-wishlist-button');
    button.innerText = 'Add to Wishlister';

    button.addEventListener('click', handleWishlistButtonClick);
    return button;
}

async function handleWishlistButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    try {
        const { wishlist = [] } = await browser.storage.local.get({ wishlist: [] });
        const product = getProductData(document, window.location.href);

        if (!product) {
            throw new Error('Failed to scrape product data');
        }

        if (wishlist.some(item => item.url === product.url)) {
            alert('Already in wishlist.');
            return;
        }

        await browser.storage.local.set({
            wishlist: [...wishlist, product]
        });
        alert('Added to wishlist!');
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        alert('Failed to add item to wishlist');
    }
}

window.addEventListener('load', addWishlistButton);