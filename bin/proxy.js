#!/usr/bin/env node

'use strict'

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
  .help()
  .parse()

const { port, target } = argv

const proxy = createProxy({
  port,
  target,
  onReq (req) {
    console.log('-->', req.method, req.url, JSON.stringify(req.body))
    return req
  },
  onRes (body) {
    console.log('<--', JSON.stringify(body))
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
