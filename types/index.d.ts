/// <reference path="./declare.d.ts" />
// Type definitions for xml-fetch
// Project: https://github.com/qrik116/xml-fetch
// Definitions by: Evgeniy Kozirev <https://github.com/qrik116>

declare class XmlFetch implements IXmlFetch {
    static options: TOptionsRequire;
    constructor(options?: TOptions);
    options: TOptions;
    /**
     * Очищает объект от свойств с пустыми значениями
     * @param object
     */
    static removeEmptyProps(object: TEmptyProps): object;
    get(url: string, { ...params }: TGetParams, options?: TOptions): XmlFetch;
    post(url: string, { ...params }: TPostParams, options?: TOptions): XmlFetch;
    put(url: string, { ...params }: TPostParams, options?: TOptions): XmlFetch;
    del(url: string, { ...params }: TGetParams, options?: TOptions): XmlFetch;
    /**
     * Метод, содержащий callback
     * @param {function} callback функция, срабатывающая после того как запрос выполнен
     * успешно, первым аргументом которой является ответ,
     * далее можно продолжить цепочку then, возвращая значение в предыдущем.
     */
    then(callback: TCallBackFunc): XmlFetch;
    /**
     * Метод, содержащий callback
     * @param {function} callback функция, срабатывающая после того как запрос выполнен
     * c ошибкой, первым аргументом которой является ошибка
     */
    catch(callback: TCallBackFunc): XmlFetch;
    /** Отменяет запрос */
    abort(): XmlFetch;
}

declare const http: IXmlFetch;
export { http };
export default XmlFetch;
