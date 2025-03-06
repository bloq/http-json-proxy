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
    demandOption: true,
    describe: 'the proxied API server URL',
    type: 'string'
  })
  .options('pretty-print', {
    describe: 'pretty print the JSON objects'
  })
  .help()
  .parse()

const { port, prettyPrint, target } = argv

const formatJson = object =>
  colorize(prettyPrint ? JSON.stringify(object, null, 2) : object)

const proxy = createProxy({
  onErr(err) {
    console.warn('<-- ERROR', err.message)
    return err
  },
  onReq(req) {
    console.log('-->', req.method, req.url, formatJson(req.body))
    return req
  },
  onRes(body) {
    console.log('<--', formatJson(body))
    return body
  },
  port,
  target
})

proxy.on('listening', function () {
  console.log(`Proxy for ${target} listening on port ${proxy.address().port}`)
})
