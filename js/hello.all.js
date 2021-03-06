/*! hellojs v1.14.0 | (c) 2012-2016 Andrew Dodson | MIT https://adodson.com/hello.js/LICENSE */
Object.create || (Object.create = function() {
    function e() {}
    return function(t) {
        if (1 != arguments.length) throw new Error("Object.create implementation only accepts one parameter.");
        return e.prototype = t, new e
    }
}()), Object.keys || (Object.keys = function(e, t, n) {
    n = [];
    for (t in e) n.hasOwnProperty.call(e, t) && n.push(t);
    return n
}), Array.prototype.indexOf || (Array.prototype.indexOf = function(e) {
    for (var t = 0; t < this.length; t++)
        if (this[t] === e) return t;
    return -1
}), Array.prototype.forEach || (Array.prototype.forEach = function(e) {
    if (void 0 === this || null === this) throw new TypeError;
    var t = Object(this),
        n = t.length >>> 0;
    if ("function" != typeof e) throw new TypeError;
    for (var o = arguments.length >= 2 ? arguments[1] : void 0, i = 0; n > i; i++) i in t && e.call(o, t[i], i, t);
    return this
}), Array.prototype.filter || (Array.prototype.filter = function(e, t) {
    var n = [];
    return this.forEach(function(o, i, r) {
        e.call(t || void 0, o, i, r) && n.push(o)
    }), n
}), Array.prototype.map || (Array.prototype.map = function(e, t) {
    var n = [];
    return this.forEach(function(o, i, r) {
        n.push(e.call(t || void 0, o, i, r))
    }), n
}), Array.isArray || (Array.isArray = function(e) {
    return "[object Array]" === Object.prototype.toString.call(e)
}), "object" != typeof window || "object" != typeof window.location || window.location.assign || (window.location.assign = function(e) {
    window.location = e
}), Function.prototype.bind || (Function.prototype.bind = function(e) {
    function t() {}
    if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var n = [].slice,
        o = n.call(arguments, 1),
        i = this,
        r = function() {
            return i.apply(this instanceof t ? this : e || window, o.concat(n.call(arguments)))
        };
    return t.prototype = this.prototype, r.prototype = new t, r
});
var hello = function(e) {
    return hello.use(e)
};
hello.utils = {
        extend: function(e) {
            return Array.prototype.slice.call(arguments, 1).forEach(function(t) {
                if (Array.isArray(e) && Array.isArray(t)) Array.prototype.push.apply(e, t);
                else if (e instanceof Object && t instanceof Object && e !== t)
                    for (var n in t) e[n] = hello.utils.extend(e[n], t[n]);
                else Array.isArray(t) && (t = t.slice(0)), e = t
            }), e
        }
    }, hello.utils.extend(hello, {
        settings: {
            redirect_uri: window.location.href.split("#")[0],
            response_type: "token",
            display: "popup",
            state: "",
            oauth_proxy: "https://auth-server.herokuapp.com/proxy",
            timeout: 2e4,
            popup: {
                resizable: 1,
                scrollbars: 1,
                width: 500,
                height: 550
            },
            scope: ["basic"],
            scope_map: {
                basic: ""
            },
            default_service: null,
            force: null,
            page_uri: window.location.href
        },
        services: {},
        use: function(e) {
            var t = Object.create(this);
            return t.settings = Object.create(this.settings), e && (t.settings.default_service = e), t.utils.Event.call(t), t
        },
        init: function(e, t) {
            var n = this.utils;
            if (!e) return this.services;
            for (var o in e) e.hasOwnProperty(o) && "object" != typeof e[o] && (e[o] = {
                id: e[o]
            });
            return n.extend(this.services, e), t && (n.extend(this.settings, t), "redirect_uri" in t && (this.settings.redirect_uri = n.url(t.redirect_uri).href)), this
        },
        login: function() {
            function e(e, t) {
                hello.emit(e, t)
            }

            function t(e) {
                return e
            }

            function n(e) {
                return !!e
            }
            var o, i = this,
                r = i.utils,
                a = r.error,
                s = r.Promise(),
                l = r.args({
                    network: "s",
                    options: "o",
                    callback: "f"
                }, arguments),
                u = r.diffKey(l.options, i.settings),
                c = l.options = r.merge(i.settings, l.options || {});
            if (c.popup = r.merge(i.settings.popup, l.options.popup || {}), l.network = l.network || i.settings.default_service, s.proxy.then(l.callback, l.callback), s.proxy.then(e.bind(this, "auth.login auth"), e.bind(this, "auth.failed auth")), "string" != typeof l.network || !(l.network in i.services)) return s.reject(a("invalid_network", "The provided network was not recognized"));
            var d = i.services[l.network],
                f = r.globalEvent(function(e) {
                    var t;
                    t = e ? JSON.parse(e) : a("cancelled", "The authentication was not completed"), t.error ? s.reject(t) : (r.store(t.network, t), s.fulfill({
                        network: t.network,
                        authResponse: t
                    }))
                }),
                p = r.url(c.redirect_uri).href,
                m = d.oauth.response_type || c.response_type;
            /\bcode\b/.test(m) && !d.oauth.grant && (m = m.replace(/\bcode\b/, "token")), l.qs = r.merge(u, {
                client_id: encodeURIComponent(d.id),
                response_type: encodeURIComponent(m),
                redirect_uri: encodeURIComponent(p),
                state: {
                    client_id: d.id,
                    network: l.network,
                    display: c.display,
                    callback: f,
                    state: c.state,
                    redirect_uri: p
                }
            });
            var h = r.store(l.network),
                g = /[,\s]+/,
                v = i.settings.scope ? [i.settings.scope.toString()] : [],
                y = r.merge(i.settings.scope_map, d.scope || {});
            if (c.scope && v.push(c.scope.toString()), h && "scope" in h && h.scope instanceof String && v.push(h.scope), v = v.join(",").split(g), v = r.unique(v).filter(n), l.qs.state.scope = v.join(","), v = v.map(function(e) {
                    return e in y ? y[e] : e
                }), v = v.join(",").split(g), v = r.unique(v).filter(n), l.qs.scope = v.join(d.scope_delim || ","), c.force === !1 && h && "access_token" in h && h.access_token && "expires" in h && h.expires > (new Date).getTime() / 1e3) {
                var w = r.diff((h.scope || "").split(g), (l.qs.state.scope || "").split(g));
                if (0 === w.length) return s.fulfill({
                    unchanged: !0,
                    network: l.network,
                    authResponse: h
                }), s
            }
            if ("page" === c.display && c.page_uri && (l.qs.state.page_uri = r.url(c.page_uri).href), "login" in d && "function" == typeof d.login && d.login(l), (!/\btoken\b/.test(m) || parseInt(d.oauth.version, 10) < 2 || "none" === c.display && d.oauth.grant && h && h.refresh_token) && (l.qs.state.oauth = d.oauth, l.qs.state.oauth_proxy = c.oauth_proxy), l.qs.state = encodeURIComponent(JSON.stringify(l.qs.state)), 1 === parseInt(d.oauth.version, 10) ? o = r.qs(c.oauth_proxy, l.qs, t) : "none" === c.display && d.oauth.grant && h && h.refresh_token ? (l.qs.refresh_token = h.refresh_token, o = r.qs(c.oauth_proxy, l.qs, t)) : o = r.qs(d.oauth.auth, l.qs, t), e("auth.init", l), "none" === c.display) r.iframe(o, p);
            else if ("popup" === c.display) var _ = r.popup(o, p, c.popup),
                b = setInterval(function() {
                    if ((!_ || _.closed) && (clearInterval(b), !s.state)) {
                        var e = a("cancelled", "Login has been cancelled");
                        _ || (e = a("blocked", "Popup was blocked")), e.network = l.network, s.reject(e)
                    }
                }, 100);
            else window.location = o;
            return s.proxy
        },
        logout: function() {
            function e(e, t) {
                hello.emit(e, t)
            }
            var t = this,
                n = t.utils,
                o = n.error,
                i = n.Promise(),
                r = n.args({
                    name: "s",
                    options: "o",
                    callback: "f"
                }, arguments);
            if (r.options = r.options || {}, i.proxy.then(r.callback, r.callback), i.proxy.then(e.bind(this, "auth.logout auth"), e.bind(this, "error")), r.name = r.name || this.settings.default_service, r.authResponse = n.store(r.name), !r.name || r.name in t.services)
                if (r.name && r.authResponse) {
                    var a = function(e) {
                            n.store(r.name, null), i.fulfill(hello.utils.merge({
                                network: r.name
                            }, e || {}))
                        },
                        s = {};
                    if (r.options.force) {
                        var l = t.services[r.name].logout;
                        if (l)
                            if ("function" == typeof l && (l = l(a, r)), "string" == typeof l) n.iframe(l), s.force = null, s.message = "Logout success on providers site was indeterminate";
                            else if (void 0 === l) return i.proxy
                    }
                    a(s)
                } else i.reject(o("invalid_session", "There was no session to remove"));
            else i.reject(o("invalid_network", "The network was unrecognized"));
            return i.proxy
        },
        getAuthResponse: function(e) {
            return e = e || this.settings.default_service, e && e in this.services ? this.utils.store(e) || null : null
        },
        events: {}
    }), hello.utils.extend(hello.utils, {
        error: function(e, t) {
            return {
                error: {
                    code: e,
                    message: t
                }
            }
        },
        qs: function(e, t, n) {
            if (t) {
                n = n || encodeURIComponent;
                for (var o in t) {
                    var i = "([\\?\\&])" + o + "=[^\\&]*",
                        r = new RegExp(i);
                    e.match(r) && (e = e.replace(r, "$1" + o + "=" + n(t[o])), delete t[o])
                }
            }
            return this.isEmpty(t) ? e : e + (e.indexOf("?") > -1 ? "&" : "?") + this.param(t, n)
        },
        param: function(e, t) {
            var n, o, i = {};
            if ("string" == typeof e) {
                if (t = t || decodeURIComponent, o = e.replace(/^[\#\?]/, "").match(/([^=\/\&]+)=([^\&]+)/g))
                    for (var r = 0; r < o.length; r++) n = o[r].match(/([^=]+)=(.*)/), i[n[1]] = t(n[2]);
                return i
            }
            t = t || encodeURIComponent;
            var a = e;
            i = [];
            for (var s in a) a.hasOwnProperty(s) && a.hasOwnProperty(s) && i.push([s, "?" === a[s] ? "?" : t(a[s])].join("="));
            return i.join("&")
        },
        store: function() {
            function e() {
                var e = {};
                try {
                    e = JSON.parse(n.getItem("hello")) || {}
                } catch (t) {}
                return e
            }

            function t(e) {
                n.setItem("hello", JSON.stringify(e))
            }
            for (var n, o = ["localStorage", "sessionStorage"], i = -1, r = "test"; o[++i];) try {
                n = window[o[i]], n.setItem(r + i, i), n.removeItem(r + i);
                break
            } catch (a) {
                n = null
            }
            if (!n) {
                var s = null;
                n = {
                    getItem: function(e) {
                        e += "=";
                        for (var t = document.cookie.split(";"), n = 0; n < t.length; n++) {
                            var o = t[n].replace(/(^\s+|\s+$)/, "");
                            if (o && 0 === o.indexOf(e)) return o.substr(e.length)
                        }
                        return s
                    },
                    setItem: function(e, t) {
                        s = t, document.cookie = e + "=" + t
                    }
                }, s = n.getItem("hello")
            }
            return function(n, o, i) {
                var r = e();
                if (n && void 0 === o) return r[n] || null;
                if (n && null === o) try {
                    delete r[n]
                } catch (a) {
                    r[n] = null
                } else {
                    if (!n) return r;
                    r[n] = o
                }
                return t(r), r || null
            }
        }(),
        append: function(e, t, n) {
            var o = "string" == typeof e ? document.createElement(e) : e;
            if ("object" == typeof t)
                if ("tagName" in t) n = t;
                else
                    for (var i in t)
                        if (t.hasOwnProperty(i))
                            if ("object" == typeof t[i])
                                for (var r in t[i]) t[i].hasOwnProperty(r) && (o[i][r] = t[i][r]);
                            else "html" === i ? o.innerHTML = t[i] : /^on/.test(i) ? o[i] = t[i] : o.setAttribute(i, t[i]);
            return "body" === n ? ! function a() {
                document.body ? document.body.appendChild(o) : setTimeout(a, 16)
            }() : "object" == typeof n ? n.appendChild(o) : "string" == typeof n && document.getElementsByTagName(n)[0].appendChild(o), o
        },
        iframe: function(e) {
            this.append("iframe", {
                src: e,
                style: {
                    position: "absolute",
                    left: "-1000px",
                    bottom: 0,
                    height: "1px",
                    width: "1px"
                }
            }, "body")
        },
        merge: function() {
            var e = Array.prototype.slice.call(arguments);
            return e.unshift({}), this.extend.apply(null, e)
        },
        args: function(e, t) {
            var n = {},
                o = 0,
                i = null,
                r = null;
            for (r in e)
                if (e.hasOwnProperty(r)) break;
            if (1 === t.length && "object" == typeof t[0] && "o!" != e[r])
                for (r in t[0])
                    if (e.hasOwnProperty(r) && r in e) return t[0];
            for (r in e)
                if (e.hasOwnProperty(r))
                    if (i = typeof t[o], "function" == typeof e[r] && e[r].test(t[o]) || "string" == typeof e[r] && (e[r].indexOf("s") > -1 && "string" === i || e[r].indexOf("o") > -1 && "object" === i || e[r].indexOf("i") > -1 && "number" === i || e[r].indexOf("a") > -1 && "object" === i || e[r].indexOf("f") > -1 && "function" === i)) n[r] = t[o++];
                    else if ("string" == typeof e[r] && e[r].indexOf("!") > -1) return !1;
            return n
        },
        url: function(e) {
            if (e) {
                if (window.URL && URL instanceof Function && 0 !== URL.length) return new URL(e, window.location);
                var t = document.createElement("a");
                return t.href = e, t.cloneNode(!1)
            }
            return window.location
        },
        diff: function(e, t) {
            return t.filter(function(t) {
                return -1 === e.indexOf(t)
            })
        },
        diffKey: function(e, t) {
            if (e || !t) {
                var n = {};
                for (var o in e) o in t || (n[o] = e[o]);
                return n
            }
            return e
        },
        unique: function(e) {
            return Array.isArray(e) ? e.filter(function(t, n) {
                return e.indexOf(t) === n
            }) : []
        },
        isEmpty: function(e) {
            if (!e) return !0;
            if (Array.isArray(e)) return !e.length;
            if ("object" == typeof e)
                for (var t in e)
                    if (e.hasOwnProperty(t)) return !1;
            return !0
        },
        Promise: function() {
            var e = 0,
                t = 1,
                n = 2,
                o = function(t) {
                    return this instanceof o ? (this.id = "Thenable/1.0.6", this.state = e, this.fulfillValue = void 0, this.rejectReason = void 0, this.onFulfilled = [], this.onRejected = [], this.proxy = {
                        then: this.then.bind(this)
                    }, void("function" == typeof t && t.call(this, this.fulfill.bind(this), this.reject.bind(this)))) : new o(t)
                };
            o.prototype = {
                fulfill: function(e) {
                    return i(this, t, "fulfillValue", e)
                },
                reject: function(e) {
                    return i(this, n, "rejectReason", e)
                },
                then: function(e, t) {
                    var n = this,
                        i = new o;
                    return n.onFulfilled.push(s(e, i, "fulfill")), n.onRejected.push(s(t, i, "reject")), r(n), i.proxy
                }
            };
            var i = function(t, n, o, i) {
                    return t.state === e && (t.state = n, t[o] = i, r(t)), t
                },
                r = function(e) {
                    e.state === t ? a(e, "onFulfilled", e.fulfillValue) : e.state === n && a(e, "onRejected", e.rejectReason)
                },
                a = function(e, t, n) {
                    if (0 !== e[t].length) {
                        var o = e[t];
                        e[t] = [];
                        var i = function() {
                            for (var e = 0; e < o.length; e++) o[e](n)
                        };
                        "object" == typeof process && "function" == typeof process.nextTick ? process.nextTick(i) : "function" == typeof setImmediate ? setImmediate(i) : setTimeout(i, 0)
                    }
                },
                s = function(e, t, n) {
                    return function(o) {
                        if ("function" != typeof e) t[n].call(t, o);
                        else {
                            var i;
                            try {
                                i = e(o)
                            } catch (r) {
                                return void t.reject(r)
                            }
                            l(t, i)
                        }
                    }
                },
                l = function(e, t) {
                    if (e === t || e.proxy === t) return void e.reject(new TypeError("cannot resolve promise with itself"));
                    var n;
                    if ("object" == typeof t && null !== t || "function" == typeof t) try {
                        n = t.then
                    } catch (o) {
                        return void e.reject(o)
                    }
                    if ("function" != typeof n) e.fulfill(t);
                    else {
                        var i = !1;
                        try {
                            n.call(t, function(n) {
                                i || (i = !0, n === t ? e.reject(new TypeError("circular thenable chain")) : l(e, n))
                            }, function(t) {
                                i || (i = !0, e.reject(t))
                            })
                        } catch (o) {
                            i || e.reject(o)
                        }
                    }
                };
            return o
        }(),
        Event: function() {
            var e = /[\s\,]+/;
            return this.parent = {
                events: this.events,
                findEvents: this.findEvents,
                parent: this.parent,
                utils: this.utils
            }, this.events = {}, this.on = function(t, n) {
                if (n && "function" == typeof n)
                    for (var o = t.split(e), i = 0; i < o.length; i++) this.events[o[i]] = [n].concat(this.events[o[i]] || []);
                return this
            }, this.off = function(e, t) {
                return this.findEvents(e, function(e, n) {
                    t && this.events[e][n] !== t || (this.events[e][n] = null)
                }), this
            }, this.emit = function(e) {
                var t = Array.prototype.slice.call(arguments, 1);
                t.push(e);
                for (var n = function(n, o) {
                        t[t.length - 1] = "*" === n ? e : n, this.events[n][o].apply(this, t)
                    }, o = this; o && o.findEvents;) o.findEvents(e + ",*", n), o = o.parent;
                return this
            }, this.emitAfter = function() {
                var e = this,
                    t = arguments;
                return setTimeout(function() {
                    e.emit.apply(e, t)
                }, 0), this
            }, this.findEvents = function(t, n) {
                var o = t.split(e);
                for (var i in this.events)
                    if (this.events.hasOwnProperty(i) && o.indexOf(i) > -1)
                        for (var r = 0; r < this.events[i].length; r++) this.events[i][r] && n.call(this, i, r)
            }, this
        },
        globalEvent: function(e, t) {
            return t = t || "_hellojs_" + parseInt(1e12 * Math.random(), 10).toString(36), window[t] = function() {
                try {
                    e.apply(this, arguments) && delete window[t]
                } catch (n) {
                    console.error(n)
                }
            }, t
        },
        popup: function(e, t, n) {
            var o = document.documentElement;
            if (n.height) {
                var i = void 0 !== window.screenTop ? window.screenTop : screen.top,
                    r = screen.height || window.innerHeight || o.clientHeight;
                n.top = parseInt((r - n.height) / 2, 10) + i
            }
            if (n.width) {
                var a = void 0 !== window.screenLeft ? window.screenLeft : screen.left,
                    s = screen.width || window.innerWidth || o.clientWidth;
                n.left = parseInt((s - n.width) / 2, 10) + a
            }
            var l = [];
            Object.keys(n).forEach(function(e) {
                var t = n[e];
                l.push(e + (null !== t ? "=" + t : ""))
            }), -1 !== navigator.userAgent.indexOf("Safari") && -1 === navigator.userAgent.indexOf("Chrome") && (e = t + "#oauth_redirect=" + encodeURIComponent(encodeURIComponent(e)));
            var u = window.open(e, "_blank", l.join(","));
            return u && u.focus && u.focus(), u
        },
        responseHandler: function(e, t) {
            function n(e, t, n) {
                var r = e.callback,
                    s = e.network;
                if (a.store(s, e), !("display" in e && "page" === e.display)) {
                    if (n && r && r in n) {
                        try {
                            delete e.callback
                        } catch (l) {}
                        a.store(s, e);
                        var u = JSON.stringify(e);
                        try {
                            o(n, r)(u)
                        } catch (l) {}
                    }
                    i()
                }
            }

            function o(e, t) {
                return 0 !== t.indexOf("_hellojs_") ? function() {
                    throw "Could not execute callback " + t
                } : e[t]
            }

            function i() {
                if (e.frameElement) t.document.body.removeChild(e.frameElement);
                else {
                    try {
                        e.close()
                    } catch (n) {}
                    e.addEventListener && e.addEventListener("load", function() {
                        e.close()
                    })
                }
            }
            var r, a = this,
                s = e.location;
            if (r = a.param(s.search), r && r.state && (r.code || r.oauth_token)) {
                var l = JSON.parse(r.state);
                r.redirect_uri = l.redirect_uri || s.href.replace(/[\?\#].*$/, "");
                var u = l.oauth_proxy + "?" + a.param(r);
                return void s.assign(u)
            }
            if (r = a.merge(a.param(s.search || ""), a.param(s.hash || "")), r && "state" in r) {
                try {
                    var c = JSON.parse(r.state);
                    a.extend(r, c)
                } catch (d) {
                    console.error("Could not decode state parameter")
                }
                if ("access_token" in r && r.access_token && r.network) r.expires_in && 0 !== parseInt(r.expires_in, 10) || (r.expires_in = 0), r.expires_in = parseInt(r.expires_in, 10), r.expires = (new Date).getTime() / 1e3 + (r.expires_in || 31536e3), n(r, e, t);
                else if ("error" in r && r.error && r.network) r.error = {
                    code: r.error,
                    message: r.error_message || r.error_description
                }, n(r, e, t);
                else if (r.callback && r.callback in t) {
                    var f = "result" in r && r.result ? JSON.parse(r.result) : !1;
                    o(t, r.callback)(f), i()
                }
                r.page_uri && s.assign(r.page_uri)
            } else if ("oauth_redirect" in r) return void s.assign(decodeURIComponent(r.oauth_redirect))
        }
    }), hello.utils.Event.call(hello),
    function(e) {
        var t = {},
            n = {};
        e.on("auth.login, auth.logout", function(n) {
                n && "object" == typeof n && n.network && (t[n.network] = e.utils.store(n.network) || {})
            }),
            function o() {
                var i = (new Date).getTime() / 1e3,
                    r = function(t) {
                        e.emit("auth." + t, {
                            network: a,
                            authResponse: s
                        })
                    };
                for (var a in e.services)
                    if (e.services.hasOwnProperty(a)) {
                        if (!e.services[a].id) continue;
                        var s = e.utils.store(a) || {},
                            l = e.services[a],
                            u = t[a] || {};
                        if (s && "callback" in s) {
                            var c = s.callback;
                            try {
                                delete s.callback
                            } catch (d) {}
                            e.utils.store(a, s);
                            try {
                                window[c](s)
                            } catch (d) {}
                        }
                        if (s && "expires" in s && s.expires < i) {
                            var f = l.refresh || s.refresh_token;
                            !f || a in n && !(n[a] < i) ? f || a in n || (r("expired"), n[a] = !0) : (e.emit("notice", a + " has expired trying to resignin"), e.login(a, {
                                display: "none",
                                force: !1
                            }), n[a] = i + 600);
                            continue
                        }
                        if (u.access_token === s.access_token && u.expires === s.expires) continue;
                        !s.access_token && u.access_token ? r("logout") : s.access_token && !u.access_token ? r("login") : s.expires !== u.expires && r("update"), t[a] = s, a in n && delete n[a]
                    }
                setTimeout(o, 1e3)
            }()
    }(hello), hello.api = function() {
        function e(e) {
            e = e.replace(/\@\{([a-z\_\-]+)(\|.*?)?\}/gi, function(e, t, n) {
                var a = n ? n.replace(/^\|/, "") : "";
                return t in r.query ? (a = r.query[t], delete r.query[t]) : r.data && t in r.data ? (a = r.data[t], delete r.data[t]) : n || i.reject(o("missing_attribute", "The attribute " + t + " is missing from the request")), a
            }), e.match(/^https?:\/\//) || (e = u.base + e), r.url = e, n.request(r, function(e, t) {
                if (!r.formatResponse) return void(("object" == typeof t ? t.statusCode >= 400 : "object" == typeof e && "error" in e) ? i.reject(e) : i.fulfill(e));
                if (e === !0 ? e = {
                        success: !0
                    } : e || (e = {}), "delete" === r.method && (e = !e || n.isEmpty(e) ? {
                        success: !0
                    } : e), u.wrap && (r.path in u.wrap || "default" in u.wrap)) {
                    var o = r.path in u.wrap ? r.path : "default",
                        a = ((new Date).getTime(), u.wrap[o](e, t, r));
                    a && (e = a)
                }
                e && "paging" in e && e.paging.next && ("?" === e.paging.next[0] ? e.paging.next = r.path + e.paging.next : e.paging.next += "#" + r.path), !e || "error" in e ? i.reject(e) : i.fulfill(e)
            })
        }
        var t = this,
            n = t.utils,
            o = n.error,
            i = n.Promise(),
            r = n.args({
                path: "s!",
                query: "o",
                method: "s",
                data: "o",
                timeout: "i",
                callback: "f"
            }, arguments);
        r.method = (r.method || "get").toLowerCase(), r.headers = r.headers || {}, r.query = r.query || {}, "get" !== r.method && "delete" !== r.method || (n.extend(r.query, r.data), r.data = {});
        var a = r.data = r.data || {};
        if (i.then(r.callback, r.callback), !r.path) return i.reject(o("invalid_path", "Missing the path parameter from the request"));
        r.path = r.path.replace(/^\/+/, "");
        var s = (r.path.split(/[\/\:]/, 2) || [])[0].toLowerCase();
        if (s in t.services) {
            r.network = s;
            var l = new RegExp("^" + s + ":?/?");
            r.path = r.path.replace(l, "")
        }
        r.network = t.settings.default_service = r.network || t.settings.default_service;
        var u = t.services[r.network];
        if (!u) return i.reject(o("invalid_network", "Could not match the service requested: " + r.network));
        if (r.method in u && r.path in u[r.method] && u[r.method][r.path] === !1) return i.reject(o("invalid_path", "The provided path is not available on the selected network"));
        r.oauth_proxy || (r.oauth_proxy = t.settings.oauth_proxy), "proxy" in r || (r.proxy = r.oauth_proxy && u.oauth && 1 === parseInt(u.oauth.version, 10)), "timeout" in r || (r.timeout = t.settings.timeout), "formatResponse" in r || (r.formatResponse = !0), r.authResponse = t.getAuthResponse(r.network), r.authResponse && r.authResponse.access_token && (r.query.access_token = r.authResponse.access_token);
        var c, d = r.path;
        r.options = n.clone(r.query), r.data = n.clone(a);
        var f = u[{
            "delete": "del"
        }[r.method] || r.method] || {};
        if ("get" === r.method) {
            var p = d.split(/[\?#]/)[1];
            p && (n.extend(r.query, n.param(p)), d = d.replace(/\?.*?(#|$)/, "$1"))
        }
        return (c = d.match(/#(.+)/, "")) ? (d = d.split("#")[0], r.path = c[1]) : d in f ? (r.path = d, d = f[d]) : "default" in f && (d = f["default"]), r.redirect_uri = t.settings.redirect_uri, r.xhr = u.xhr, r.jsonp = u.jsonp, r.form = u.form, "function" == typeof d ? d(r, e) : e(d), i.proxy
    }, hello.utils.extend(hello.utils, {
        request: function(e, t) {
            function n(e, t) {
                var n;
                e.authResponse && e.authResponse.oauth && 1 === parseInt(e.authResponse.oauth.version, 10) && (n = e.query.access_token, delete e.query.access_token, e.proxy = !0), !e.data || "get" !== e.method && "delete" !== e.method || (o.extend(e.query, e.data), e.data = null);
                var i = o.qs(e.url, e.query);
                e.proxy && (i = o.qs(e.oauth_proxy, {
                    path: i,
                    access_token: n || "",
                    then: e.proxy_response_type || ("get" === e.method.toLowerCase() ? "redirect" : "proxy"),
                    method: e.method.toLowerCase(),
                    suppress_response_codes: !0
                })), t(i)
            }
            var o = this,
                i = o.error;
            o.isEmpty(e.data) || "FileList" in window || !o.hasBinary(e.data) || (e.xhr = !1, e.jsonp = !1);
            var r = this.request_cors(function() {
                return void 0 === e.xhr || e.xhr && ("function" != typeof e.xhr || e.xhr(e, e.query))
            });
            if (r) return void n(e, function(n) {
                var i = o.xhr(e.method, n, e.headers, e.data, t);
                i.onprogress = e.onprogress || null, i.upload && e.onuploadprogress && (i.upload.onprogress = e.onuploadprogress)
            });
            var a = e.query;
            if (e.query = o.clone(e.query), e.callbackID = o.globalEvent(), e.jsonp !== !1) {
                if (e.query.callback = e.callbackID, "function" == typeof e.jsonp && e.jsonp(e, e.query), "get" === e.method) return void n(e, function(n) {
                    o.jsonp(n, t, e.callbackID, e.timeout)
                });
                e.query = a
            }
            if (e.form !== !1) {
                e.query.redirect_uri = e.redirect_uri, e.query.state = JSON.stringify({
                    callback: e.callbackID
                });
                var s;
                if ("function" == typeof e.form && (s = e.form(e, e.query)), "post" === e.method && s !== !1) return void n(e, function(n) {
                    o.post(n, e.data, s, t, e.callbackID, e.timeout)
                })
            }
            t(i("invalid_request", "There was no mechanism for handling this request"))
        },
        request_cors: function(e) {
            return "withCredentials" in new XMLHttpRequest && e()
        },
        domInstance: function(e, t) {
            var n = "HTML" + (e || "").replace(/^[a-z]/, function(e) {
                return e.toUpperCase()
            }) + "Element";
            return t ? window[n] ? t instanceof window[n] : window.Element ? t instanceof window.Element && (!e || t.tagName && t.tagName.toLowerCase() === e) : !(t instanceof Object || t instanceof Array || t instanceof String || t instanceof Number) && t.tagName && t.tagName.toLowerCase() === e : !1
        },
        clone: function(e) {
            if (null === e || "object" != typeof e || e instanceof Date || "nodeName" in e || this.isBinary(e) || "function" == typeof FormData && e instanceof FormData) return e;
            if (Array.isArray(e)) return e.map(this.clone.bind(this));
            var t = {};
            for (var n in e) t[n] = this.clone(e[n]);
            return t
        },
        xhr: function(e, t, n, o, i) {
            function r(e) {
                for (var t, n = {}, o = /([a-z\-]+):\s?(.*);?/gi; t = o.exec(e);) n[t[1]] = t[2];
                return n
            }
            var a = new XMLHttpRequest,
                s = this.error,
                l = !1;
            "blob" === e && (l = e, e = "GET"), e = e.toUpperCase(), a.onload = function(t) {
                var n = a.response;
                try {
                    n = JSON.parse(a.responseText)
                } catch (o) {
                    401 === a.status && (n = s("access_denied", a.statusText))
                }
                var l = r(a.getAllResponseHeaders());
                l.statusCode = a.status, i(n || ("GET" === e ? s("empty_response", "Could not get resource") : {}), l)
            }, a.onerror = function(e) {
                var t = a.responseText;
                try {
                    t = JSON.parse(a.responseText)
                } catch (n) {}
                i(t || s("access_denied", "Could not get resource"))
            };
            var u;
            if ("GET" === e || "DELETE" === e) o = null;
            else if (o && "string" != typeof o && !(o instanceof FormData) && !(o instanceof File) && !(o instanceof Blob)) {
                var c = new FormData;
                for (u in o) o.hasOwnProperty(u) && (o[u] instanceof HTMLInputElement ? "files" in o[u] && o[u].files.length > 0 && c.append(u, o[u].files[0]) : o[u] instanceof Blob ? c.append(u, o[u], o.name) : c.append(u, o[u]));
                o = c
            }
            if (a.open(e, t, !0), l && ("responseType" in a ? a.responseType = l : a.overrideMimeType("text/plain; charset=x-user-defined")), n)
                for (u in n) a.setRequestHeader(u, n[u]);
            return a.send(o), a
        },
        jsonp: function(e, t, n, o) {
            var i, r = this,
                a = r.error,
                s = 0,
                l = document.getElementsByTagName("head")[0],
                u = a("server_error", "server_error"),
                c = function() {
                    s++ || window.setTimeout(function() {
                        t(u), l.removeChild(d)
                    }, 0)
                };
            n = r.globalEvent(function(e) {
                return u = e, !0
            }, n), e = e.replace(new RegExp("=\\?(&|$)"), "=" + n + "$1");
            var d = r.append("script", {
                id: n,
                name: n,
                src: e,
                async: !0,
                onload: c,
                onerror: c,
                onreadystatechange: function() {
                    /loaded|complete/i.test(this.readyState) && c()
                }
            });
            window.navigator.userAgent.toLowerCase().indexOf("opera") > -1 && (i = r.append("script", {
                text: "document.getElementById('" + n + "').onerror();"
            }), d.async = !1), o && window.setTimeout(function() {
                u = a("timeout", "timeout"), c()
            }, o), l.appendChild(d), i && l.appendChild(i)
        },
        post: function(e, t, n, o, i, r) {
            var a, s = this,
                l = s.error,
                u = document,
                c = null,
                d = [],
                f = 0,
                p = null,
                m = 0,
                h = function(e) {
                    m++ || o(e)
                };
            s.globalEvent(h, i);
            var g;
            try {
                g = u.createElement('<iframe name="' + i + '">')
            } catch (v) {
                g = u.createElement("iframe")
            }
            if (g.name = i, g.id = i, g.style.display = "none", n && n.callbackonload && (g.onload = function() {
                    h({
                        response: "posted",
                        message: "Content was posted"
                    })
                }), r && setTimeout(function() {
                    h(l("timeout", "The post operation timed out"))
                }, r), u.body.appendChild(g), s.domInstance("form", t)) {
                for (c = t.form, f = 0; f < c.elements.length; f++) c.elements[f] !== t && c.elements[f].setAttribute("disabled", !0);
                t = c
            }
            if (s.domInstance("form", t))
                for (c = t, f = 0; f < c.elements.length; f++) c.elements[f].disabled || "file" !== c.elements[f].type || (c.encoding = c.enctype = "multipart/form-data", c.elements[f].setAttribute("name", "file"));
            else {
                for (p in t) t.hasOwnProperty(p) && s.domInstance("input", t[p]) && "file" === t[p].type && (c = t[p].form, c.encoding = c.enctype = "multipart/form-data");
                c || (c = u.createElement("form"), u.body.appendChild(c), a = c);
                var y;
                for (p in t)
                    if (t.hasOwnProperty(p)) {
                        var w = s.domInstance("input", t[p]) || s.domInstance("textArea", t[p]) || s.domInstance("select", t[p]);
                        if (w && t[p].form === c) w && t[p].name !== p && (t[p].setAttribute("name", p), t[p].name = p);
                        else {
                            var _ = c.elements[p];
                            if (y)
                                for (_ instanceof NodeList || (_ = [_]), f = 0; f < _.length; f++) _[f].parentNode.removeChild(_[f]);
                            y = u.createElement("input"), y.setAttribute("type", "hidden"), y.setAttribute("name", p), w ? y.value = t[p].value : s.domInstance(null, t[p]) ? y.value = t[p].innerHTML || t[p].innerText : y.value = t[p], c.appendChild(y)
                        }
                    }
                for (f = 0; f < c.elements.length; f++) y = c.elements[f], y.name in t || y.getAttribute("disabled") === !0 || (y.setAttribute("disabled", !0), d.push(y))
            }
            c.setAttribute("method", "POST"), c.setAttribute("target", i), c.target = i, c.setAttribute("action", e), setTimeout(function() {
                c.submit(), setTimeout(function() {
                    try {
                        a && a.parentNode.removeChild(a)
                    } catch (e) {
                        try {
                            console.error("HelloJS: could not remove iframe")
                        } catch (t) {}
                    }
                    for (var n = 0; n < d.length; n++) d[n] && (d[n].setAttribute("disabled", !1), d[n].disabled = !1)
                }, 0)
            }, 100)
        },
        hasBinary: function(e) {
            for (var t in e)
                if (e.hasOwnProperty(t) && this.isBinary(e[t])) return !0;
            return !1
        },
        isBinary: function(e) {
            return e instanceof Object && (this.domInstance("input", e) && "file" === e.type || "FileList" in window && e instanceof window.FileList || "File" in window && e instanceof window.File || "Blob" in window && e instanceof window.Blob)
        },
        toBlob: function(e) {
            var t = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i,
                n = e.match(t);
            if (!n) return e;
            for (var o = atob(e.replace(t, "")), i = [], r = 0; r < o.length; r++) i.push(o.charCodeAt(r));
            return new Blob([new Uint8Array(i)], {
                type: n[1]
            })
        }
    }),
    function(e) {
        var t = e.api,
            n = e.utils;
        n.extend(n, {
            dataToJSON: function(e) {
                var t = this,
                    n = window,
                    o = e.data;
                if (t.domInstance("form", o) ? o = t.nodeListToJSON(o.elements) : "NodeList" in n && o instanceof NodeList ? o = t.nodeListToJSON(o) : t.domInstance("input", o) && (o = t.nodeListToJSON([o])), ("File" in n && o instanceof n.File || "Blob" in n && o instanceof n.Blob || "FileList" in n && o instanceof n.FileList) && (o = {
                        file: o
                    }), !("FormData" in n && o instanceof n.FormData))
                    for (var i in o)
                        if (o.hasOwnProperty(i))
                            if ("FileList" in n && o[i] instanceof n.FileList) 1 === o[i].length && (o[i] = o[i][0]);
                            else {
                                if (t.domInstance("input", o[i]) && "file" === o[i].type) continue;
                                t.domInstance("input", o[i]) || t.domInstance("select", o[i]) || t.domInstance("textArea", o[i]) ? o[i] = o[i].value : t.domInstance(null, o[i]) && (o[i] = o[i].innerHTML || o[i].innerText)
                            }
                return e.data = o, o
            },
            nodeListToJSON: function(e) {
                for (var t = {}, n = 0; n < e.length; n++) {
                    var o = e[n];
                    !o.disabled && o.name && ("file" === o.type ? t[o.name] = o : t[o.name] = o.value || o.innerHTML)
                }
                return t
            }
        }), e.api = function() {
            var e = n.args({
                path: "s!",
                method: "s",
                data: "o",
                timeout: "i",
                callback: "f"
            }, arguments);
            return e.data && n.dataToJSON(e), t.call(this, e)
        }
    }(hello), hello.utils.responseHandler(window, window.opener || window.parent), "object" == typeof chrome && "object" == typeof chrome.identity && chrome.identity.launchWebAuthFlow && ! function() {
        function e(t, n) {
            var o = {
                closed: !1
            };
            return chrome.identity.launchWebAuthFlow({
                url: t,
                interactive: n
            }, function(t) {
                if (void 0 === t) return void(o.closed = !0);
                var n = hello.utils.url(t),
                    i = {
                        location: {
                            assign: function(t) {
                                e(t, !1)
                            },
                            search: n.search,
                            hash: n.hash,
                            href: n.href
                        },
                        close: function() {}
                    };
                hello.utils.responseHandler(i, window)
            }), o
        }
        hello.utils.popup = function(t) {
            return e(t, !0)
        }, hello.utils.iframe = function(t) {
            e(t, !1)
        }, hello.utils.request_cors = function(e) {
            return e(), !0
        };
        var t = {};
        chrome.storage.local.get("hello", function(e) {
            t = e.hello || {}
        }), hello.utils.store = function(e, n) {
            return 0 === arguments.length ? t : 1 === arguments.length ? t[e] || null : n ? (t[e] = n, chrome.storage.local.set({
                hello: t
            }), n) : null === n ? (delete t[e], chrome.storage.local.set({
                hello: t
            }), null) : void 0
        }
    }(),
    function() {
        if (/^file:\/{3}[^\/]/.test(window.location.href) && window.cordova) {
            hello.utils.iframe = function(e, t) {
                hello.utils.popup(e, t, {
                    hidden: "yes"
                })
            };
            var e = hello.utils.popup;
            hello.utils.popup = function(t, n, o) {
                var i = e.call(this, t, n, o);
                try {
                    if (i && i.addEventListener) {
                        var r = hello.utils.url(n),
                            a = r.origin || r.protocol + "//" + r.hostname;
                        i.addEventListener("loadstart", function(e) {
                            var t = e.url;
                            if (0 === t.indexOf(a)) {
                                var n = hello.utils.url(t),
                                    o = {
                                        location: {
                                            assign: function(e) {
                                                i.executeScript({
                                                    code: 'window.location.href = "' + e + ';"'
                                                })
                                            },
                                            search: n.search,
                                            hash: n.hash,
                                            href: n.href
                                        },
                                        close: function() {
                                            if (i.close) {
                                                i.close();
                                                try {
                                                    i.closed = !0
                                                } catch (e) {}
                                            }
                                        }
                                    };
                                hello.utils.responseHandler(o, window)
                            }
                        })
                    }
                } catch (s) {}
                return i
            }
        }
    }(),
    function(e) {
        function t(e) {
            e && "error" in e && (e.error = {
                code: "server_error",
                message: e.error.message || e.error
            })
        }

        function n(t, n, o) {
            if (!("object" != typeof t || "undefined" != typeof Blob && t instanceof Blob || "undefined" != typeof ArrayBuffer && t instanceof ArrayBuffer || "error" in t)) {
                var i = ("app_folder" !== t.root ? t.root : "") + t.path.replace(/\&/g, "%26");
                i = i.replace(/^\//, ""), t.thumb_exists && (t.thumbnail = o.oauth_proxy + "?path=" + encodeURIComponent("https://api-content.dropbox.com/1/thumbnails/auto/" + i + "?format=jpeg&size=m") + "&access_token=" + o.options.access_token), t.type = t.is_dir ? "folder" : t.mime_type, t.name = t.path.replace(/.*\//g, ""), t.is_dir ? t.files = i.replace(/^\//, "") : (t.downloadLink = e.settings.oauth_proxy + "?path=" + encodeURIComponent("https://api-content.dropbox.com/1/files/auto/" + i) + "&access_token=" + o.options.access_token, t.file = "https://api-content.dropbox.com/1/files/auto/" + i), t.id || (t.id = t.path.replace(/^\//, ""))
            }
        }

        function o(e) {
            return function(t, n) {
                delete t.query.limit, n(e)
            }
        }
        var i = {
                version: "1.0",
                auth: "https://www.dropbox.com/1/oauth/authorize",
                request: "https://api.dropbox.com/1/oauth/request_token",
                token: "https://api.dropbox.com/1/oauth/access_token"
            },
            r = {
                version: 2,
                auth: "https://www.dropbox.com/1/oauth2/authorize",
                grant: "https://api.dropbox.com/1/oauth2/token"
            };
        e.init({
            dropbox: {
                name: "Dropbox",
                oauth: r,
                login: function(t) {
                    t.qs.scope = "";
                    var n = decodeURIComponent(t.qs.redirect_uri);
                    0 === n.indexOf("http:") && 0 !== n.indexOf("http://localhost/") ? e.services.dropbox.oauth = i : e.services.dropbox.oauth = r, t.options.popup.width = 1e3, t.options.popup.height = 1e3
                },
                base: "https://api.dropbox.com/1/",
                root: "sandbox",
                get: {
                    me: "account/info",
                    "me/files": o("metadata/auto/@{parent|}"),
                    "me/folder": o("metadata/auto/@{id}"),
                    "me/folders": o("metadata/auto/"),
                    "default": function(e, t) {
                        e.path.match("https://api-content.dropbox.com/1/files/") && (e.method = "blob"), t(e.path)
                    }
                },
                post: {
                    "me/files": function(t, n) {
                        var o = t.data.parent,
                            i = t.data.name;
                        t.data = {
                            file: t.data.file
                        }, "string" == typeof t.data.file && (t.data.file = e.utils.toBlob(t.data.file)), n("https://api-content.dropbox.com/1/files_put/auto/" + o + "/" + i)
                    },
                    "me/folders": function(t, n) {
                        var o = t.data.name;
                        t.data = {}, n("fileops/create_folder?root=@{root|sandbox}&" + e.utils.param({
                            path: o
                        }))
                    }
                },
                del: {
                    "me/files": "fileops/delete?root=@{root|sandbox}&path=@{id}",
                    "me/folder": "fileops/delete?root=@{root|sandbox}&path=@{id}"
                },
                wrap: {
                    me: function(e) {
                        if (t(e), !e.uid) return e;
                        e.name = e.display_name;
                        var n = e.name.split(" ");
                        return e.first_name = n.shift(), e.last_name = n.join(" "), e.id = e.uid, delete e.uid, delete e.display_name, e
                    },
                    "default": function(e, o, i) {
                        return t(e), e.is_dir && e.contents && (e.data = e.contents, delete e.contents, e.data.forEach(function(t) {
                            t.root = e.root, n(t, o, i)
                        })), n(e, o, i), e.is_deleted && (e.success = !0), e
                    }
                },
                xhr: function(e) {
                    if (e.data && e.data.file) {
                        var t = e.data.file;
                        t && (t.files ? e.data = t.files[0] : e.data = t)
                    }
                    return "delete" === e.method && (e.method = "post"), !0
                },
                form: function(e, t) {
                    delete t.state, delete t.redirect_uri
                }
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            return e.id && (e.thumbnail = e.picture = "https://graph.facebook.com/" + e.id + "/picture"), e
        }

        function n(e) {
            return "data" in e && e.data.forEach(t), e
        }

        function o(e, t, n) {
            if ("boolean" == typeof e && (e = {
                    success: e
                }), e && "data" in e) {
                var o = n.query.access_token;
                if (!(e.data instanceof Array)) {
                    var r = e.data;
                    delete e.data, e.data = [r]
                }
                e.data.forEach(function(e) {
                    e.picture && (e.thumbnail = e.picture), e.pictures = (e.images || []).sort(function(e, t) {
                        return e.width - t.width
                    }), e.cover_photo && e.cover_photo.id && (e.thumbnail = i + e.cover_photo.id + "/picture?access_token=" + o), "album" === e.type && (e.files = e.photos = i + e.id + "/photos"), e.can_upload && (e.upload_location = i + e.id + "/photos")
                })
            }
            return e
        }
        e.init({
            facebook: {
                name: "Facebook",
                oauth: {
                    version: 2,
                    auth: "https://www.facebook.com/dialog/oauth/",
                    grant: "https://graph.facebook.com/oauth/access_token"
                },
                scope: {
                    basic: "public_profile",
                    email: "email",
                    share: "user_posts",
                    birthday: "user_birthday",
                    events: "user_events",
                    photos: "user_photos",
                    videos: "user_videos",
                    friends: "user_friends",
                    files: "user_photos,user_videos",
                    publish_files: "user_photos,user_videos,publish_actions",
                    publish: "publish_actions",
                    offline_access: ""
                },
                refresh: !1,
                login: function(e) {
                    e.options.force && (e.qs.auth_type = "reauthenticate"), e.qs.display = e.options.display || "popup"
                },
                logout: function(t, n) {
                    var o = e.utils.globalEvent(t),
                        i = encodeURIComponent(e.settings.redirect_uri + "?" + e.utils.param({
                            callback: o,
                            result: JSON.stringify({
                                force: !0
                            }),
                            state: "{}"
                        })),
                        r = (n.authResponse || {}).access_token;
                    return e.utils.iframe("https://www.facebook.com/logout.php?next=" + i + "&access_token=" + r), r ? void 0 : !1
                },
                base: "https://graph.facebook.com/v2.7/",
                get: {
                    me: "me?fields=email,first_name,last_name,name,timezone,verified",
                    "me/friends": "me/friends",
                    "me/following": "me/friends",
                    "me/followers": "me/friends",
                    "me/share": "me/feed",
                    "me/like": "me/likes",
                    "me/files": "me/albums",
                    "me/albums": "me/albums?fields=cover_photo,name",
                    "me/album": "@{id}/photos?fields=picture",
                    "me/photos": "me/photos",
                    "me/photo": "@{id}",
                    "friend/albums": "@{id}/albums",
                    "friend/photos": "@{id}/photos"
                },
                post: {
                    "me/share": "me/feed",
                    "me/photo": "@{id}"
                },
                wrap: {
                    me: t,
                    "me/friends": n,
                    "me/following": n,
                    "me/followers": n,
                    "me/albums": o,
                    "me/photos": o,
                    "me/files": o,
                    "default": o
                },
                xhr: function(t, n) {
                    return "get" !== t.method && "post" !== t.method || (n.suppress_response_codes = !0), "post" === t.method && t.data && "string" == typeof t.data.file && (t.data.file = e.utils.toBlob(t.data.file)), !0
                },
                jsonp: function(t, n) {
                    var o = t.method;
                    "get" === o || e.utils.hasBinary(t.data) ? "delete" === t.method && (n.method = "delete", t.method = "post") : (t.data.method = o, t.method = "get")
                },
                form: function(e) {
                    return {
                        callbackonload: !0
                    }
                }
            }
        });
        var i = "https://graph.facebook.com/"
    }(hello),
    function(e) {
        function t(t, n, o) {
            var i = (o ? "" : "flickr:") + "?method=" + t + "&api_key=" + e.services.flickr.id + "&format=json";
            for (var r in n) n.hasOwnProperty(r) && (i += "&" + r + "=" + n[r]);
            return i
        }

        function n(t) {
            var n = e.getAuthResponse("flickr");
            t(n && n.user_nsid ? n.user_nsid : null)
        }

        function o(e, o) {
            return o || (o = {}),
                function(i, r) {
                    n(function(n) {
                        o.user_id = n, r(t(e, o, !0))
                    })
                }
        }

        function i(e, t) {
            var n = "https://www.flickr.com/images/buddyicon.gif";
            return e.nsid && e.iconserver && e.iconfarm && (n = "https://farm" + e.iconfarm + ".staticflickr.com/" + e.iconserver + "/buddyicons/" + e.nsid + (t ? "_" + t : "") + ".jpg"), n
        }

        function r(e, t, n, o, i) {
            return i = i ? "_" + i : "", "https://farm" + t + ".staticflickr.com/" + n + "/" + e + "_" + o + i + ".jpg"
        }

        function a(e) {
            e && e.stat && "ok" != e.stat.toLowerCase() && (e.error = {
                code: "invalid_request",
                message: e.message
            })
        }

        function s(e) {
            if (e.photoset || e.photos) {
                var t = "photoset" in e ? "photoset" : "photos";
                e = u(e, t), d(e), e.data = e.photo, delete e.photo;
                for (var n = 0; n < e.data.length; n++) {
                    var o = e.data[n];
                    o.name = o.title, o.picture = r(o.id, o.farm, o.server, o.secret, ""), o.pictures = l(o.id, o.farm, o.server, o.secret), o.source = r(o.id, o.farm, o.server, o.secret, "b"), o.thumbnail = r(o.id, o.farm, o.server, o.secret, "m")
                }
            }
            return e
        }

        function l(e, t, n, o) {
            var i = 2048,
                a = [{
                    id: "t",
                    max: 100
                }, {
                    id: "m",
                    max: 240
                }, {
                    id: "n",
                    max: 320
                }, {
                    id: "",
                    max: 500
                }, {
                    id: "z",
                    max: 640
                }, {
                    id: "c",
                    max: 800
                }, {
                    id: "b",
                    max: 1024
                }, {
                    id: "h",
                    max: 1600
                }, {
                    id: "k",
                    max: 2048
                }, {
                    id: "o",
                    max: i
                }];
            return a.map(function(i) {
                return {
                    source: r(e, t, n, o, i.id),
                    width: i.max,
                    height: i.max
                }
            })
        }

        function u(e, t) {
            return t in e ? e = e[t] : "error" in e || (e.error = {
                code: "invalid_request",
                message: e.message || "Failed to get data from Flickr"
            }), e
        }

        function c(e) {
            if (a(e), e.contacts) {
                e = u(e, "contacts"), d(e), e.data = e.contact, delete e.contact;
                for (var t = 0; t < e.data.length; t++) {
                    var n = e.data[t];
                    n.id = n.nsid, n.name = n.realname || n.username, n.thumbnail = i(n, "m")
                }
            }
            return e
        }

        function d(e) {
            e.page && e.pages && e.page !== e.pages && (e.paging = {
                next: "?page=" + ++e.page
            })
        }
        e.init({
            flickr: {
                name: "Flickr",
                oauth: {
                    version: "1.0a",
                    auth: "https://www.flickr.com/services/oauth/authorize?perms=read",
                    request: "https://www.flickr.com/services/oauth/request_token",
                    token: "https://www.flickr.com/services/oauth/access_token"
                },
                base: "https://api.flickr.com/services/rest",
                get: {
                    me: o("flickr.people.getInfo"),
                    "me/friends": o("flickr.contacts.getList", {
                        per_page: "@{limit|50}"
                    }),
                    "me/following": o("flickr.contacts.getList", {
                        per_page: "@{limit|50}"
                    }),
                    "me/followers": o("flickr.contacts.getList", {
                        per_page: "@{limit|50}"
                    }),
                    "me/albums": o("flickr.photosets.getList", {
                        per_page: "@{limit|50}"
                    }),
                    "me/album": o("flickr.photosets.getPhotos", {
                        photoset_id: "@{id}"
                    }),
                    "me/photos": o("flickr.people.getPhotos", {
                        per_page: "@{limit|50}"
                    })
                },
                wrap: {
                    me: function(e) {
                        if (a(e), e = u(e, "person"), e.id) {
                            if (e.realname) {
                                e.name = e.realname._content;
                                var t = e.name.split(" ");
                                e.first_name = t.shift(), e.last_name = t.join(" ")
                            }
                            e.thumbnail = i(e, "l"), e.picture = i(e, "l")
                        }
                        return e
                    },
                    "me/friends": c,
                    "me/followers": c,
                    "me/following": c,
                    "me/albums": function(e) {
                        return a(e), e = u(e, "photosets"), d(e), e.photoset && (e.data = e.photoset, e.data.forEach(function(e) {
                            e.name = e.title._content, e.photos = "https://api.flickr.com/services/rest" + t("flickr.photosets.getPhotos", {
                                photoset_id: e.id
                            }, !0)
                        }), delete e.photoset), e
                    },
                    "me/photos": function(e) {
                        return a(e), s(e)
                    },
                    "default": function(e) {
                        return a(e), s(e)
                    }
                },
                xhr: !1,
                jsonp: function(e, t) {
                    "get" == e.method && (delete t.callback, t.jsoncallback = e.callbackID)
                }
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            !e.meta || 400 !== e.meta.code && 401 !== e.meta.code || (e.error = {
                code: "access_denied",
                message: e.meta.errorDetail
            })
        }

        function n(e) {
            e && e.id && (e.thumbnail = e.photo.prefix + "100x100" + e.photo.suffix, e.name = e.firstName + " " + e.lastName, e.first_name = e.firstName, e.last_name = e.lastName, e.contact && e.contact.email && (e.email = e.contact.email))
        }

        function o(e, t) {
            var n = t.access_token;
            return delete t.access_token, t.oauth_token = n, t.v = 20121125, !0
        }
        e.init({
            foursquare: {
                name: "Foursquare",
                oauth: {
                    version: 2,
                    auth: "https://foursquare.com/oauth2/authenticate",
                    grant: "https://foursquare.com/oauth2/access_token"
                },
                refresh: !0,
                base: "https://api.foursquare.com/v2/",
                get: {
                    me: "users/self",
                    "me/friends": "users/self/friends",
                    "me/followers": "users/self/friends",
                    "me/following": "users/self/friends"
                },
                wrap: {
                    me: function(e) {
                        return t(e), e && e.response && (e = e.response.user, n(e)), e
                    },
                    "default": function(e) {
                        return t(e), e && "response" in e && "friends" in e.response && "items" in e.response.friends && (e.data = e.response.friends.items, e.data.forEach(n), delete e.response), e
                    }
                },
                xhr: o,
                jsonp: o
            }
        })
    }(hello),
    function(e) {
        function t(e, t) {
            var n = t ? t.statusCode : e && "meta" in e && "status" in e.meta && e.meta.status;
            401 !== n && 403 !== n || (e.error = {
                code: "access_denied",
                message: e.message || (e.data ? e.data.message : "Could not get response")
            }, delete e.message)
        }

        function n(e) {
            e.id && (e.thumbnail = e.picture = e.avatar_url, e.name = e.login)
        }

        function o(e, t, n) {
            if (e.data && e.data.length && t && t.Link) {
                var o = t.Link.match(/<(.*?)>;\s*rel=\"next\"/);
                o && (e.paging = {
                    next: o[1]
                })
            }
        }
        e.init({
            github: {
                name: "GitHub",
                oauth: {
                    version: 2,
                    auth: "https://github.com/login/oauth/authorize",
                    grant: "https://github.com/login/oauth/access_token",
                    response_type: "code"
                },
                scope: {
                    email: "user:email"
                },
                base: "https://api.github.com/",
                get: {
                    me: "user",
                    "me/friends": "user/following?per_page=@{limit|100}",
                    "me/following": "user/following?per_page=@{limit|100}",
                    "me/followers": "user/followers?per_page=@{limit|100}",
                    "me/like": "user/starred?per_page=@{limit|100}"
                },
                wrap: {
                    me: function(e, o) {
                        return t(e, o), n(e), e
                    },
                    "default": function(e, i, r) {
                        return t(e, i), Array.isArray(e) && (e = {
                            data: e
                        }), e.data && (o(e, i, r), e.data.forEach(n)), e
                    }
                },
                xhr: function(e) {
                    return "get" !== e.method && e.data && (e.headers = e.headers || {}, e.headers["Content-Type"] = "application/json", "object" == typeof e.data && (e.data = JSON.stringify(e.data))), !0
                }
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            return parseInt(e, 10)
        }

        function n(e) {
            return c(e), e.data = e.items, delete e.items, e
        }

        function o(e) {
            return e.error ? void 0 : (e.name || (e.name = e.title || e.message), e.picture || (e.picture = e.thumbnailLink), e.thumbnail || (e.thumbnail = e.thumbnailLink), "application/vnd.google-apps.folder" === e.mimeType && (e.type = "folder", e.files = "https://www.googleapis.com/drive/v2/files?q=%22" + e.id + "%22+in+parents"), e)
        }

        function i(e) {
            return {
                source: e.url,
                width: e.width,
                height: e.height
            }
        }

        function r(e) {
            e.data = e.feed.entry.map(u), delete e.feed
        }

        function a(e) {
            if (c(e), "feed" in e && "entry" in e.feed) e.data = e.feed.entry.map(u), delete e.feed;
            else {
                if ("entry" in e) return u(e.entry);
                "items" in e ? (e.data = e.items.map(o), delete e.items) : o(e)
            }
            return e
        }

        function s(e) {
            e.name = e.displayName || e.name, e.picture = e.picture || (e.image ? e.image.url : null), e.thumbnail = e.picture
        }

        function l(e, t, n) {
            c(e);
            if ("feed" in e && "entry" in e.feed) {
                for (var o = n.query.access_token, i = 0; i < e.feed.entry.length; i++) {
                    var r = e.feed.entry[i];
                    if (r.id = r.id.$t, r.name = r.title.$t, delete r.title, r.gd$email && (r.email = r.gd$email && r.gd$email.length > 0 ? r.gd$email[0].address : null, r.emails = r.gd$email, delete r.gd$email), r.updated && (r.updated = r.updated.$t), r.link) {
                        var a = r.link.length > 0 ? r.link[0].href : null;
                        a && r.link[0].gd$etag && (a += (a.indexOf("?") > -1 ? "&" : "?") + "access_token=" + o, r.picture = a, r.thumbnail = a), delete r.link
                    }
                    r.category && delete r.category
                }
                e.data = e.feed.entry, delete e.feed
            }
            return e
        }

        function u(e) {
            var t, n = e.media$group,
                o = n.media$content.length ? n.media$content[0] : {},
                r = n.media$content || [],
                a = n.media$thumbnail || [],
                s = r.concat(a).map(i).sort(function(e, t) {
                    return e.width - t.width
                }),
                l = 0,
                u = {
                    id: e.id.$t,
                    name: e.title.$t,
                    description: e.summary.$t,
                    updated_time: e.updated.$t,
                    created_time: e.published.$t,
                    picture: o ? o.url : null,
                    pictures: s,
                    images: [],
                    thumbnail: o ? o.url : null,
                    width: o.width,
                    height: o.height
                };
            if ("link" in e)
                for (l = 0; l < e.link.length; l++) {
                    var c = e.link[l];
                    if (c.rel.match(/\#feed$/)) {
                        u.upload_location = u.files = u.photos = c.href;
                        break
                    }
                }
            if ("category" in e && e.category.length)
                for (t = e.category, l = 0; l < t.length; l++) t[l].scheme && t[l].scheme.match(/\#kind$/) && (u.type = t[l].term.replace(/^.*?\#/, ""));
            return "media$thumbnail" in n && n.media$thumbnail.length && (t = n.media$thumbnail, u.thumbnail = t[0].url, u.images = t.map(i)), t = n.media$content, t && t.length && u.images.push(i(t[0])), u
        }

        function c(e) {
            if ("feed" in e && e.feed.openSearch$itemsPerPage) {
                var n = t(e.feed.openSearch$itemsPerPage.$t),
                    o = t(e.feed.openSearch$startIndex.$t),
                    i = t(e.feed.openSearch$totalResults.$t);
                i > o + n && (e.paging = {
                    next: "?start=" + (o + n)
                })
            } else "nextPageToken" in e && (e.paging = {
                next: "?pageToken=" + e.nextPageToken
            })
        }

        function d() {
            function e(e) {
                var n = new FileReader;
                n.onload = function(n) {
                    t(btoa(n.target.result), e.type + r + "Content-Transfer-Encoding: base64")
                }, n.readAsBinaryString(e)
            }

            function t(e, t) {
                n.push(r + "Content-Type: " + t + r + r + e), i--, s()
            }
            var n = [],
                o = (1e10 * Math.random()).toString(32),
                i = 0,
                r = "\r\n",
                a = r + "--" + o,
                s = function() {},
                l = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;
            this.append = function(n, o) {
                "string" != typeof n && "length" in Object(n) || (n = [n]);
                for (var a = 0; a < n.length; a++) {
                    i++;
                    var s = n[a];
                    if ("undefined" != typeof File && s instanceof File || "undefined" != typeof Blob && s instanceof Blob) e(s);
                    else if ("string" == typeof s && s.match(l)) {
                        var u = s.match(l);
                        t(s.replace(l, ""), u[1] + r + "Content-Transfer-Encoding: base64")
                    } else t(s, o)
                }
            }, this.onready = function(e) {
                (s = function() {
                    0 === i && (n.unshift(""), n.push("--"), e(n.join(a), o), n = [])
                })()
            }
        }

        function f(e, t) {
            var n = {};
            e.data && "undefined" != typeof HTMLInputElement && e.data instanceof HTMLInputElement && (e.data = {
                file: e.data
            }), !e.data.name && Object(Object(e.data.file).files).length && "post" === e.method && (e.data.name = e.data.file.files[0].name), "post" === e.method ? e.data = {
                title: e.data.name,
                parents: [{
                    id: e.data.parent || "root"
                }],
                file: e.data.file
            } : (n = e.data, e.data = {}, n.parent && (e.data.parents = [{
                id: e.data.parent || "root"
            }]), n.file && (e.data.file = n.file), n.name && (e.data.title = n.name));
            var o;
            if ("file" in e.data && (o = e.data.file, delete e.data.file, "object" == typeof o && "files" in o && (o = o.files), !o || !o.length)) return void t({
                error: {
                    code: "request_invalid",
                    message: "There were no files attached with this request to upload"
                }
            });
            var i = new d;
            i.append(JSON.stringify(e.data), "application/json"), o && i.append(o), i.onready(function(o, i) {
                e.headers["content-type"] = 'multipart/related; boundary="' + i + '"', e.data = o, t("upload/drive/v2/files" + (n.id ? "/" + n.id : "") + "?uploadType=multipart")
            })
        }

        function p(e) {
            if ("object" == typeof e.data) try {
                e.data = JSON.stringify(e.data), e.headers["content-type"] = "application/json"
            } catch (t) {}
        }
        var m = "https://www.google.com/m8/feeds/contacts/default/full?v=3.0&alt=json&max-results=@{limit|1000}&start-index=@{start|1}";
        e.init({
            google: {
                name: "Google Plus",
                oauth: {
                    version: 2,
                    auth: "https://accounts.google.com/o/oauth2/auth",
                    grant: "https://accounts.google.com/o/oauth2/token"
                },
                scope: {
                    basic: "https://www.googleapis.com/auth/plus.me profile",
                    email: "email",
                    birthday: "",
                    events: "",
                    photos: "https://picasaweb.google.com/data/",
                    videos: "http://gdata.youtube.com",
                    friends: "https://www.google.com/m8/feeds, https://www.googleapis.com/auth/plus.login",
                    files: "https://www.googleapis.com/auth/drive.readonly",
                    publish: "",
                    publish_files: "https://www.googleapis.com/auth/drive",
                    share: "",
                    create_event: "",
                    offline_access: ""
                },
                scope_delim: " ",
                login: function(e) {
                    "code" === e.qs.response_type && (e.qs.access_type = "offline"), e.options.force && (e.qs.approval_prompt = "force")
                },
                base: "https://www.googleapis.com/",
                get: {
                    me: "plus/v1/people/me",
                    "me/friends": "plus/v1/people/me/people/visible?maxResults=@{limit|100}",
                    "me/following": m,
                    "me/followers": m,
                    "me/contacts": m,
                    "me/share": "plus/v1/people/me/activities/public?maxResults=@{limit|100}",
                    "me/feed": "plus/v1/people/me/activities/public?maxResults=@{limit|100}",
                    "me/albums": "https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}",
                    "me/album": function(e, t) {
                        var n = e.query.id;
                        delete e.query.id, t(n.replace("/entry/", "/feed/"))
                    },
                    "me/photos": "https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}",
                    "me/file": "drive/v2/files/@{id}",
                    "me/files": "drive/v2/files?q=%22@{parent|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}",
                    "me/folders": "drive/v2/files?q=%22@{id|root}%22+in+parents+and+mimeType+=+%22application/vnd.google-apps.folder%22+and+trashed=false&maxResults=@{limit|100}",
                    "me/folder": "drive/v2/files?q=%22@{id|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}"
                },
                post: {
                    "me/files": f,
                    "me/folders": function(e, t) {
                        e.data = {
                            title: e.data.name,
                            parents: [{
                                id: e.data.parent || "root"
                            }],
                            mimeType: "application/vnd.google-apps.folder"
                        }, t("drive/v2/files")
                    }
                },
                put: {
                    "me/files": f
                },
                del: {
                    "me/files": "drive/v2/files/@{id}",
                    "me/folder": "drive/v2/files/@{id}"
                },
                patch: {
                    "me/file": "drive/v2/files/@{id}"
                },
                wrap: {
                    me: function(e) {
                        return e.id && (e.last_name = e.family_name || (e.name ? e.name.familyName : null), e.first_name = e.given_name || (e.name ? e.name.givenName : null), e.emails && e.emails.length && (e.email = e.emails[0].value), s(e)), e
                    },
                    "me/friends": function(e) {
                        return e.items && (c(e), e.data = e.items, e.data.forEach(s), delete e.items), e
                    },
                    "me/contacts": l,
                    "me/followers": l,
                    "me/following": l,
                    "me/share": n,
                    "me/feed": n,
                    "me/albums": a,
                    "me/photos": r,
                    "default": a
                },
                xhr: function(t) {
                    return "post" === t.method || "put" === t.method ? p(t) : "patch" === t.method && (e.utils.extend(t.query, t.data), t.data = null), !0
                },
                form: !1
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            return {
                source: e.url,
                width: e.width,
                height: e.height
            }
        }

        function n(e) {
            return "string" == typeof e ? {
                error: {
                    code: "invalid_request",
                    message: e
                }
            } : (e && "meta" in e && "error_type" in e.meta && (e.error = {
                code: e.meta.error_type,
                message: e.meta.error_message
            }), e)
        }

        function o(e) {
            return r(e), e && "data" in e && e.data.forEach(i), e
        }

        function i(e) {
            e.id && (e.thumbnail = e.profile_picture, e.name = e.full_name || e.username)
        }

        function r(e) {
            "pagination" in e && (e.paging = {
                next: e.pagination.next_url
            }, delete e.pagination)
        }
        e.init({
            instagram: {
                name: "Instagram",
                oauth: {
                    version: 2,
                    auth: "https://instagram.com/oauth/authorize/",
                    grant: "https://api.instagram.com/oauth/access_token"
                },
                refresh: !0,
                scope: {
                    basic: "basic",
                    photos: "",
                    friends: "relationships",
                    publish: "likes comments",
                    email: "",
                    share: "",
                    publish_files: "",
                    files: "",
                    videos: "",
                    offline_access: ""
                },
                scope_delim: " ",
                base: "https://api.instagram.com/v1/",
                get: {
                    me: "users/self",
                    "me/feed": "users/self/feed?count=@{limit|100}",
                    "me/photos": "users/self/media/recent?min_id=0&count=@{limit|100}",
                    "me/friends": "users/self/follows?count=@{limit|100}",
                    "me/following": "users/self/follows?count=@{limit|100}",
                    "me/followers": "users/self/followed-by?count=@{limit|100}",
                    "friend/photos": "users/@{id}/media/recent?min_id=0&count=@{limit|100}"
                },
                post: {
                    "me/like": function(e, t) {
                        var n = e.data.id;
                        e.data = {}, t("media/" + n + "/likes")
                    }
                },
                del: {
                    "me/like": "media/@{id}/likes"
                },
                wrap: {
                    me: function(e) {
                        return n(e), "data" in e && (e.id = e.data.id, e.thumbnail = e.data.profile_picture, e.name = e.data.full_name || e.data.username), e
                    },
                    "me/friends": o,
                    "me/following": o,
                    "me/followers": o,
                    "me/photos": function(e) {
                        return n(e), r(e), "data" in e && (e.data = e.data.filter(function(e) {
                            return "image" === e.type
                        }), e.data.forEach(function(e) {
                            e.name = e.caption ? e.caption.text : null, e.thumbnail = e.images.thumbnail.url, e.picture = e.images.standard_resolution.url, e.pictures = Object.keys(e.images).map(function(n) {
                                var o = e.images[n];
                                return t(o)
                            }).sort(function(e, t) {
                                return e.width - t.width
                            })
                        })), e
                    },
                    "default": function(e) {
                        return e = n(e), r(e), e
                    }
                },
                xhr: function(e, t) {
                    var n = e.method,
                        o = "get" !== n;
                    return o && ("post" !== n && "put" !== n || !e.query.access_token || (e.data.access_token = e.query.access_token, delete e.query.access_token), e.proxy = o), o
                },
                form: !1
            }
        })
    }(hello),
    function(e) {
        function t(e, t) {
            var n, i;
            return e && "Message" in e && (i = e.Message, delete e.Message, "ErrorCode" in e ? (n = e.ErrorCode, delete e.ErrorCode) : n = o(t), e.error = {
                code: n,
                message: i,
                details: e
            }), e
        }

        function n(e, t) {
            var n = t.access_token;
            return delete t.access_token, e.headers.Authorization = "Bearer " + n, "get" !== e.method && e.data && (e.headers["Content-Type"] = "application/json", "object" == typeof e.data && (e.data = JSON.stringify(e.data))), "put" === e.method && (e.method = "patch"), !0
        }

        function o(e) {
            switch (e.statusCode) {
                case 400:
                    return "invalid_request";
                case 403:
                    return "stale_token";
                case 401:
                    return "invalid_token";
                case 500:
                    return "server_error";
                default:
                    return "server_error"
            }
        }
        e.init({
            joinme: {
                name: "join.me",
                oauth: {
                    version: 2,
                    auth: "https://secure.join.me/api/public/v1/auth/oauth2",
                    grant: "https://secure.join.me/api/public/v1/auth/oauth2"
                },
                refresh: !1,
                scope: {
                    basic: "user_info",
                    user: "user_info",
                    scheduler: "scheduler",
                    start: "start_meeting",
                    email: "",
                    friends: "",
                    share: "",
                    publish: "",
                    photos: "",
                    publish_files: "",
                    files: "",
                    videos: "",
                    offline_access: ""
                },
                scope_delim: " ",
                login: function(e) {
                    e.options.popup.width = 400, e.options.popup.height = 700
                },
                base: "https://api.join.me/v1/",
                get: {
                    me: "user",
                    meetings: "meetings",
                    "meetings/info": "meetings/@{id}"
                },
                post: {
                    "meetings/start/adhoc": function(e, t) {
                        t("meetings/start")
                    },
                    "meetings/start/scheduled": function(e, t) {
                        var n = e.data.meetingId;
                        e.data = {}, t("meetings/" + n + "/start")
                    },
                    "meetings/schedule": function(e, t) {
                        t("meetings")
                    }
                },
                patch: {
                    "meetings/update": function(e, t) {
                        t("meetings/" + e.data.meetingId)
                    }
                },
                del: {
                    "meetings/delete": "meetings/@{id}"
                },
                wrap: {
                    me: function(e, n) {
                        return t(e, n), e.email ? (e.name = e.fullName, e.first_name = e.name.split(" ")[0], e.last_name = e.name.split(" ")[1], e.id = e.email, e) : e
                    },
                    "default": function(e, n) {
                        return t(e, n), e
                    }
                },
                xhr: n
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            e && "errorCode" in e && (e.error = {
                code: e.status,
                message: e.message
            })
        }

        function n(e) {
            return e.error ? void 0 : (e.first_name = e.firstName, e.last_name = e.lastName, e.name = e.formattedName || e.first_name + " " + e.last_name, e.thumbnail = e.pictureUrl, e.email = e.emailAddress, e)
        }

        function o(e) {
            return t(e), i(e), e.values && (e.data = e.values.map(n), delete e.values), e
        }

        function i(e) {
            "_count" in e && "_start" in e && e._count + e._start < e._total && (e.paging = {
                next: "?start=" + (e._start + e._count) + "&count=" + e._count
            })
        }

        function r(e, t) {
            "{}" === JSON.stringify(e) && 200 === t.statusCode && (e.success = !0)
        }

        function a(e) {
            e.access_token && (e.oauth2_access_token = e.access_token, delete e.access_token)
        }

        function s(e, t) {
            e.headers["x-li-format"] = "json";
            var n = e.data.id;
            e.data = ("delete" !== e.method).toString(), e.method = "put", t("people/~/network/updates/key=" + n + "/is-liked")
        }
        e.init({
            linkedin: {
                oauth: {
                    version: 2,
                    response_type: "code",
                    auth: "https://www.linkedin.com/uas/oauth2/authorization",
                    grant: "https://www.linkedin.com/uas/oauth2/accessToken"
                },
                refresh: !0,
                scope: {
                    basic: "r_basicprofile",
                    email: "r_emailaddress",
                    files: "",
                    friends: "",
                    photos: "",
                    publish: "w_share",
                    publish_files: "w_share",
                    share: "",
                    videos: "",
                    offline_access: ""
                },
                scope_delim: " ",
                base: "https://api.linkedin.com/v1/",
                get: {
                    me: "people/~:(picture-url,first-name,last-name,id,formatted-name,email-address)",
                    "me/share": "people/~/network/updates?count=@{limit|250}"
                },
                post: {
                    "me/share": function(e, t) {
                        var n = {
                            visibility: {
                                code: "anyone"
                            }
                        };
                        e.data.id ? n.attribution = {
                            share: {
                                id: e.data.id
                            }
                        } : (n.comment = e.data.message, e.data.picture && e.data.link && (n.content = {
                            "submitted-url": e.data.link,
                            "submitted-image-url": e.data.picture
                        })), e.data = JSON.stringify(n), t("people/~/shares?format=json")
                    },
                    "me/like": s
                },
                del: {
                    "me/like": s
                },
                wrap: {
                    me: function(e) {
                        return t(e), n(e), e
                    },
                    "me/friends": o,
                    "me/following": o,
                    "me/followers": o,
                    "me/share": function(e) {
                        return t(e), i(e), e.values && (e.data = e.values.map(n), e.data.forEach(function(e) {
                            e.message = e.headline
                        }), delete e.values), e
                    },
                    "default": function(e, n) {
                        t(e), r(e, n), i(e)
                    }
                },
                jsonp: function(e, t) {
                    a(t), "get" === e.method && (t.format = "jsonp", t["error-callback"] = e.callbackID)
                },
                xhr: function(e, t) {
                    return "get" !== e.method ? (a(t), e.headers["Content-Type"] = "application/json", e.headers["x-li-format"] = "json", e.proxy = !0, !0) : !1
                }
            }
        })
    }(hello),
    function(e) {
        function t(e, t) {
            var n = t.access_token;
            return delete t.access_token, t.oauth_token = n, t["_status_code_map[302]"] = 200, !0
        }

        function n(e) {
            return e.id && (e.picture = e.avatar_url, e.thumbnail = e.avatar_url, e.name = e.username || e.full_name), e
        }

        function o(e) {
            "next_href" in e && (e.paging = {
                next: e.next_href
            })
        }
        e.init({
            soundcloud: {
                name: "SoundCloud",
                oauth: {
                    version: 2,
                    auth: "https://soundcloud.com/connect",
                    grant: "https://soundcloud.com/oauth2/token"
                },
                base: "https://api.soundcloud.com/",
                get: {
                    me: "me.json",
                    "me/friends": "me/followings.json",
                    "me/followers": "me/followers.json",
                    "me/following": "me/followings.json",
                    "default": function(e, t) {
                        t(e.path + ".json")
                    }
                },
                wrap: {
                    me: function(e) {
                        return n(e), e
                    },
                    "default": function(e) {
                        return Array.isArray(e) && (e = {
                            data: e.map(n)
                        }), o(e), e
                    }
                },
                xhr: t,
                jsonp: t
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            if (e.id) {
                if (e.name) {
                    var t = e.name.split(" ");
                    e.first_name = t.shift(), e.last_name = t.join(" ")
                }
                e.thumbnail = e.profile_image_url_https || e.profile_image_url
            }
            return e
        }

        function n(e) {
            return o(e), i(e), e.users && (e.data = e.users.map(t), delete e.users), e
        }

        function o(e) {
            if (e.errors) {
                var t = e.errors[0];
                e.error = {
                    code: "request_failed",
                    message: t.message
                }
            }
        }

        function i(e) {
            "next_cursor_str" in e && (e.paging = {
                next: "?cursor=" + e.next_cursor_str
            })
        }

        function r(e) {
            return Array.isArray(e) ? {
                data: e
            } : e
        }
        var a = "https://api.twitter.com/";
        e.init({
            twitter: {
                oauth: {
                    version: "1.0a",
                    auth: a + "oauth/authenticate",
                    request: a + "oauth/request_token",
                    token: a + "oauth/access_token"
                },
                login: function(e) {
                    var t = "?force_login=true";
                    this.oauth.auth = this.oauth.auth.replace(t, "") + (e.options.force ? t : "")
                },
                base: a + "1.1/",
                get: {
                    me: "account/verify_credentials.json",
                    "me/friends": "friends/list.json?count=@{limit|200}",
                    "me/following": "friends/list.json?count=@{limit|200}",
                    "me/followers": "followers/list.json?count=@{limit|200}",
                    "me/share": "statuses/user_timeline.json?count=@{limit|200}",
                    "me/like": "favorites/list.json?count=@{limit|200}"
                },
                post: {
                    "me/share": function(t, n) {
                        var o = t.data;
                        t.data = null;
                        var i = [];
                        o.message && (i.push(o.message), delete o.message), o.link && (i.push(o.link), delete o.link), o.picture && (i.push(o.picture), delete o.picture), i.length && (o.status = i.join(" ")), o.file ? (o["media[]"] = o.file, delete o.file, t.data = o, n("statuses/update_with_media.json")) : "id" in o ? n("statuses/retweet/" + o.id + ".json") : (e.utils.extend(t.query, o), n("statuses/update.json?include_entities=1"))
                    },
                    "me/like": function(e, t) {
                        var n = e.data.id;
                        e.data = null, t("favorites/create.json?id=" + n)
                    }
                },
                del: {
                    "me/like": function() {
                        p.method = "post";
                        var e = p.data.id;
                        p.data = null, callback("favorites/destroy.json?id=" + e)
                    }
                },
                wrap: {
                    me: function(e) {
                        return o(e), t(e), e
                    },
                    "me/friends": n,
                    "me/followers": n,
                    "me/following": n,
                    "me/share": function(e) {
                        return o(e), i(e), !e.error && "length" in e ? {
                            data: e
                        } : e
                    },
                    "default": function(e) {
                        return e = r(e), i(e), e
                    }
                },
                xhr: function(e) {
                    return "get" !== e.method
                }
            }
        })
    }(hello),
    function(e) {
        function t(e, t) {
            return null !== e && "response" in e && null !== e.response && e.response.length && (e = e.response[0], e.id = e.uid, e.thumbnail = e.picture = e.photo_max, e.name = e.first_name + " " + e.last_name, t.authResponse && null !== t.authResponse.email && (e.email = t.authResponse.email)), e
        }

        function n(e) {
            if (e.error) {
                var t = e.error;
                e.error = {
                    code: t.error_code,
                    message: t.error_msg
                }
            }
        }
        e.init({
            vk: {
                name: "Vk",
                oauth: {
                    version: 2,
                    auth: "https://oauth.vk.com/authorize",
                    grant: "https://oauth.vk.com/access_token"
                },
                scope: {
                    email: "email",
                    friends: "friends",
                    photos: "photos",
                    videos: "video",
                    share: "share",
                    offline_access: "offline"
                },
                refresh: !0,
                login: function(e) {
                    e.qs.display = window.navigator && window.navigator.userAgent && /ipad|phone|phone|android/.test(window.navigator.userAgent.toLowerCase()) ? "mobile" : "popup"
                },
                base: "https://api.vk.com/method/",
                get: {
                    me: function(e, t) {
                        e.query.fields = "id,first_name,last_name,photo_max", t("users.get")
                    }
                },
                wrap: {
                    me: function(e, o, i) {
                        return n(e), t(e, i)
                    }
                },
                xhr: !1,
                jsonp: !0,
                form: !1
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            return "data" in e && e.data.forEach(function(e) {
                e.picture && (e.thumbnail = e.picture), e.images && (e.pictures = e.images.map(n).sort(function(e, t) {
                    return e.width - t.width
                }))
            }), e
        }

        function n(e) {
            return {
                width: e.width,
                height: e.height,
                source: e.source
            }
        }

        function o(e) {
            return "data" in e && e.data.forEach(function(e) {
                e.photos = e.files = "https://apis.live.net/v5.0/" + e.id + "/photos"
            }), e
        }

        function i(e, t, n) {
            if (e.id) {
                var o = n.query.access_token;
                if (e.emails && (e.email = e.emails.preferred), e.is_friend !== !1) {
                    var i = e.user_id || e.id;
                    e.thumbnail = e.picture = "https://apis.live.net/v5.0/" + i + "/picture?access_token=" + o
                }
            }
            return e
        }

        function r(e, t, n) {
            return "data" in e && e.data.forEach(function(e) {
                i(e, t, n)
            }), e
        }
        e.init({
            windows: {
                name: "Windows live",
                oauth: {
                    version: 2,
                    auth: "https://login.live.com/oauth20_authorize.srf",
                    grant: "https://login.live.com/oauth20_token.srf"
                },
                refresh: !0,
                logout: function() {
                    return "http://login.live.com/oauth20_logout.srf?ts=" + (new Date).getTime()
                },
                scope: {
                    basic: "wl.signin,wl.basic",
                    email: "wl.emails",
                    birthday: "wl.birthday",
                    events: "wl.calendars",
                    photos: "wl.photos",
                    videos: "wl.photos",
                    friends: "wl.contacts_emails",
                    files: "wl.skydrive",
                    publish: "wl.share",
                    publish_files: "wl.skydrive_update",
                    share: "wl.share",
                    create_event: "wl.calendars_update,wl.events_create",
                    offline_access: "wl.offline_access"
                },
                base: "https://apis.live.net/v5.0/",
                get: {
                    me: "me",
                    "me/friends": "me/friends",
                    "me/following": "me/contacts",
                    "me/followers": "me/friends",
                    "me/contacts": "me/contacts",
                    "me/albums": "me/albums",
                    "me/album": "@{id}/files",
                    "me/photo": "@{id}",
                    "me/files": "@{parent|me/skydrive}/files",
                    "me/folders": "@{id|me/skydrive}/files",
                    "me/folder": "@{id|me/skydrive}/files"
                },
                post: {
                    "me/albums": "me/albums",
                    "me/album": "@{id}/files/",
                    "me/folders": "@{id|me/skydrive/}",
                    "me/files": "@{parent|me/skydrive}/files"
                },
                del: {
                    "me/album": "@{id}",
                    "me/photo": "@{id}",
                    "me/folder": "@{id}",
                    "me/files": "@{id}"
                },
                wrap: {
                    me: i,
                    "me/friends": r,
                    "me/contacts": r,
                    "me/followers": r,
                    "me/following": r,
                    "me/albums": o,
                    "me/photos": t,
                    "default": t
                },
                xhr: function(t) {
                    return "get" === t.method || "delete" === t.method || e.utils.hasBinary(t.data) || ("string" == typeof t.data.file ? t.data.file = e.utils.toBlob(t.data.file) : (t.data = JSON.stringify(t.data), t.headers = {
                        "Content-Type": "application/json"
                    })), !0
                },
                jsonp: function(t) {
                    "get" === t.method || e.utils.hasBinary(t.data) || (t.data.method = t.method, t.method = "get")
                }
            }
        })
    }(hello),
    function(e) {
        function t(e) {
            e && "meta" in e && "error_type" in e.meta && (e.error = {
                code: e.meta.error_type,
                message: e.meta.error_message
            })
        }

        function n(e) {
            if (t(e), e.query && e.query.results && e.query.results.profile) {
                e = e.query.results.profile, e.id = e.guid, e.last_name = e.familyName, e.first_name = e.givenName || e.nickname;
                var n = [];
                e.first_name && n.push(e.first_name), e.last_name && n.push(e.last_name), e.name = n.join(" "), e.email = e.emails && e.emails[0] ? e.emails[0].handle : null, e.thumbnail = e.image ? e.image.imageUrl : null
            }
            return e
        }

        function o(e, n, o) {
            t(e), r(e, n, o);
            return e.query && e.query.results && e.query.results.contact && (e.data = e.query.results.contact, delete e.query, Array.isArray(e.data) || (e.data = [e.data]), e.data.forEach(i)), e
        }

        function i(e) {
            e.id = null, !e.fields || e.fields instanceof Array || (e.fields = [e.fields]), (e.fields || []).forEach(function(t) {
                "email" === t.type && (e.email = t.value), "name" === t.type && (e.first_name = t.value.givenName, e.last_name = t.value.familyName, e.name = t.value.givenName + " " + t.value.familyName), "yahooid" === t.type && (e.id = t.value)
            })
        }

        function r(e, t, n) {
            return e.query && e.query.count && n.options && (e.paging = {
                next: "?start=" + (e.query.count + (+n.options.start || 1))
            }), e
        }

        function a(e) {
            return "https://query.yahooapis.com/v1/yql?q=" + (e + " limit @{limit|100} offset @{start|0}").replace(/\s/g, "%20") + "&format=json"
        }
        e.init({
            yahoo: {
                oauth: {
                    version: "1.0a",
                    auth: "https://api.login.yahoo.com/oauth/v2/request_auth",
                    request: "https://api.login.yahoo.com/oauth/v2/get_request_token",
                    token: "https://api.login.yahoo.com/oauth/v2/get_token"
                },
                login: function(e) {
                    e.options.popup.width = 560;
                    try {
                        delete e.qs.state.scope
                    } catch (t) {}
                },
                base: "https://social.yahooapis.com/v1/",
                get: {
                    me: a("select * from social.profile(0) where guid=me"),
                    "me/friends": a("select * from social.contacts(0) where guid=me"),
                    "me/following": a("select * from social.contacts(0) where guid=me")
                },
                wrap: {
                    me: n,
                    "me/friends": o,
                    "me/following": o,
                    "default": r
                }
            }
        })
    }(hello), "function" == typeof define && define.amd && define(function() {
        return hello
    }), "object" == typeof module && module.exports && (module.exports = hello);