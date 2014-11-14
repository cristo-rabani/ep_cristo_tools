Cristo = {};

/**
 * Creates an empty object inside namespace if not existent.
 * @param object
 * @param {String} path
 * @param {*} value in path. default is object if no matches in path
 * @example var obj = {};
 * set(obj, 'foo.bar'); // {}
 * console.log(obj);  // {foo:{bar:{}}}
 * @returns {*} it'll return created object or existing object.
 */
Cristo.set = function(object, path, value) {
    if (!_.isString(path)) {
        Cristo.log('Path must be type of String', 'error');
        return object;
    }
    var obj = object;
    _.each(path.split('.'), function(key, index, list){
        if (!obj[key]) {
            obj[key] = {};
        }
        if(!_.isUndefined(value) && list.length === (index + 1)){
            obj[key] = value;
        }
        obj = obj[key];
    });
    return object;
};

/**
 * Returns nested property value.
 * @param obj
 * @param prop
 * @example var obj = {
        foo : {
            bar : 11
        }
    };

 get(obj, 'foo.bar'); // "11"
 get(obj, 'ipsum.dolorem.sit');  // undefined
 * @returns {*} found property or undefined if property doesn't exist.
 */
Cristo.get = function(obj, prop){
    if(!_.isObject(obj)){
        throw new Error('Parameter object must be type of Object');
    }
    if(!_.isString(prop)){
        throw new Error('Parameter prop must be type of String');
    }
    var parts = prop.split('.');
    var last;

    if(_.isArray(parts)){
        last = parts.pop();
    } else{
        if(_.has(obj, prop)) {
            return obj[prop];
        } else{
            return;
        }
    }

    while (prop = parts.shift()) {
        obj = obj[prop];
        if (typeof obj !== 'object' || obj === null) {
            return;
        }
    }

    return (obj && obj[last] ? obj[last]:undefined);
};

/**
 * Checks if object contains a child property.
 * Useful for cases where you need to check if an object contain a nested property.
 * @param obj
 * @param prop
 * @returns {boolean}
 */
Cristo.has = function(obj, prop){
    return _.isObject(obj) && !_.isUndefined(Cristo.get(obj, prop));
};

Cristo.getParameterByName = function(name, queriesString) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(queriesString);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

