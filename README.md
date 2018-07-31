# xml-fetch
## XMLHttpRequest as fetch

> This module using es6 syntax.

You need use **_babel_** for transplant this code in you project.

* supports abording
* promise interface
* get, post, delete, put

## Installation

```bash
npm install --save xml-fetch
```

## Usage
### 'simple get'
> Methods in 'http', return new instance xml-fetch
```js
import { http } from 'libs/xml-fetch';

const API_URL = 'https://you-api.com';
const method = 'you-method';
const query = { param1: 'param1', param2: 'param2' };

http.get(`${API_URL}/${method}/`}, { query })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```
---
```js
import xmlFetch from 'libs/xml-fetch';

xmlFetch.get(`${API_URL}/${method}/`}, { query })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### 'simple post'
```js
http.post(`${API_URL}/${method}/`}, { data })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### Aborting
```js
let request = http.get(`${API_URL}/${method}/`}, { query })
    .then(response => console.log(response))
    .catch(error => console.log(error));

request.abort();
```