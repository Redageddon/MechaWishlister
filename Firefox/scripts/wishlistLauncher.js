browser.action.onClicked.addListener(async () => {
    await browser.tabs.create({
        url: browser.runtime.getURL("wishlist.html")
    });
});