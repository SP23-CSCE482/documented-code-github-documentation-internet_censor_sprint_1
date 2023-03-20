const { htmlToText } = require('html-to-text');

// Parses html page string
// Input: 
// page -- html page as a string
// Output:
// returns the pure text of the html page
const parser = {
  parsePage: function parsePage(page) {
    return htmlToText(page);
  },
};
module.exports = parser;
