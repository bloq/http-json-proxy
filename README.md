# http-json-proxy

[![Build Status](https://travis-ci.org/bloq/http-json-proxy.svg?branch=master)](https://travis-ci.org/bloq/http-json-proxy)
[![bitHound Overall Score](https://www.bithound.io/github/bloq/http-json-proxy/badges/score.svg)](https://www.bithound.io/github/bloq/http-json-proxy)
[![bitHound Dependencies](https://www.bithound.io/github/bloq/http-json-proxy/badges/dependencies.svg)](https://www.bithound.io/github/bloq/http-json-proxy/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/bloq/http-json-proxy/badges/code.svg)](https://www.bithound.io/github/bloq/http-json-proxy)

Simple HTTP JSON proxy.

This proxy can be used as a middleman in between a HTTP JSON API server and a client to monitor the requests, responses and even modify on the fly any of those.

## Installation

```bash
$ npm install --global http-json-proxy
```

## Usage

The following command will spin up a proxy server that will forward all requests to a locally installed Ethereum node and will log to console each JSON RPC call with the corresponding response:

```
$ http-json-proxy -p 18545 -t http://localhost:8545
Proxy for http://localhost:8545 listening on port 18545
```

Then, each call will be logged as follows:

```
--> POST / {"jsonrpc":"2.0","id":3,"method":"eth_gasPrice","params":[]}
<-- {"jsonrpc":"2.0","result":"0x2e90edd000","id":3}
```

### Options

```
$ http-json-proxy
Start a HTTP JSON proxy server.

Options:
  --version     Show version number                                    [boolean]
  --port, -p    the port the server should listen to                    [number]
  --target, -t  the proxied API server URL                   [string] [required]
  --help        Show help                                              [boolean]
```

## API

The module can also be used programmatically as follows:

```js
const createProxy = require('http-json-proxy')

const options = {
  port: 18545,
  target: 'http://localhost:8545',
  onReq: function (req) {
    console.log('-->', req.method, req.url, JSON.stringify(req.body))
    return req
  },
  onRes: function (body) {
    console.log('<--', JSON.stringify(body))
    return body
  }
}

const proxy = createProxy(options)
```

### `createProxy(options)`

Creates a new proxy that starts listening on the specified port, forwarding all requests to the target server. It returns an [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) instance.

#### `options.port`

Is the port the proxy will listen on. If not specified, the proxy will start listening to a random unused port.

#### `options.host`

Is the host the proxy will listen on. If not specified, the proxy will listen in all interfaces.

#### `options.target`

Is the proxied API server URL.

#### `options.onReq`

Will be called on each request with the `req` object that will be forwarded to the target server and shall return that `req`. Any of the properties of the `req` object can be altered to modify the actual request that is sent to the target server. Defaults to the identity function.

#### `options.onRes`

Will be called on each response with the `body` of the response and shall return the actual `body` to be provided to the client. It can be altered to provide a different response too. Defaults to the identity function.

#### `options.onErr`

Will be called on each request error with the corresponding `err` object and shall return the same, altered or different `err` object that will be returned to the client along with a 500 status code. Defaults to the identity function.

## License

MIT
