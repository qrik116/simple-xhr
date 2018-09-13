/// <reference path="./declare.d.ts" />
// Type definitions for xml-fetch
// Project: https://github.com/qrik116/xml-fetch
// Definitions by: Evgeniy Kozirev <https://github.com/qrik116>

declare var XmlFetch: {
    prototype: XmlFetch;
    new(options: TOptions): XmlFetch;
};

export namespace http {
    /** GET запрос */
    export function get(url: string, params: TGetParams, options?: TOptions): XmlFetch;
    /** POST запрос */
    export function post(url: string, params: TPostParams, options?: TOptions): XmlFetch;
    /** PUT запрос */
    export function put(url: string, params: TPostParams, options?: TOptions): XmlFetch;
    /** DELETE запрос */
    export function del(url: string, params: TGetParams, options?: TOptions): XmlFetch;
}

export default XmlFetch;
