/// <reference path="../src/declare.d.ts" />
// Type definitions for xml-fetch
// Project: https://github.com/qrik116/xml-fetch
// Definitions by: Evgeniy Kozirev <https://github.com/qrik116>

export namespace http {
    /** GET запрос */
    export function get(url: string, { ...params }: object, options?: TOptions): XmlFetch;
    /** POST запрос */
    export function post(url: string, { ...params }: TRequestParams, options?: TOptions): XmlFetch;
    /** PUT запрос */
    export function put(url: string, { ...params }: TRequestParams, options?: TOptions): XmlFetch;
    /** DELETE запрос */
    export function del(url: string, { ...params }: TRequestParams, options?: TOptions): XmlFetch;
}
