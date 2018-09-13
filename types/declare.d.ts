/** HTTP заголовки */
declare type THeaders = { [x: string]: string }

/** Опции конструктора */
declare type TOptions = {
    method?: string,
    async?: boolean,
    headers?: THeaders,
    timeout?: number,
    timeoutError?: string
}

/** Обязательные опций конструктора */
declare type TOptionsRequire = {
    method: string,
    async: boolean,
    headers: THeaders,
    timeout: number,
    timeoutError: string
}

/** Параметры запроса для POST метода */
declare type TPostParams = {
    files?: { [x: string]: Blob[] },
    data: { [x: string]: []|string }
}

/** Параметры запроса для GET метода */
declare type TGetParams = {
    query: object
}

/** Callback функция */
declare type TCallBackFunc = (data?: any) => any

interface XmlFetch extends IXmlFetch {
    then(callback: TCallBackFunc): XmlFetch;
    catch(callback: TCallBackFunc): XmlFetch;
    abort(): XmlFetch
}

declare interface IXmlFetch {
    get(url: string, params: TGetParams, options?: TOptions): XmlFetch;
    post(url: string, params: TPostParams, options?: TOptions): XmlFetch;
    put(url: string, params: TPostParams, options?: TOptions): XmlFetch;
    del(url: string, params: TGetParams, options?: TOptions): XmlFetch;
}
