'use strict'

const bodyParser = require('body-parser')
const connect = require('connect')
const httpProxy = require('http-proxy')
const modifyResponse = require('node-http-proxy-json')

const identity = require('../lib/identity')

const INTERNAL_SERVER_ERROR = 500

// Default handlers
const onDefaults = {
  onErr: identity,
  onReq: identity,
  onRes: identity
}

/**
 * Creates a new proxy that starts listening on the specified port, forwarding
 * all requests to the target server.
 *
 * The proxy server accepts request, response and error handlers. Those handlers
 * can be used to inspect or even modify the data flowing through the proxy. By
 * default, all handlers are the identity function so no data is altered.
 *
 * @param {Object} options define the proxy behavior.
 * @param {number} [options.port] is the port the proxy will listen on.
 * @param {string} [options.host] is the host the proxy will listen on.
 * @param {string} options.target is the proxied API URL.
 * @param {Function} [options.onReq] will be called on each request.
 * @param {Function} [options.onRes] will be called on each response.
 * @param {Function} [options.onErr] will be called on each request error.
 * @returns {http.Server} the created HTTP server object.
 */
function createProxy (options) {
  const {
    port,
    host,
    target,
    onReq,
    onRes,
    onErr
  } = Object.assign({}, onDefaults, options)

  const proxy = httpProxy.createProxyServer({})

  proxy.on('proxyReq', function (proxyReq, req) {
    if (req.body) {
      const bodyData = JSON.stringify(req.body)
      proxyReq.setHeader('Content-Type', 'application/json')
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
      proxyReq.write(bodyData)
    }
  })

  proxy.on('proxyRes', function (proxyRes, req, res) {
    modifyResponse(res, proxyRes, body => onRes(body))
  })

  proxy.on('error', function (err, req, res) {
    res.writeHead(INTERNAL_SERVER_ERROR, { 'Content-Type': 'text/plain' })
    res.end(onErr(err).message)
  })

  return connect()
    .use(bodyParser.json())
    .use(function (req, res) {
      proxy.web(onReq(req), res, { target })
    })
    .listen(port, host)
}

module.exports = createProxy
