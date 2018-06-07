import querystring from 'querystring';
import Cookies from 'js-cookie';

/**
 * Обертка над XmlHttpRequest
 */
class SimpleXHR {
    constructor() {
        this.method = 'GET';
        this.async = true;
        this.response = {};
        this.error = null;
        this.xhr = new XMLHttpRequest();
        this.xhr.timeout = 30000;
        this.handlerLoad();
        this.pending = false;
        this.callbackResponce = [];
        this.callbackError = [];
    }

    /**
     * Метод, устанавливающий событие полной загрузки на xhr
     */
    handlerLoad() {
        const self = this;
        let response = {};

        this.xhr.onload = function onload() {
            try {
                if((this.status < 400 || this.status >= 500) && this.status !== 200) {
                    throw `${this.status} ${this.statusText}`;
                }

                response = JSON.parse(this.responseText);

                if (response.errors) {
                    if(typeof response.errors === 'string') {
                        throw response.errors;
                    }
                }

                if (response.errors) {
                    if(typeof response.errors === 'object' && Object.keys(response.errors).length > 0) {
                        const errors = {};

                        Object.keys(response.errors).map(key => {
                            errors[key] = response.errors[key].msg;
                        });

                        throw errors;
                    }
                }

                self.handlerSuccess(response);
            } catch (e) {
                self.handlerError(e);
            }
        }
    }

    /**
     * Метод, срабатывающий по истечению максимального времени жизни запроса
     */
    handlerTimeout() {
        this.xhr.ontimeout = function ontimeout() {
            try {
                throw 'Извините, запрос превысил максимальное время ожидания';
            } catch (e) {
                this.handlerError(e);
            }
        }
    }

    /**
     * Метод, обрабатывающий ошибки
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
     * Метод, обрабатывающий успешный запрос
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
     * Метод, выполняющий запрос
     * @param {string} url адрес запроса
     * @param {object} param1 параметры запроса
     */
    request(url, { query = {}, withoutToken, withoutCity, ...params }) {
        if (!this.pending) {
            this.pending = true;
            if(!withoutToken) query.auth_token = Cookies.get('auth_token');
            if(!withoutCity) query.city = Cookies.get('activeCity');

            this.xhr.open(this.method, `${url}?${querystring.stringify(query)}`, this.async);

            this.xhr.send(params);
        }
    }

    /**
     * Метод, выполняющий get запрос
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
     * Метод, выполняющий post запрос
     * @param {string} url адрес запроса
     * @param {object} param1 параметры запроса
     * 
     * @return {object} self
     */
    // TODO: Проверить метод
    post(url, { ...params }) {
        this.method = 'POST';

        const options = {
            body: '',
            ...params
        }

        if(params.files) {
            const files = params.files;

            options.body = new FormData();

            Object.keys(files).forEach(key => {
                files[key].forEach(file => options.body.append(key, file));
            });

            if(params.data) {
                const data = params.data;

                Object.keys(data).forEach(key => options.body.append(key, data[key]));
            }
        } else if(params.data) {
            const data = params.data;

            this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

            if(typeof data === 'object') {
                options.body = Object.keys(data).map(key => {
                    if(Array.isArray(data[key])) {
                        return data[key].map(value => querystring.stringify({ [key]: value })).join('&');
                    }

                    return querystring.stringify({ [key]: data[key] });
                }).join('&');
            }

            if(typeof data === 'string') {
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
     * Метод отменяющий запрос
     * @return {object} self
     */
    abort() {
        this.xhr.abort();

        return this;
    }
}

export default SimpleXHR;
