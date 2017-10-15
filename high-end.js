(function (HighEnd) {
    var ClassManager;

    window.HighEnd = HighEnd;

    /**
     * @param {Object} object Destination object.
     * @param {Object} config Source object.
     * @param {Object} [defaults] Default properties.
     * @return {Object}
     **/
    HighEnd.apply = function (object, config, defaults) {
        var property;

        if (defaults) {
            this.apply(object, defaults);
        }

        for (property in config) {
            if (config.hasOwnProperty(property)) {
                object[property] = config[property];
            }
        }

        return object;
    };

    HighEnd.apply(HighEnd, {
        app: function (config) {
            $(config.launch);
        },
        Base: HighEnd.Base || {},
        Array: HighEnd.Array || {},
        Object: HighEnd.Object || {},
        Function: HighEnd.Function || {},
        onePixel: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=',

        /**
         * @param {string} str
         * @returns {HTMLElement|Node}
         */
        stringToElement: function (str) {
            var div = document.createElement('div');

            div.innerHTML = str;

            return div.firstChild;
        },
        isNumber: function (value) {
            return typeof value === 'number' && isFinite(value);
        },
        destroy: function () {
            ClassManager.destroy();
            delete window.HighEnd;
        },
        destroyInstance: function (instance) {
            if (instance instanceof HighEnd.BaseClass) {
                instance.destroy();
            }
        },
        typeRe: /\s([a-zA-Z]+)/,
        type: function (value) {
            return Object.prototype.toString.call(value).match(this.typeRe)[1].toLowerCase();
        },
        cast: function (value, type) {
            var valueType = this.type(value);

            if (valueType === type) {
                return value;
            }

            if (value === undefined) {
                value = null;
            }

            if (type === 'string') {
                return value === null
                    ? ''
                    : String(value);
            }

            if (type === 'integer') {
                return value | 0;
            }

            if (type === 'float') {
                return value === null
                    ? 0
                    : parseFloat(value);
            }

            if (type === 'boolean') {
                if (value === null) {
                    return false;
                }

                if (valueType === 'boolean') {
                    return value;
                }

                if (valueType === 'number') {
                    return Boolean(parseFloat(value));
                }

                return true;
            }

            if (type === 'date') {
                return new Date(value);
            }

            return value;
        },

        /**
         * Safe method to log what is doing nothing when console not supported.
         */
        log: function () {
            var context = window.console;

            if (context) {
                context.log.apply(context, arguments);
            }
        },

        /**
         * Returns that a and b have the same structure and value even they are not the exactly same objects.
         *
         * @param a mixed
         * @param b mixed
         * @returns {boolean}
         */
        equal: function (a, b) {
            var equal = HighEnd.equal,
                type  = HighEnd.type(a),
                property, length;

            if (type !== HighEnd.type(b)) {
                return false;
            }

            if (type === 'date') {
                return a.toString() === b.toString();
            }

            if (type === 'object') {
                for (property in a) {
                    if (a.hasOwnProperty(property) && b.hasOwnProperty(property)) {
                        if (!equal(a[property], b[property])) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                for (property in b) {
                    if (b.hasOwnProperty(property) && a.hasOwnProperty(property)) {
                        if (!equal(a[property], b[property])) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                return true;
            }

            if (type === 'array') {
                if (a.length !== b.length) {
                    return false;
                }

                length = a.length;

                while (length--) {
                    if (!equal(a[length], b[length])) {
                        return false;
                    }
                }

                return true;
            }

            return a === b;
        },

        /**
         * @param item mixed
         * @param plain boolean default false
         * @returns {*}
         */
        clone: function (item, plain) {
            var me    = this,
                type  = me.type(item),
                clone = {},
                json  = window.JSON,
                length, property;

            if (item === null || item === undefined) {
                return item;
            }

            if (plain && json) {
                return json.parse(json.stringify(item));
            }

            if (item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }

            if (type === 'date') {
                return new Date(item.getTime());
            }

            if (type === 'array') {
                length = item.length;
                clone  = [];

                while (length--) {
                    clone[length] = me.clone(item[length]);
                }

                return clone;
            }

            if (type === 'object' && item.constructor === Object) {
                for (property in item) {
                    if (item.hasOwnProperty(property)) {
                        clone[property] = me.clone(item[property]);
                    }
                }

                return clone;
            }

            return item;
        },

        /**
         * Copy properties that don't exist in the destination object.
         *
         * @this {HighEnd}
         * @param {object} object
         * @param {object} config
         * @return {object}
         **/
        applyIfNot: function (object, config) {
            var property;

            for (property in config) {
                if (config.hasOwnProperty(property)
                    && object[property] === undefined) {
                    object[property] = config[property];
                }
            }

            return object;
        },

        /**
         * Define a new class with the name and definition provided.
         *
         * @this {HighEnd}
         * @param {string} name
         * @param {object} definition
         * @return {object}
         **/
        define: function (name, definition) {
            return ClassManager.define(name, definition);
        },

        /**
         * Create an instance of an existing class.
         *
         * @this {HighEnd}
         * @param {string} name
         * @return {object}
         **/
        create: function (name) {
            return ClassManager.create.apply(ClassManager, arguments);
        },

        /**
         * Create an instance of an existing class by alias.
         *
         * @this {HighEnd}
         * @param {string} alias
         * @return {object}
         **/
        createByAlias: function (alias) {
            return ClassManager.createByAlias.apply(ClassManager, arguments);
        },

        /**
         * Create an instance of an existing class.
         *
         * @this {HighEnd}
         * @param {string} name Application.Group.Functionality.Class
         * @param {object} value
         * @return {object}
         **/
        ns: function (name, value) {
            var ns    = window,
                parts = name.split('.'),
                i     = 0,
                last  = parts.length - 1,
                leaf  = parts[last],
                part;

            for (; i < last; i++) {
                part = parts[i];
                ns   = ns[part] = ns[part] || {};
            }

            return ns[leaf] = value;
        },
        removeNs: function (name) {
            var ns    = window,
                parts = name.split('.'),
                i     = 0,
                last  = parts.length - 1,
                leaf  = parts[last];

            for (; i < last; i++) {
                ns = ns[parts[i]];
            }

            delete ns[leaf];
        }
    });

    HighEnd.apply(HighEnd.Object, {

        /**
         * @param {Object} object
         * @returns {String[]}
         */
        getProperties: function (object) {
            var results = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    results.push(property);
                }
            }

            return results;
        },

        /**
         * @param {Object} object
         * @returns {Array}
         */
        getValues: function (object) {
            var results = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    results.push(object[property]);
                }
            }

            return results;
        },
        merge: function () {
            var result = {},
                i      = 0,
                object, property;

            for (; /** @type {Object} */ object = arguments[i]; i++) {
                for (property in object) {
                    if (object.hasOwnProperty(property)) {
                        result[property] = HighEnd.clone(object[property]);
                    }
                }
            }

            return result;
        },

        /**
         * @this {HighEnd.Object}
         * @param {object} object
         * @return {object}
         **/
        chain: function (object) {
            var i = function () {
                },
                result;

            i.prototype = object;
            result      = new i;
            i.prototype = null;

            return result;
        }
    });

    HighEnd.apply(HighEnd.Function, {
        hold: function (fnFirst, fnSecond, context) {
            return function () {
                var context = context || this;

                return fnFirst.apply(context, arguments) === false
                    ? false
                    : fnSecond.apply(context, arguments);
            };
        },
        wait: function (fn, wait, context) {
            var timer;

            return function () {
                var args    = Array.prototype.slice.call(arguments),
                    context = context || this;

                window.clearTimeout(timer);

                timer = window.setTimeout(function () {
                    fn.apply(context, args);
                }, wait);
            };
        },
        bind: function (fn, context) {
            var args = Array.prototype.slice.call(arguments, 2);

            return function () {
                return fn.apply(context || this, args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    });

    HighEnd.apply(HighEnd.Array, {
        fill: function (number, value) {
            var i       = 0,
                results = [];

            for (; i < number; i++) {
                results.push(HighEnd.clone(value));
            }

            return results;
        },
        range: function (start, end, step) {
            var results = [];

            step = step || 1;

            for (; start <= end; start += step) {
                results.push(start);
            }

            return results;
        },
        contain: function (items, item) {
            var i      = 0,
                length = items.length;

            for (; i < length; i++) {
                if (items[i] === item) {
                    return true;
                }
            }

            return false;
        },
        unique: function (items) {
            var results = [],
                i       = 0,
                length  = items.length,
                item;

            for (; i < length; i++) {
                item = items[i];

                if (this.contain(results, item)) {
                    results.push(item);
                }
            }

            return results;
        },
        collect: function (items, property) {
            var results = [],
                i       = 0,
                item;

            for (; item = items[i]; i++) {
                results.push(item[property]);
            }

            return results;
        },
        map: function (items, fn, context) {
            var results = [],
                i       = 0,
                length  = items.length;

            context = context || this;

            for (; i < length; i++) {
                results.push(fn.call(context, items[i], i, items));
            }

            return results;
        },
        filter: function (items, fn, context) {
            var results = [],
                i       = 0,
                length  = items.length,
                item;

            context = context || this;

            for (; i < length; i++) {
                item = items[i];

                if (fn.call(context, item, i, items) === true) {
                    results.push(item);
                }
            }

            return results;
        },
        find: function (items, fn, context) {
            var i      = 0,
                length = items.length,
                item;

            context = context || this;

            for (; i < length; i++) {
                item = items[i];

                if (fn.call(context, item, i, items) === true) {
                    return item;
                }
            }

            return false;
        }
    });

    HighEnd.apply(HighEnd.Base, {
        type: HighEnd.type,
        cast: HighEnd.cast,
        log: HighEnd.log,
        clone: HighEnd.clone,
        equal: HighEnd.equal
    });

    HighEnd.ClassManager = ClassManager = (function () {
        return {
            classes: {},
            aliases: {},
            destroy: function () {
                var classes    = this.classes,
                    namespaces = {},
                    cls, name;

                for (name in classes) {
                    if (classes.hasOwnProperty(name)) {

                        // collect root namespaces
                        namespaces[name.split('.')[0]] = true;

                        cls = classes[name];

                        // destroy all singletons first
                        if (cls.singleton) {
                            cls.destroy();
                            this.unregister(name);
                        }
                    }
                }

                // destroy any other instantiable class
                for (name in classes) {
                    if (classes.hasOwnProperty(name)) {
                        this.destroyClass(classes[name]);
                    }
                }

                // keep the main namespace
                delete namespaces['HighEnd'];

                // remove all others
                for (name in namespaces) {
                    if (namespaces.hasOwnProperty(name)) {
                        delete window[name];
                    }
                }
            },
            destroyClass: function (cls) {
                var prototype, property, value;

                cls       = this.ensure(cls);
                prototype = cls.prototype;

                for (property in prototype) {
                    if (prototype.hasOwnProperty(property)) {
                        value = prototype[property];

                        if (typeof value === 'function') {

                            // remove circular reference
                            delete value.memberOf;
                        }
                    }
                }

                if (prototype.alias) {
                    this.unregisterAlias(prototype.alias);
                }

                this.unregister(prototype.className);
            },
            register: function (name, value) {
                this.classes[name] = HighEnd.ns(name, value);
            },
            unregister: function (name) {
                HighEnd.removeNs(name);
                delete this.classes[name];
            },
            registerAlias: function (name, value) {
                this.aliases[name] = value;
            },
            unregisterAlias: function (name) {
                delete this.aliases[name];
            },
            ensure: function (cls) {
                if (typeof cls === 'string') {
                    cls = this.classes[cls];
                }

                return cls;
            },
            createConstructor: function () {
                return function (args) {
                    this.constructor.apply(this, args);
                };
            },

            /**
             * @param {string} name
             * @param {Object|Function} definition
             * @param {string} [definition.extend]
             * @param {string[]} [definition.mixins]
             * @param {string} [definition.className]
             * @param {Object} [definition.statics]
             * @param {boolean} [definition.singleton]
             * @param {string} [definition.alias]
             */
            define: function (name, definition) {
                var me = this,
                    i  = me.createConstructor(definition),
                    mixins, mixin;

                if (typeof definition === 'function') {
                    definition = definition(i);
                }

                definition.className = name;

                mixins = definition.mixins;
                delete definition.mixins;

                me.extend(i, me.classes[definition.extend || 'HighEnd.BaseClass']);
                delete definition.extend;

                me.addStatics(i, definition.statics);
                delete definition.statics;

                me.addMembers(i, definition);

                if (mixins) {
                    for (mixin in mixins) {
                        if (mixins.hasOwnProperty(mixin)) {
                            me.mixin(i, me.classes[mixins[mixin]]);
                        }
                    }
                }

                if (definition.singleton) {
                    i = new i;
                }

                if (definition.alias) {
                    this.registerAlias(definition.alias, i);
                }

                me.register(name, i);
            },
            create: function (name) {
                var args = Array.prototype.slice.call(arguments, 1);

                return new this.classes[name](args);
            },
            createByAlias: function (alias) {
                var args = Array.prototype.slice.call(arguments, 1);

                return new this.aliases[alias](args);
            },
            extend: function (subClass, superClass) {
                var prototype = superClass.prototype;

                subClass.prototype  = HighEnd.Object.chain(prototype);
                subClass.superclass = prototype;
            },
            mixin: function (subClass, mixinClass) {
                var subPrototype   = subClass.prototype,
                    mixinPrototype = mixinClass.prototype,
                    property, mixinValue;

                if (subPrototype.hasOwnProperty('mixins') === false) {
                    if ('mixins' in subPrototype) {
                        subPrototype.mixins = HighEnd.Object.chain(subPrototype.mixins);
                    } else {
                        subPrototype.mixins = {};
                    }
                }

                for (property in mixinPrototype) {
                    if (property === 'mixinId') {
                        continue;
                    }

                    mixinValue = mixinPrototype[property];

                    if (property === 'mixins') {
                        HighEnd.applyIfNot(subPrototype.mixins, mixinValue);
                    } else {
                        if (subPrototype[property] === undefined) {
                            subPrototype[property] = mixinValue;
                        }
                    }
                }

                subPrototype.mixins[mixinPrototype['mixinId']] = mixinPrototype;
            },
            addStatics: function (cls, statics) {
                HighEnd.apply(this.ensure(cls), statics);
            },
            addMembers: function (cls, members) {
                var prototype, property, value;

                cls       = this.ensure(cls);
                prototype = cls.prototype;

                for (property in members) {
                    if (members.hasOwnProperty(property)) {
                        value = members[property];

                        if (typeof value === 'function') {
                            value.memberOf   = cls;
                            value.methodName = property;
                        }

                        prototype[property] = value;
                    }
                }
            }
        };
    })();

    /**
     * @class HighEnd.BaseClass
     */
    ClassManager.register('HighEnd.BaseClass', function () {
    });
    ClassManager.addMembers('HighEnd.BaseClass', {
        className: 'HighEnd.BaseClass',
        initConfig: function (config) {
            HighEnd.apply(this, config);
        },
        constructor: function () {
        },
        destroy: function () {
            var me = this,
                value, property;

            for (property in me) {
                if (me.hasOwnProperty(property)) {
                    value = me[property];

                    if (value instanceof HighEnd.BaseClass) {
                        value.destroy();
                    }

                    delete me[property];
                }
            }
        },
        callParent: function () {
            var caller = this.callParent.caller;

            return caller.memberOf.superclass[caller.methodName].apply(this, arguments);
        }
    });
})({});
