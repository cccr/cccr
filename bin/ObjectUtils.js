function ObjectUtils() {}

/**
 * Sets the value at path of object. If a portion of path doesn’t exist it’s created. Objects are created for missing properties.
 *
 * @param {Object} object
 * @param {string[]} path
 * @param {Object} value
 * @param {boolean} append
 * @returns {Object} `object`
 */
ObjectUtils.setKey = function(object, path, value, append) {
    function appendValueToPath() {
        if (Array.isArray(object[key])) {
            object[key].push(value);
        } else {
            if (typeof object[key] !== 'object') {
                object[key] += value;
            } else {
                if (Object.keys(object[key]).length === 0) {
                    object[key] = value;
                } else {
                    throw new Error('trying to append value to Object');
                }
            }
        }
    }
    
    var key = path.shift();
    if (object[key] == null) {
        object[key] = {};
    }
    if (path.length > 0) {
        object[key] = ObjectUtils.setKey(object[key], path, value, append);
    } else {
        append ? appendValueToPath() : object[key] = value
    }
    if (path.length == 0) {
        return object;
    }
};

/**
 * Returns Object's value by path or undefined
 * 
 * @param {Object} object
 * @param {string[]} path
 * @returns {Object|undefined}
 */
ObjectUtils.getKey = function(object, path) {
    var index = 0,
        length = path.length;
    while (object != null && index < length) {
        object = object[path[index++]];
    }
    return (index && index == length) ? object : undefined;
};

/**
 * Returns first key if Object has only one key
 *
 * @param {Object} object
 * @returns {string|undefined}
 */
ObjectUtils.getUniqueKey = function(object) {
    if (Array.isArray(object) || typeof object !== 'object') return undefined;
    var keys = Object.keys(object);
    if (keys.length == 1) {
        return keys[0];
    } if (keys.length == 0) {
        var util = require('util');
        console.log(util.inspect(object));
        throw new Error('no root key');
    } else {
        var util = require('util');
        console.log(util.inspect(object));
        throw new Error('more than one root key');
    }
};

/**
 * Returns value for Object's unique key
 *
 * @see getUniqueKey
 *
 * @param {Object} object
 * @returns {Object|undefined}
 */
ObjectUtils.getUniqueObject = function(object) {
    if (Array.isArray(object) || typeof object !== 'object') return undefined;
    return object[ObjectUtils.getUniqueKey(object)];
};

module.exports = ObjectUtils;