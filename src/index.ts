import querystring from 'query-string';

type TOptions = {
    method?: string,
    async?: boolean
};

type TRequestParams = {
    files?: { [x: string]: [] },
    data?: { [x: string]: []|string }
};

type TCallBackFunc = (data?: any) => any;

interface IXmlFetch {
    get(url: string, { ...params }: object, customMethod?: string): XmlFetch;
    post(url: string, { ...params }: TRequestParams, customMethod?: string): XmlFetch;
    put(url: string, { ...params }: TRequestParams): XmlFetch;
    delete(url: string, { ...params }: object): XmlFetch;
};

class XmlFetch implements IXmlFetch {
    private _options: { method: string, async: boolean } = {
        method: 'GET',
        async: true
    };
    private _async: boolean = true;
    private _xhr: XMLHttpRequest = new XMLHttpRequest();
    private _pending: boolean = false;
    private _callbackResponce: Array<TCallBackFunc> = [];
    private _callbackError: Array<TCallBackFunc> = [];

    constructor(options: TOptions = {}) {
        this._options = { ...this._options, ...options };
        this._xhr.onload = this.handlerLoad(this);
    }

    get options(): TOptions {
        return this._options;
    }

    set options(options: TOptions) {
        this._options = { ...this._options, ...options };
    }

    /**
     * Установка данных в body, используя FormData
     */
    private setDataBody(options: { body: FormData, key: string }, data: string|[]): void {
        if (Array.isArray(data)) {
            data.forEach(value => options.body.append(options.key, value));
        } else {
            options.body.append(options.key, data);
        }
    }

    /**
     * Обработчик события полной загрузки на xhr
     */
    private handlerLoad(self: XmlFetch): () => any {
        let response: any = {};

        return function onload(this: XMLHttpRequest): any {
            if ((this.status < 400 || this.status >= 500) && this.status !== 200) {
                self.handlerError(new Error(`${this.status} ${this.statusText}`));
                return;
            }

            response = JSON.parse(this.responseText);

            if (response.errors) {
                if (typeof response.errors === 'object') {
                    const errorsKeys: string[] = Object.keys(response.errors);

                    if (errorsKeys.length) {
                        const errors: any = {};

                        errorsKeys.forEach(key => errors[key] = response.errors[key].msg);
                        response = errors;
                    }
                }
                self.handlerError(new Error(response.errors));
                return;
            }

            self.handlerSuccess(response);
        }
    }

    /**
     * Обрабатчик ошибок
     */
    private handlerError(error: Error): void {
        this._pending = false;
        this._callbackError.reduce((res, fn) => {
            if (Array.isArray(res)) {
                return fn([...res]);
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
    private handlerSuccess(data: any): void {
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
     * Общий запрос
     */
    private request(url: string,
        { query = {}, ...params }: { query?: object, body?: string | FormData }
    ): void {
        if (!this._pending) {
            this._pending = true;
            this._xhr.open(this._options.method, `${url}?${querystring.stringify(query)}`, this._async);
            this._xhr.send(params.body);
        }
    }

    /**
     * GET запрос
     */
    public get(url: string, { ...params }: object, customMethod?: string): XmlFetch {
        this._options.method = customMethod || 'GET';

        this.request(url, params);

        return this;
    }

    /**
     * POST запрос
     */
    public post(url: string, { ...params }: TRequestParams, customMethod?: string): XmlFetch {
        const { files, data } = params;
        const options: { body: FormData, } = {
            body: new FormData(),
        };

        this._options.method = customMethod || 'POST';
        this._xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        if (files) {
            for (const key in files) {
                files[key].forEach(file => options.body.append(key, file));
            }
        }

        if (data) {
            for (const key in data) {
                this.setDataBody({ body: options.body, key }, data[key]);
            }
        }

        this.request(url, options);

        return this;
    }

    /**
     * PUT запрос
     */
    public put(url: string, { ...params }: TRequestParams): XmlFetch {
        const method = 'PUT';

        return this.post(url, params, method);
    }

    /**
     * DELETE запрос
     */
    public delete(url: string, { ...params }: object): XmlFetch {
        const method = 'DELETE';

        return this.get(url, params, method);
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
    get(url, params) {
        return new XmlFetch().get(url, params);
    },
    post(url, params) {
        return new XmlFetch().post(url, params);
    },
    put(url, params) {
        return new XmlFetch().put(url, params);
    },
    delete(url, params) {
        return new XmlFetch().delete(url, params);
    }
}

export { http };
export default XmlFetch;