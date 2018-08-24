var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "query-string"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var query_string_1 = __importDefault(require("query-string"));
    ;
    var XmlFetch = /** @class */ (function () {
        function XmlFetch(options) {
            if (options === void 0) { options = {}; }
            this._options = {
                method: 'GET',
                async: true
            };
            this._async = true;
            this._xhr = new XMLHttpRequest();
            this._pending = false;
            this._callbackResponce = [];
            this._callbackError = [];
            this._options = __assign({}, this._options, options);
            this._xhr.onload = this.handlerLoad(this);
        }
        Object.defineProperty(XmlFetch.prototype, "options", {
            get: function () {
                return this._options;
            },
            set: function (options) {
                this._options = __assign({}, this._options, options);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Установка данных в body, используя FormData
         */
        XmlFetch.prototype.setDataBody = function (options, data) {
            if (Array.isArray(data)) {
                data.forEach(function (value) { return options.body.append(options.key, value); });
            }
            else {
                options.body.append(options.key, data);
            }
        };
        /**
         * Обработчик события полной загрузки на xhr
         */
        XmlFetch.prototype.handlerLoad = function (self) {
            var response = {};
            return function onload() {
                if ((this.status < 400 || this.status >= 500) && this.status !== 200) {
                    self.handlerError(new Error(this.status + " " + this.statusText));
                    return;
                }
                response = JSON.parse(this.responseText);
                if (response.errors) {
                    if (typeof response.errors === 'object') {
                        var errorsKeys = Object.keys(response.errors);
                        if (errorsKeys.length) {
                            var errors_1 = {};
                            errorsKeys.forEach(function (key) { return errors_1[key] = response.errors[key].msg; });
                            response = errors_1;
                        }
                    }
                    self.handlerError(new Error(response.errors));
                    return;
                }
                self.handlerSuccess(response);
            };
        };
        /**
         * Обрабатчик ошибок
         */
        XmlFetch.prototype.handlerError = function (error) {
            this._pending = false;
            this._callbackError.reduce(function (res, fn) {
                if (Array.isArray(res)) {
                    return fn(res.slice());
                }
                if (typeof res === 'object') {
                    return fn(__assign({}, res));
                }
                return fn(res);
            }, error);
        };
        /**
         * Обрабатчик успешного запроса
         */
        XmlFetch.prototype.handlerSuccess = function (data) {
            this._pending = false;
            this._callbackResponce.reduce(function (res, fn) {
                if (Array.isArray(res)) {
                    return fn(res.slice());
                }
                if (typeof res === 'object') {
                    return fn(__assign({}, res));
                }
                return fn(res);
            }, data);
        };
        /**
         * Общий запрос
         */
        XmlFetch.prototype.request = function (url, _a) {
            var _b = _a.query, query = _b === void 0 ? {} : _b, params = __rest(_a, ["query"]);
            if (!this._pending) {
                this._pending = true;
                this._xhr.open(this._options.method, url + "?" + query_string_1.default.stringify(query), this._async);
                this._xhr.send(params.body);
            }
        };
        /**
         * GET запрос
         */
        XmlFetch.prototype.get = function (url, _a, customMethod) {
            var params = __rest(_a, []);
            this._options.method = customMethod || 'GET';
            this.request(url, params);
            return this;
        };
        /**
         * POST запрос
         */
        XmlFetch.prototype.post = function (url, _a, customMethod) {
            var params = __rest(_a, []);
            var files = params.files, data = params.data;
            var options = {
                body: new FormData(),
            };
            this._options.method = customMethod || 'POST';
            this._xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            if (files) {
                var _loop_1 = function (key) {
                    files[key].forEach(function (file) { return options.body.append(key, file); });
                };
                for (var key in files) {
                    _loop_1(key);
                }
            }
            if (data) {
                for (var key in data) {
                    this.setDataBody({ body: options.body, key: key }, data[key]);
                }
            }
            this.request(url, options);
            return this;
        };
        /**
         * PUT запрос
         */
        XmlFetch.prototype.put = function (url, _a) {
            var params = __rest(_a, []);
            var method = 'PUT';
            return this.post(url, params, method);
        };
        /**
         * DELETE запрос
         */
        XmlFetch.prototype.delete = function (url, _a) {
            var params = __rest(_a, []);
            var method = 'DELETE';
            return this.get(url, params, method);
        };
        /**
         * Метод, содержащий callback
         * @param {function} callback функция, срабатывающая после того как запрос выполнен
         * успешно, первым аргументом которой является ответ,
         * далее можно продолжить цепочку then, возвращая значение в предыдущем.
         */
        XmlFetch.prototype.then = function (callback) {
            this._callbackResponce.push(callback);
            return this;
        };
        /**
         * Метод, содержащий callback
         * @param {function} callback функция, срабатывающая после того как запрос выполнен
         * c ошибкой, первым аргументом которой является ошибка
         */
        XmlFetch.prototype.catch = function (callback) {
            this._callbackError.push(callback);
            return this;
        };
        /**
         * Отменяет запрос
         */
        XmlFetch.prototype.abort = function () {
            this._xhr.abort();
            return this;
        };
        return XmlFetch;
    }());
    var http = {
        get: function (url, params) {
            return new XmlFetch().get(url, params);
        },
        post: function (url, params) {
            return new XmlFetch().post(url, params);
        },
        put: function (url, params) {
            return new XmlFetch().put(url, params);
        },
        delete: function (url, params) {
            return new XmlFetch().delete(url, params);
        }
    };
    exports.http = http;
    exports.default = XmlFetch;
});
