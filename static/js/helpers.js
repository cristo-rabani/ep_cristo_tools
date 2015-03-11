Cristo = {
    /**
     * Gets all attributes on line. Any attribute is nice described, and provides functions such remove, or changeValue.
     *  attribute.remove(withChar, limit) - remove attribute to the limit, if withChar == true then characters will be removed too.
     *  attribute.changeValue(newValue, limit) - replace current value on new to the limit
     *  - default limit is a count of following chars, which have the same attribute.
     * TIP: It should be called from stack callWithAce (inside)
     * @example: You can use Cristo.callWithAce(function(ace){Cristo.getAllAttributesOnLine()},'myCall')
     * @param lineNum {Number}
     * @returns {Array} of objects like this one {name, value, offset, limit, charStart, charEnd, remove(), changeValue()}
     */
    getAllAttributesOnLine: function(lineNum){
        var Changeset = require('ep_etherpad-lite/static/js/Changeset');
        var ChangesetUtils = require('ep_etherpad-lite/static/js/ChangesetUtils');
        var _ = require('ep_etherpad-lite/static/js/underscore');

        var aline = Cristo.rep.alines[lineNum];
        if(aline){
            var entry = Cristo.rep.lines.atIndex(lineNum);
            var text = entry.text;
            var opIter = Changeset.opIterator(aline);
            var ci = -1;
            var bci = -1;
            var attributes = [];
            while (opIter.hasNext()) {
                var op = opIter.next();
                bci = ci + 1;
                ci += op.chars;
                Changeset.eachAttribNumber(op.attribs, function (n) {
                    if(bci > text.length){ return; }
                    attributes.push({
                        name: Cristo.rep.apool.getAttribKey(n),
                        value: Cristo.rep.apool.getAttribValue(n),
                        offset: bci,
                        limit: ci - bci + 1,
                        charStart: text[bci],
                        charEnd: text[Math.min(ci, text.length - 1)],
                        remove: function(withChar, limit){
                            limit = Math.min(this.offset + ( limit>0? limit:this.limit ), entry.width);
                            var builder = Changeset.builder(Cristo.rep.lines.totalWidth());
                            if(withChar){
                                ChangesetUtils.buildKeepToStartOfRange(Cristo.rep, builder, [lineNum, this.offset]);
                                ChangesetUtils.buildRemoveRange(Cristo.rep, builder, [lineNum, this.offset], [lineNum, limit]);
                            } else{
                                var attribs = _replaceAttrib(this);
                                //console.log('rm', attribs, this.name, this.value, 'ch: '+this.char, 'l', lineNum, this.offset, limit);
                                ChangesetUtils.buildKeepToStartOfRange(Cristo.rep, builder, [lineNum, this.offset]);
                                ChangesetUtils.buildKeepRange(Cristo.rep, builder, [lineNum, this.offset], [lineNum, limit], attribs, Cristo.rep.apool);
                            }
                            return Cristo.documentAttributeManager.applyChangeset(builder);
                        },
                        changeValue:function(newValue, limit){
                            limit = Math.min(this.offset + ( limit>0? limit:this.limit ), entry.width);
                            var builder = Changeset.builder(Cristo.rep.lines.totalWidth());
                            var attribs = _replaceAttrib(this, newValue);
                            ChangesetUtils.buildKeepToStartOfRange(Cristo.rep, builder, [lineNum, this.offset]);
                            ChangesetUtils.buildKeepRange(Cristo.rep, builder, [lineNum, this.offset], [lineNum, limit], attribs, Cristo.rep.apool);
                            return Cristo.documentAttributeManager.applyChangeset(builder);
                        }
                    });
                });
            }

            var _replaceAttrib = function(cont, value){
                value = value || '';
                return _.chain(attributes).map(function(a){
                    if(a.offset === cont.offset && a.char === cont.char){
                        if(a.name === cont.name && a.value === cont.value){
                            return [a.name, value];
                        }
                    }
                }).filter(function(v){return v;}).value();
            };

            return attributes;
        }
        return [];
    },
    /**
     * Returns attributes filtered out by name of attribute on selected line
     * TIP: It should be called from stack callWithAce (inside)
     * @example: You can use Cristo.callWithAce(function(ace){Cristo.getAttributesOnLineByRange()},'myCall')
     * @param lineNum {Number}
     * @param attributeName {String}
     * @see Cristo.getAllAttributesOnLine
     * @returns {Array} name, value, offset, limit, charStart, charEnd, remove(), changeValue()
     */
    getAttributesOnLineByName: function (lineNum, attributeName){
        var _ = require('ep_etherpad-lite/static/js/underscore');
        if(!_.isArray(attributeName)){
            attributeName = [attributeName];
        }
        var allAttribs = this.getAllAttributesOnLine(lineNum);
        return _.filter(allAttribs, function(a){
            return _.contains(attributeName, a.name);
        });
    }
};

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

