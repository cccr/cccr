var logger = require('./Logger').Function;

function Fn() {}

/**
 * Template function. Concatenate first argument (template) n-times. n -- data-array's length
 *
 * Example:
 *
 * var Fn = require('./Functions.js');
 * var fn = new Fn();
 *
 * var data = {
 *      js: ["js/a.js", "js/b.js", "js/c.js"]
 * };
 * var scripts = fn.loop`<script src="${data.js}"></script>`;
 *
 * console.assert(scripts === '<script src="js/a.js"></script><script src="js/b.js"></script><script src="js/c.js"></script>');
 *
 * or more complicated:
 *
 * ...
 * var data = {
 *     items: {
 *         href: ["href1", "href2"],
 *         text: ["text1", "text2"]
 *     }
 * };
 * var scripts = fn.loop`<li><a href="${data.items.href}">${data.items.text}</a></li>`
 *
 * console.assert(scripts === '<li><a href="href1">text1</a></li><li><a href="href2">text2</a></li>');
 *
 * @param {string[]} strings - template parts
 * @param {Object[][]} values - supposed variables, expecting Array for each value
 * @returns {string} return filled and concatenated template
 */

Fn.prototype.loop = function (strings, ...values) {

    logger.debug('loop() strings', strings);
    logger.debug('loop() ...values', values);

    var result = '';

    for (var i = 0; i < values[0].length; i++) {
        var splitTemplateFragmentIndex = 0;
        values.forEach(function(arg) {
            result += strings[splitTemplateFragmentIndex++];
            result += arg[i];
        });
        result += strings[splitTemplateFragmentIndex];
    }
    return result;
};

module.exports = Fn;