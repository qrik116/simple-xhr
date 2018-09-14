/// <reference path="./declare.d.ts" />
// Type definitions for xml-fetch
// Project: https://github.com/qrik116/xml-fetch
// Definitions by: Evgeniy Kozirev <https://github.com/qrik116>

declare class XmlFetch implements IXmlFetch {
    static options: TOptionsRequire;
    constructor(options?: TOptions);
    options: TOptions;
    static removeEmptyProps(object: TEmptyProps): TEmptyProps;
    get(url: string, { ...params }: TGetParams, options?: TOptions): XmlFetch;
    post(url: string, { ...params }: TPostParams, options?: TOptions): XmlFetch;
    put(url: string, { ...params }: TPostParams, options?: TOptions): XmlFetch;
    del(url: string, { ...params }: TGetParams, options?: TOptions): XmlFetch;
    then(callback: TCallBackFunc): XmlFetch;
    catch(callback: TCallBackFunc): XmlFetch;
    abort(): XmlFetch;
}

declare const http: IXmlFetch;
export { http };
export default XmlFetch;
