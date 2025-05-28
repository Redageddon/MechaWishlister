const api = (typeof browser !== 'undefined' ? browser : chrome);

api.action.onClicked.addListener(async () => {
    await api.tabs.create({
        url: api.runtime.getURL("wishlist.html")
    });
});