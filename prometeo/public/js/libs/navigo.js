/**
 * Ultra simple router module
 * Requirejs porting of Navigo (https://github.com/krasimir/navigo)
 */
define(function(){
    "use strict";

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    var PARAMETER_REGEXP = /([:*])(\w+)/g;
    var WILDCARD_REGEXP = /\*/g;
    var REPLACE_VARIABLE_REGEXP = '([^\/]+)';
    var REPLACE_WILDCARD = '(?:.*)';
    var FOLLOWED_BY_SLASH_REGEXP = '(?:\/|$)';

    function clean(s) {
        if (s instanceof RegExp) return s;
        return s.replace(/\/+$/, '').replace(/^\/+/, '/');
    }

    function regExpResultToParams(match, names) {
        if (names.length === 0) return null;
        if (!match) return null;
        return match.slice(1, match.length).reduce(function (params, value, index) {
            if (params === null) params = {};
            params[names[index]] = value;
            return params;
        }, null);
    }

    function replaceDynamicURLParts(route) {
        var paramNames = [],
            regexp;

        if (route instanceof RegExp) {
            regexp = route;
        } else {
            regexp = new RegExp(clean(route).replace(PARAMETER_REGEXP, function (full, dots, name) {
                    paramNames.push(name);
                    return REPLACE_VARIABLE_REGEXP;
                }).replace(WILDCARD_REGEXP, REPLACE_WILDCARD) + FOLLOWED_BY_SLASH_REGEXP);
        }
        return { regexp: regexp, paramNames: paramNames };
    }

    function findMatchedRoutes(url) {
        var routes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        return routes.map(function (route) {
            var _replaceDynamicURLPar = replaceDynamicURLParts(route.route);

            var regexp = _replaceDynamicURLPar.regexp;
            var paramNames = _replaceDynamicURLPar.paramNames;

            var match = url.match(regexp);
            var params = regExpResultToParams(match, paramNames);

            return match ? { match: match, route: route, params: params } : false;
        }).filter(function (m) {
            return m;
        });
    }

    function match(url, routes) {
        return findMatchedRoutes(url, routes)[0] || false;
    }

    function root(url, routes) {
        var matched = findMatchedRoutes(url, routes.filter(function (route) {
            var u = clean(route.route);

            return u !== '' && u !== '*';
        }));
        var fallbackURL = clean(url);

        if (matched.length > 0) {
            return matched.map(function (m) {
                return clean(url.substr(0, m.match.index));
            }).reduce(function (root, current) {
                return current.length < root.length ? current : root;
            }, fallbackURL);
        }
        return fallbackURL;
    }

    function isPushStateAvailable() {
        return !!(typeof window !== 'undefined' && window.history && window.history.pushState);
    }

    function Navigo(r, useHash) {
        this._routes = [];
        this.root = useHash && r ? r.replace(/\/$/, '/#') : r || null;
        this._useHash = useHash;
        this._paused = false;
        this._destroyed = false;
        this._lastRouteResolved = null;
        this._ok = !useHash && isPushStateAvailable();
        this._listen();
        this.updatePageLinks();
    }

    Navigo.prototype = {
        helpers: {
            match: match,
            root: root,
            clean: clean
        },
        navigate: function navigate(path, absolute) {
            var to;

            path = path || '';
            if (this._ok) {
                to = (!absolute ? this._getRoot() + '/' : '') + clean(path);
                to = to.replace(/([^:])(\/{2,})/g, '$1/');
                history[this._paused ? 'replaceState' : 'pushState']({}, '', to);
                this.resolve();
            } else if (typeof window !== 'undefined') {
                window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
            }
            return this;
        },
        on: function on() {
            if (arguments.length >= 2) {
                this._add(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]);
            } else if (_typeof(arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
                for (var route in arguments.length <= 0 ? undefined : arguments[0]) {
                    this._add(route, (arguments.length <= 0 ? undefined : arguments[0])[route]);
                }
            } else if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'function') {
                this._add('', arguments.length <= 0 ? undefined : arguments[0]);
            }
            return this;
        },
        resolve: function resolve(current) {
            var handler, m;
            var url = (current || this._cLoc()).replace(this._getRoot(), '');

            if (this._paused || url === this._lastRouteResolved) return false;
            if (this._useHash) {
                url = url.replace(/^\/#/, '/');
            }
            m = match(url, this._routes);

            if (m) {
                this._lastRouteResolved = url;
                handler = m.route.handler;
                m.route.route instanceof RegExp ? handler.apply(undefined, _toConsumableArray(m.match.slice(1, m.match.length))) : handler(m.params);
                return m;
            }
            return false;
        },
        destroy: function destroy() {
            this._routes = [];
            this._destroyed = true;
            clearTimeout(this._listenningInterval);
            typeof window !== 'undefined' ? window.onpopstate = null : null;
        },
        updatePageLinks: function updatePageLinks() {
            var _this = this;

            if (typeof document === 'undefined') return;
            this._findLinks().forEach(function (link) {
                var location = link.getAttribute('href');

                link.addEventListener('click', function (e) {
                    if (!_this._destroyed) {
                        e.preventDefault();
                        _this.navigate(clean(location));
                    }
                });
            });
        },
        generate: function generate(name) {
            var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return this._routes.reduce(function (result, route) {
                var key;

                if (route.name === name) {
                    result = route.route;
                    for (key in data) {
                        result = result.replace(':' + key, data[key]);
                    }
                }
                return result;
            }, '');
        },
        link: function link(path) {
            return this._getRoot() + path;
        },
        pause: function pause(status) {
            this._paused = status;
        },
        disableIfAPINotAvailable: function disableIfAPINotAvailable() {
            if (!isPushStateAvailable()) {
                this.destroy();
            }
        },
        _add: function _add(route) {
            var handler = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if ((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object') {
                this._routes.push({ route: route, handler: handler.uses, name: handler.as });
            } else {
                this._routes.push({ route: route, handler: handler });
            }
            return this._add;
        },
        _getRoot: function _getRoot() {
            if (this.root !== null) return this.root;
            this.root = root(this._cLoc(), this._routes);
            return this.root;
        },
        _listen: function _listen() {
            var _this2 = this;

            if (this._ok) {
                window.onpopstate = function () {
                    _this2.resolve();
                };
            } else {
                (function () {
                    var cached = _this2._cLoc(),
                        current = undefined,
                        _check = undefined;

                    _check = function check() {
                        current = _this2._cLoc();
                        if (cached !== current) {
                            cached = current;
                            _this2.resolve();
                        }
                        _this2._listenningInterval = setTimeout(_check, 200);
                    };
                    _check();
                })();
            }
        },
        _cLoc: function _cLoc() {
            if (typeof window !== 'undefined') {
                return window.location.href;
            }
            return '';
        },
        _findLinks: function _findLinks() {
            return [].slice.call(document.querySelectorAll('[data-navigo]'));
        }
    };

    return Navigo;

});