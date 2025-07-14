const mockUrls = [];


const findUrlByShortcode = (shortcode) => {
    return mockUrls.find(url => url.shortcode === shortcode);
};

const saveUrl = (urlEntry) => {
    mockUrls.push(urlEntry);
    return urlEntry; 
};


const deleteUrlByShortcode = (shortcode) => {
    const initialLength = mockUrls.length;
    const index = mockUrls.findIndex(url => url.shortcode === shortcode);
    if (index !== -1) {
        mockUrls.splice(index, 1);
        return true;
    }
    return false;
};

module.exports = {
    mockUrls,
    findUrlByShortcode,
    saveUrl,
    deleteUrlByShortcode
};