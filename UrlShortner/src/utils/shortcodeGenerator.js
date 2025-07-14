const { nanoid } = require('nanoid');
const { findUrlByShortcode } = require('../data/mockDatabase'); 

const generateUniqueShortcode = async (length = 7) => {
    let shortcode;
    let isUnique = false;

    while (!isUnique) {
        shortcode = nanoid(length);
      
        const existingUrl = findUrlByShortcode(shortcode);
        if (!existingUrl) {
            isUnique = true;
        }
    }
    return shortcode;
};

module.exports = {
    generateUniqueShortcode,
};