#!/usr/bin/env node

'use strict'

const colorize = require('json-colorizer')
const yargs = require('yargs')

const createProxy = require('..')

const argv = yargs
  .version()
  .usage('Start a HTTP JSON proxy server.')
  .options('port', {
    alias: 'p',
    describe: 'the port the server should listen to',
    type: 'number'
  })
  .options('target', {
    alias: 't',
    describe: 'the proxied API server URL',
    demandOption: true,
    type: 'string'
  })
  .options('pretty-print', {
    describe: 'pretty print the JSON objects'
  })
  .help()
  .parse()

const { port, target, prettyPrint } = argv

const formatJson = object =>
  colorize(prettyPrint ? JSON.stringify(object, null, 2) : object)

const proxy = createProxy({
  port,
  target,
  onReq (req) {
    console.log('-->', req.method, req.url, formatJson(req.body))
    return req
  },
  onRes (body) {
    console.log('<--', formatJson(body))
    return body
  },
  onErr (err) {
    console.warn('<-- ERROR', err.message)
    return err
  }
})

proxy.on('listening', function () {
  console.log(`Proxy for ${target} listening on port ${proxy.address().port}`)
})
