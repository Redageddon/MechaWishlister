const ANIMATION_CONFIG = {
    duration: 300, // milliseconds
    timing: 'ease-in-out',
    singlePositionDistance: 102.5 // percentage
};

function normalizePreferences(wishlist) {
    wishlist.forEach((item, index) => {
        if (!item.preference) {
            item.preference = index + 1;
        }
    });
    wishlist.sort((a, b) => a.preference - b.preference);
    wishlist.forEach((item, index) => {
        item.preference = index + 1;
    });
}

function swapPositions(wishlist, item, newPosition) {
    const oldPosition = item.preference;
    const targetPosition = Math.min(Math.max(1, newPosition), wishlist.length);

    if (oldPosition === targetPosition) return;

    wishlist.forEach(wishlistItem => {
        if (oldPosition < targetPosition) {
            if (wishlistItem.preference > oldPosition && wishlistItem.preference <= targetPosition) {
                wishlistItem.preference--;
            }
        } else {
            if (wishlistItem.preference >= targetPosition && wishlistItem.preference < oldPosition) {
                wishlistItem.preference++;
            }
        }
    });

    item.preference = targetPosition;
}

const positionSwapAnimation = async (items, oldPosition, newPosition) => {
    const currentElement = items[oldPosition - 1];
    const isMovingUp = oldPosition > newPosition;
    const distance = Math.abs(oldPosition - newPosition);

    const affectedElements = [];
    for (let i = Math.min(oldPosition - 1, newPosition - 1); i <= Math.max(oldPosition - 1, newPosition - 1); i++) {
        const element = items[i];
        if (element && element !== currentElement) {
            affectedElements.push(element);
        }
    }

    affectedElements.forEach(element => {
        element.style.transition = `transform ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.timing}`;
        element.style.transform = isMovingUp ?
            `translateY(${ANIMATION_CONFIG.singlePositionDistance}%)` :
            `translateY(-${ANIMATION_CONFIG.singlePositionDistance}%)`;
    });

    if (currentElement) {
        currentElement.style.transition = `transform ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.timing}`;
        const translation = `${(isMovingUp ? -1 : 1) * ANIMATION_CONFIG.singlePositionDistance * distance}%`;
        currentElement.style.transform = `translateY(${translation})`;
    }

    return new Promise(resolve => setTimeout(resolve, ANIMATION_CONFIG.duration));
};

function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    Object.assign(a, { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
}

function readFileAsJson(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                resolve(JSON.parse(e.target.result));
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsText(file);
    });
}