import querystring from 'querystring';

class SimpleXHR {
    constructor() {
        this.method = 'GET';
        this.async = true;
        this.response = {};
        this.error = null;
        this.xhr = new XMLHttpRequest();
        this.xhr.timeout = 30000;
        this.xhr.onload = this.handleLoad(this);
        this.xhr.ontimeout = () => this.handlerError('Извините, запрос превысил максимальное время ожидания');
        this.pending = false;
        this.callbackResponce = [];
        this.callbackError = [];
    }

    /**
     * Очищает объект от свойств с пустыми массивами
     * @param object
     */
    static removeEmptyProps(object) {
        const clearObject = {};
        for (let prop in object) {
            let value = object[prop];
            if (Array.isArray(value) && value.length) {
                clearObject[prop] = value;
            }
            if ((typeof value === 'string' && value.length) || typeof value === 'number') {
                clearObject[prop] = value;
            }
        }
        return clearObject;
    }

    /**
     * Обработчик события полной загрузки на xhr
     */
    handleLoad(self) {
        let response = {};

        return function onLoad() {
            if ((this.status < 400 || this.status >= 500) && this.status !== 200) {
                self.handlerError(new Error(`${this.status} ${this.statusText}`));
                return;
            }

            response = JSON.parse(this.responseText);
            if (response.errors) {
                if (typeof response.errors === 'object') {
                    const errorsKeys = Object.keys(response.errors).length;
                    if (errorsKeys) {
                        const errors = {};
                        errorsKeys.forEach((key) => { errors[key] = response.errors[key].msg; });

                        response = errors;
                    }
                }
                self.handlerError(new Error(response.errors));
                return;
            }

            self.handlerSuccess(response);
        };
    }

    /**
     * Обрабатчик ошибок
     * @param {*} error Ошибка
     */
    handlerError(error) {
        this.pending = false;
        this.error = error;
        this.callbackError.reduce((res, fn) => {
            if (Array.isArray(res)) {
                return fn(Array.from(res));
            }

            if (typeof res === 'object') {
                return fn(Object.assign({}, res));
            }

            return fn(res);
        }, error);
    }

    /**
     * Обрабатчик успешного запроса
     * @param {*} data значение
     */
    handlerSuccess(data) {
        this.pending = false;
        this.response = data;
        this.callbackResponce.reduce((res, fn) => {
            if (Array.isArray(res)) {
                return fn(Array.from(res));
            }

            if (typeof res === 'object') {
                return fn(Object.assign({}, res));
            }

            return fn(res);
        }, data);
    }

    /**
     * Общий запрос
     * @param {string} url адрес запроса
     * @param {object} param1 параметры запроса
     */
    request(url, { query = {}, ...params }) {
        if (!this.pending) {
            this.pending = true;

            const clearQuery = SimpleXHR.removeEmptyProps(query);
            this.xhr.open(this.method, `${url}?${querystring.stringify(clearQuery)}`, this.async);
            this.xhr.send(params);
        }
    }

    /**
     * GET запрос
     * @param {string} url адрес запроса
     * @param {object} param1 параметры запроса
     *
     * @return {object} self
     */
    get(url, { ...params }) {
        this.method = 'GET';

        this.request(url, params);

        return this;
    }

    /**
     * POST запрос
     * @param {string} url адрес запроса
     * @param {object} params параметры запроса
     *
     * @return {object} self
     */
    post(url, params) {
        this.method = 'POST';

        const options = {
            body: '',
            ...params,
        };

        if (params.files) {
            const { files } = params;

            options.body = new FormData();

            Object.keys(files).forEach((key) => {
                files[key].forEach(file => options.body.append(key, file));
            });

            if (params.data) {
                const { data } = params;

                Object.keys(data).forEach(key => options.body.append(key, data[key]));
            }
        } else if (params.data) {
            const { data } = params;

            this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

            if (typeof data === 'object') {
                options.body = Object.keys(data).map((key) => {
                    if (Array.isArray(data[key])) {
                        return data[key].map(value => querystring.stringify({ [key]: value })).join('&');
                    }

                    return querystring.stringify({ [key]: data[key] });
                }).join('&');
            }

            if (typeof data === 'string') {
                options.body = data;
            }
        }
        this.request(url, options);

        return this;
    }

    /**
     * Метод, содержащий callback
     * @param {function} callback функция, срабатывающая после того как запрос выполнен успешно, первым аргументом которой является ответ,
     * далее можно продолжить цепочку then возвращая значение в предыдущем.
     *
     * @return {object} self
     */
    then(callback) {
        if (typeof callback === 'function') this.callbackResponce.push(callback);

        return this;
    }

    /**
     * Метод, содержащий callback
     * @param {function} callback функция, срабатывающая после того как запрос выполнен c ошикой, первым аргументом которой является ошибка
     *
     * @return {object} self
     */
    catch(callback) {
        if (typeof callback === 'function') this.callbackError.push(callback);

        return this;
    }

    /**
     * Отменяет запрос
     * @return {object} self
     */
    abort() {
        this.xhr.abort();

        return this;
    }
}

export default SimpleXHR;
