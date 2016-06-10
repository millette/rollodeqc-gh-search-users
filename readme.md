# rollodeqc-gh-search-users
[![Build Status](https://travis-ci.org/millette/rollodeqc-gh-search-users.svg?branch=master)](https://travis-ci.org/millette/rollodeqc-gh-search-users)
[![Coverage Status](https://coveralls.io/repos/github/millette/rollodeqc-gh-search-users/badge.svg?branch=master)](https://coveralls.io/github/millette/rollodeqc-gh-search-users?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/millette/rollodeqc-gh-search-users.svg)](https://gemnasium.com/github.com/millette/rollodeqc-gh-search-users)

> RollodeQc module to search GitHub users.

## Install
```
$ npm install --save rollodeqc-gh-search-users
```

## Usage
```js
const ghSearchUsers = require('rollodeqc-gh-search-users')

ghSearchUsers('unicorns').then((result) => {
  console.log(JSON.stringify(result, null, ' '))
})
//=> {
  "total_count": 48,
  "incomplete_results": false,
  "items": [
    {
      "login": "DirtyUnicorns",
      "id": 10095278,
      "type": "Organization",
      "site_admin": false,
      "score": 29.105461
    },
    // ...
    {
      "login": "rainbowify",
      "id": 1377335,
      "type": "User",
      "site_admin": false,
      "score": 5.071583
    }
  ],
  "headers": {
    "server": "GitHub.com",
    "date": "Fri, 01 Apr 2016 00:39:43 GMT",
    "status": "200 OK",
    "x-ratelimit-limit": 30,
    "x-ratelimit-remaining": 29,
    "x-ratelimit-reset": 1459471243,
    "timestamp": 1459471183,
    "timestampDiff": 2.92,
    "statusCode": 200
  }
}
```

## API

### ghSearchUsers(query, [token])
Search GitHub for users. Returns a promise.

#### query
Type: `string`|`object`

`string` values can represent a search query or a complete GitHub API URL
(beginning with http:// or https://).
Otherwise see the tests and source code if query is an `object`.

#### token
Type: `string`<br>
Default: `null`

GitHub token for greater rate limits.
Can be overridden globally with the `GITHUB_TOKEN` environment variable.

## Dependencies
* lodash.flow
* lodash.deburr
* lodash.flatten
* lodash.uniq
* lodash.partial
* rollodeqc-gh-utils

## License
AGPL-v3 © [Robin Millette](http://robin.millette.info)
