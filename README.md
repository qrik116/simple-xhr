# xml-fetch
## XMLHttpRequest as fetch

* supports abording
* promise interface, but this not __Promise!!!__
* get, post, delete, put

## Installation

```bash
npm install --save-dev xml-fetch
```

## Options
```js
type TOptions = {
    method?: string, // Метод запроса
    async?: boolean, // Тип запроса
    headers?: { [x: string]: string }, // Заголовки
    timeout?: number, // Время жизни запроса
    timeoutError?: string // Текст ошибки по истечению timeout
};
```

## Usage
### "simple get"
> Methods in 'http', return new instance xml-fetch
```js
import { http } from 'xml-fetch';

const API_URL = 'https://you-api.com';
const method = 'you-method';
const query = { param1: 'param1', param2: 'param2' };

http.get(`${API_URL}/${method}/`}, { query })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```
---
```js
import XmlFetch from 'xml-fetch';

xmlFetch.get(`${API_URL}/${method}/`}, { query })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### "simple post"
```js
http.post(`${API_URL}/${method}/`}, { data })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### Other methods
```js
type TRequestParams = {
    files?: { [x: string]: [] }, // Массив файлов
    data?: { [x: string]: []|string } // Данные
};

http.get(url: string, { ...params }: object, options?: TOptions): XmlFetch;
http.post(url: string, { ...params }: TRequestParams, options?: TOptions): XmlFetch;
http.put(url: string, { ...params }: TRequestParams,  options?: TOptions): XmlFetch;
http.delete(url: string, { ...params }: object,  options?: TOptions): XmlFetch;
```

### Aborting
```js
let request = http.get(`${API_URL}/${method}/`}, { query })
    .then(response => console.log(response))
    .catch(error => console.log(error));

request.abort();
```