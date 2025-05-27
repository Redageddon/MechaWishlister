// Storage API for chromium extension
const storage = chrome.storage.local;

// Array of selectors to find the product form container
const selectors = [
    '.product-form',                    // usagundamstore, gundamplacestore
    '[class*="grid-cols-add-bag-"]',    // newtype
    '.product-form__buttons',           // gundamplanet
    '.add_to_cart_form',                // p-bandai
    '.product__form--add-to-cart',      // sidesevenexports
    '.item-detail__right'               // amiami
];

// Function that adds the wishlist button to the product page
const addWishlistButton = () => {
    console.log('Attempting adding wishlist button...');

    const container = selectors.map(selector => document.querySelector(selector)).find(el => el);
    if (!container || document.querySelector('.mkw-wishlist-button')) return false;

    const button = createWishlistButton();
    container.appendChild(button);
    return true;
}

// Function that handles the creation of the wishlist button
const createWishlistButton = () => {
    const button = document.createElement('button');
    button.classList.add('mkw-wishlist-button');
    button.innerText = 'Add to Wishlister';

    button.addEventListener('click', handleWishlistButtonClick);
    return button;
}

// Function that handles the click event of the wishlist button
const handleWishlistButtonClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
        const { wishlist = [] } = await storage.get({ wishlist: [] });
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

window.addEventListener('DOMContentLoaded', () => {
    // Declare a observer to watch for changes in the DOM
    const observer = new MutationObserver(() => {
        if (addWishlistButton()) observer.disconnect();
        else console.warn('No wishlist button added, waiting for more mutations...');
    });

    // Start observing the body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});






