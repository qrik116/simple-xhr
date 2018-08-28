"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var query_string_1 = __importDefault(require("query-string"));
;
var XmlFetch = /** @class */ (function () {
    function XmlFetch(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this._xhr = new XMLHttpRequest();
        this._pending = false;
        this._callbackResponce = [];
        this._callbackError = [];
        this._options = __assign({}, XmlFetch.options, options);
        this._xhr.onload = this._handlerLoad(this);
        this._xhr.timeout = this._options.timeout;
        this._xhr.ontimeout = function () { return _this._handlerError(new Error(_this._options.timeoutError)); };
    }
    Object.defineProperty(XmlFetch.prototype, "options", {
        get: function () {
            return __assign({}, this._options);
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
    XmlFetch.prototype._getDataBody = function (key, data) {
        var _a;
        if (Array.isArray(data)) {
            return data.map(function (value) {
                var _a;
                return query_string_1.default.stringify((_a = {}, _a[key] = value, _a));
            }).join('&');
        }
        return query_string_1.default.stringify((_a = {}, _a[key] = data, _a));
    };
    /**
     * Обработчик события полной загрузки на xhr
     */
    XmlFetch.prototype._handlerLoad = function (self) {
        var response = {};
        return function onload() {
            if ((this.status < 400 || this.status >= 500) && this.status !== 200) {
                self._handlerError(new Error(this.status + " " + this.statusText));
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
                self._handlerError(new Error(response.errors));
                return;
            }
            self._handlerSuccess(response);
        };
    };
    /**
     * Обрабатчик ошибок
     */
    XmlFetch.prototype._handlerError = function (error) {
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
    XmlFetch.prototype._handlerSuccess = function (data) {
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
     * Установка заголовков
     */
    XmlFetch.prototype._setHeaders = function () {
        var headers = this._options.headers;
        for (var name_1 in headers) {
            this._xhr.setRequestHeader(name_1, headers[name_1]);
        }
    };
    /**
     * Общий запрос
     */
    XmlFetch.prototype._request = function (url, _a) {
        var _b = _a.query, query = _b === void 0 ? {} : _b, params = __rest(_a, ["query"]);
        if (!this._pending) {
            var search_query = query ? "?" + query_string_1.default.stringify(query) : '';
            this._pending = true;
            this._xhr.open(this._options.method, "" + url + search_query, this._options.async);
            this._setHeaders();
            this._xhr.send(params.body);
        }
    };
    /**
     * GET запрос
     */
    XmlFetch.prototype.get = function (url, _a, options) {
        var params = __rest(_a, []);
        this.options = __assign({ method: 'GET' }, options);
        this._request(url, params);
        return this;
    };
    /**
     * POST запрос
     */
    XmlFetch.prototype.post = function (url, _a, options) {
        var _this = this;
        var params = __rest(_a, []);
        var files = params.files, data = params.data;
        var reqParams = {
            body: '',
        };
        this.options = __assign({ method: 'POST' }, options);
        if (files) {
            var Fdata_1 = new FormData();
            var _loop_1 = function (key) {
                files[key].forEach(function (file) { return Fdata_1.append(key, file); });
            };
            for (var key in files) {
                _loop_1(key);
            }
            if (data) {
                for (var key in data) {
                    Fdata_1.append(key, data[key]);
                }
            }
            reqParams.body = Fdata_1;
        }
        else {
            if (data) {
                if (!this._options.headers['Content-Type'])
                    this._options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                if (typeof data === 'string') {
                    reqParams.body = data;
                }
                else {
                    reqParams.body = Object.keys(data).map(function (key) {
                        return _this._getDataBody(key, data[key]);
                    }).join('&');
                }
            }
        }
        this._request(url, reqParams);
        return this;
    };
    /**
     * PUT запрос
     */
    XmlFetch.prototype.put = function (url, _a, options) {
        var params = __rest(_a, []);
        return this.post(url, params, __assign({ method: 'PUT' }, options));
    };
    /**
     * DELETE запрос
     */
    XmlFetch.prototype.delete = function (url, _a, options) {
        var params = __rest(_a, []);
        return this.get(url, params, __assign({ method: 'DELETE' }, options));
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
    XmlFetch.options = {
        method: 'GET',
        async: true,
        headers: {},
        timeout: 30000,
        timeoutError: 'Извините, запрос превысил максимальное время ожидания'
    };
    return XmlFetch;
}());
var http = {
    get: function (url, params, options) {
        return new XmlFetch().get(url, params, options);
    },
    post: function (url, params, options) {
        return new XmlFetch().post(url, params, options);
    },
    put: function (url, params, options) {
        return new XmlFetch().put(url, params, options);
    },
    delete: function (url, params, options) {
        return new XmlFetch().delete(url, params, options);
    }
};
exports.http = http;
exports.default = XmlFetch;
