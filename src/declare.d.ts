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

/** Параметры запроса */
declare type TRequestParams = {
    files?: { [x: string]: Blob[] },
    data?: { [x: string]: []|string }
}

/** Callback функция */
declare type TCallBackFunc = (data?: any) => any

declare interface IXmlFetch {
    get(url: string, { ...params }: object, options?: TOptions): XmlFetch;
    post(url: string, { ...params }: TRequestParams, options?: TOptions): XmlFetch;
    put(url: string, { ...params }: TRequestParams, options?: TOptions): XmlFetch;
    del(url: string, { ...params }: object, options?: TOptions): XmlFetch;
}

declare class XmlFetch {}
