const { htmlToText } = require('html-to-text');

// Parses html page string
// Input: 
// page -- html page as a string
// Output:
// returns the pure text of the html page
const parser = {
    parsePage: function parsePage(page) {
        return htmlToText(page);
    }
}
module.exports = parser;
console.log(typeof parser.parsePage("<!DOCTYPE html><head> this thing </head><body><p>Hello world</p><p>This is violence incarnate.</p></body>"));