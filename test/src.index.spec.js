'use strict'

const bodyParser = require('body-parser')
const chai = require('chai')
const connect = require('connect')
const got = require('got')

require('promise-prototype-finally')

chai.should()

const createProxy = require('..')

const INTERNAL_SERVER_ERROR = 500
const NOT_FOUND = 404

describe('Proxy', function () {
  it('should proxy a request', function () {
    const testServer = connect()
      .use(bodyParser.json())
      .use(function (req, res) {
        res.end(JSON.stringify({
          method: req.method,
          path: req.url,
          req: req.body
        }))
      })
      .listen()

    const testProxy = createProxy({
      target: `http://localhost:${testServer.address().port}`
    })

    const reqBody = { key: 'value' }

    return got(`http://localhost:${testProxy.address().port}/path`, {
      body: reqBody,
      json: true,
      timeout: 500
    })
      .then(function (res) {
        res.body.should.deep.equal({
          method: 'POST',
          path: '/path',
          req: Object.assign({}, reqBody)
        })
      })
      .finally(function () {
        testProxy.close()
      })
      .finally(function () {
        testServer.close()
      })
  })

  it('should modify request and responses', function () {
    const testServer = connect()
      .use(bodyParser.json())
      .use(function (req, res) {
        res.end(JSON.stringify({ req: req.body }))
      })
      .listen()

    const reqUpd = { reqKey: 'reqValue' }
    const resUpd = { resKey: 'reqValue' }

    const testProxy = createProxy({
      target: `http://localhost:${testServer.address().port}`,
      onReq (req) {
        return Object.assign(req, { body: Object.assign({}, req.body, reqUpd) })
      },
      onRes (body) {
        return Object.assign({}, body, resUpd)
      }
    })

    const reqBody = { key: 'value' }

    return got(`http://localhost:${testProxy.address().port}`, {
      body: reqBody,
      json: true,
      timeout: 500
    })
      .then(function (res) {
        res.body.should.deep.equal(Object.assign(
          { req: Object.assign({}, reqBody, reqUpd) },
          resUpd
        ))
      })
      .finally(function () {
        testProxy.close()
      })
      .finally(function () {
        testServer.close()
      })
  })

  it('should proxy returned errors', function () {
    const testServer = connect()
      .use(bodyParser.json())
      .use(function (req, res) {
        res.statusCode = NOT_FOUND
        res.end('{}')
      })
      .listen()

    const testProxy = createProxy({
      target: `http://localhost:${testServer.address().port}`
    })

    return got(`http://localhost:${testProxy.address().port}`, {
      throwHttpErrors: false
    })
      .then(function (res) {
        res.statusCode.should.equal(NOT_FOUND)
      })
      .finally(function () {
        testProxy.close()
      })
      .finally(function () {
        testServer.close()
      })
  })

  it('should return error if fail to request the server', function (done) {
    const testServer = connect().listen()

    const testProxy = createProxy({
      target: `http://localhost:${testServer.address().port}`
    })

    testServer.close(function () {
      got(`http://localhost:${testProxy.address().port}`, {
        throwHttpErrors: false,
        timeout: 500
      })
        .then(function (res) {
          res.statusCode.should.equal(INTERNAL_SERVER_ERROR)
          done()
        })
        .catch(done)
        .finally(function () {
          testProxy.close()
        })
    })
  })
})
