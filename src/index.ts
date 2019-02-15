/// <reference path="../types/declare.d.ts" />
import querystring from 'query-string';

class XmlFetch implements IXmlFetch {
    static options: TOptionsRequire = {
        method: 'GET',
        async: true,
        headers: {},
        timeout: 30000,
        timeoutError: 'Извините, запрос превысил максимальное время ожидания',
        removeEmpty: false,
    };

    private _options: TOptionsRequire;
    private _xhr: XMLHttpRequest = new XMLHttpRequest();
    private _pending: boolean = false;
    private _callbackResponce: Array<TCallBackFunc> = [];
    private _callbackError: Array<TCallBackFunc> = [];

    constructor(options: TOptions = {}) {
        this._options = { ...XmlFetch.options, ...options };
        this._xhr.onload = this._handlerLoad(this);
        this._xhr.timeout = this._options.timeout;
        this._xhr.onerror = () => this._handlerError(new Error('Failed to fetch'));
        this._xhr.ontimeout = () => this._handlerError(new Error(this._options.timeoutError));
    }

    get options(): TOptions {
        return { ...this._options };
    }

    set options(options: TOptions) {
        this._options = { ...this._options, ...options };
    }

    /**
     * Очищает объект от свойств с пустыми значениями
     * @param object
     */
    static removeEmptyProps(object: TEmptyProps): object {
        const clearObject: TEmptyProps = {};

        for (let prop in object) {
            if (object.hasOwnProperty(prop)) {
                let value = object[prop];

                if (Array.isArray(value) && value.length) {
                    clearObject[prop] = value;
                }

                if ((typeof value === 'string' && value.length) || typeof value === 'number') {
                    clearObject[prop] = value;
                }
            }
        }
        return clearObject;
    }

    /**
     * Установка данных в body, используя FormData
     */
    private _getDataBody(key: string, data: string|[]): string {
        if (Array.isArray(data)) {
            return data.map(value => querystring.stringify({ [key]: value })).join('&');
        }

        return querystring.stringify({ [key]: data });
    }

    /**
     * Обработчик события полной загрузки на xhr
     */
    private _handlerLoad(self: XmlFetch): () => any {
        let response: any = {};

        return function onload(this: XMLHttpRequest): any {
            if ((this.status < 400 || this.status >= 500) && this.status !== 200) {
                self._handlerError(`${this.status} ${this.statusText}`);
                return;
            }

            response = JSON.parse(this.responseText);

            if (response.errors) {
                if (typeof response.errors === 'object') {
                    self._handlerError({ ...response.errors })
                    return;
                }
                self._handlerError(response.errors);
                return;
            }

            self._handlerSuccess(response);
        }
    }

    /**
     * Обработчик ошибок
     */
    private _handlerError(error: string | object): void {
        this._pending = false;
        this._callbackError.reduce((res, fn) => {
            if (Array.isArray(res)) {
                return fn([...res]);
            }

            if (res instanceof Error) {
                return fn(res);
            }

            if (typeof res === 'object') {
                return fn({ ...res });
            }

            return fn(res);
        }, error);
    }

    /**
     * Обрабатчик успешного запроса
     */
    private _handlerSuccess(data: any): void {
        this._pending = false;
        this._callbackResponce.reduce((res, fn) => {
            if (Array.isArray(res)) {
                return fn([...res]);
            }

            if (typeof res === 'object') {
                return fn({ ...res });
            }

            return fn(res);
        }, data);
    }

    /**
     * Установка заголовков
     */
    private _setHeaders() {
        const { headers } = this._options;

        for (const name in headers) {
            this._xhr.setRequestHeader(name, headers[name]);
        }
    }

    /**
     * Общий запрос
     */
    private _request(
        url: string,
        { query = {}, ...params }: { query?: object, body?: string | FormData }
    ): void {
        if (!this._pending) {
            let search_query: string = '';

            if (query) {
                search_query = '?' + querystring.stringify(this._options.removeEmpty ? XmlFetch.removeEmptyProps(query) : query);
            }

            this._pending = true;
            this._xhr.open(this._options.method, `${url}${search_query}`, this._options.async);
            this._setHeaders();
            this._xhr.send(params.body);
        }
    }

    /**
     * GET запрос
     */
    public get(url: string, { ...params }: TGetParams, options?: TOptions): XmlFetch {
        this.options = { method: 'GET', ...options };

        this._request(url, params);

        return this;
    }

    /**
     * POST запрос
     */
    public post(url: string, { ...params }: TPostParams, options?: TOptions): XmlFetch {
        const { files, data } = params;
        const reqParams: { body: string|FormData, } = {
            body: '',
        };

        this.options = { method: 'POST', ...options };

        if (files) {
            const Fdata = new FormData();

            for (const key in files) {
                files[key].forEach(file => Fdata.append(key, file));
            }

            if (data) {
                for (const key in data) {
                    Fdata.append(key, <string>data[key]);
                }
            }
            
            reqParams.body = Fdata;
        } else {
            if (data) {
                if (!this._options.headers['Content-Type'])
                    this._options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

                if (typeof data === 'string') {
                    reqParams.body = data;
                } else {
                    reqParams.body = Object.keys(data).map(key => {
                        return this._getDataBody(key, data[key]);
                    }).join('&');
                }
            }
        }

        this._request(url, reqParams);

        return this;
    }

    /**
     * PUT запрос
     */
    public put(url: string, { ...params }: TPostParams, options?: TOptions): XmlFetch {
        return this.post(url, params, { method: 'PUT', ...options });
    }

    /**
     * DELETE запрос
     */
    public del(url: string, { ...params }: TGetParams, options?: TOptions): XmlFetch {
        return this.get(url, params, { method: 'DELETE', ...options });
    }

    /**
     * Метод, содержащий callback
     * @param {function} callback функция, срабатывающая после того как запрос выполнен
     * успешно, первым аргументом которой является ответ,
     * далее можно продолжить цепочку then, возвращая значение в предыдущем.
     */
    public then(callback: TCallBackFunc): XmlFetch {
        this._callbackResponce.push(callback);

        return this;
    }

    /**
     * Метод, содержащий callback
     * @param {function} callback функция, срабатывающая после того как запрос выполнен
     * c ошибкой, первым аргументом которой является ошибка
     */
    public catch(callback: TCallBackFunc): XmlFetch {
        this._callbackError.push(callback);

        return this;
    }

    /**
     * Отменяет запрос
     */
    public abort(): XmlFetch {
        this._xhr.abort();

        return this;
    }
}

const http: IXmlFetch = {
    get(url, params, options) {
        return new XmlFetch().get(url, params, options);
    },
    post(url, params, options) {
        return new XmlFetch().post(url, params, options);
    },
    put(url, params, options) {
        return new XmlFetch().put(url, params, options);
    },
    del(url, params, options) {
        return new XmlFetch().del(url, params, options);
    }
}

export { http };
export default XmlFetch;
