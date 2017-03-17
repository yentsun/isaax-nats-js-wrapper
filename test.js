const sinon = require('sinon')
const assert = require('chai').assert
const it = require('mocha').it
const describe = require('mocha').describe
const Wrapper = require('./')

const connection = {
  subscribe: function () {},
  publish: function () {},
  requestOne: function () {},
  currentServer: {url: {host: 'mock host'}}
}
const NATSrequestOne = sinon.stub(connection, 'requestOne')
const NATSsubscribe = sinon.stub(connection, 'subscribe')
const NATSpublish = sinon.stub(connection, 'publish')
const wrapper = Wrapper({connection: connection})

describe('request', function () {
  it('performs a request and returns successful result unwrapped', function (done) {
    NATSrequestOne.callsArgWith(4, JSON.stringify({id: 'ACC001'}))
    wrapper.request('account.get', {id: 'ACC001'}, function (error, account) {
      assert.isNull(error)
      assert.equal(account.id, 'ACC001')
      done()
    })
  })

  it('performs a request and returns error', function (done) {
    NATSrequestOne.callsArgWith(4, JSON.stringify({error: {message: 'account service error'}}))
    wrapper.request('account.get', {id: 'ACC001'}, function (error, response) {
      assert.equal(error.message, 'account service error')
      assert.isNotOk(response)
      done()
    })
  })

  it('performs a request and returns error from error.detail', function (done) {
    NATSrequestOne.callsArgWith(4, JSON.stringify({error: {detail: 'account service error'}}))
    wrapper.request('account.get', {id: 'ACC001'}, function (error, response) {
      assert.equal(error.message, 'account service error')
      assert.isNotOk(response)
      done()
    })
  })

  it('performs a request and returns timeout error', function (done) {
    NATSrequestOne.callsArgWith(4, {code: 'REQ_TIMEOUT'})
    wrapper.request('account.get', {id: 'ACC001'}, function (error, response) {
      assert.equal(error.message, 'response timeout')
      assert.isNotOk(response)
      done()
    })
  })
})

describe('subscribe', function () {
  it('performs a response-subscription to a subject', function (done) {
    NATSsubscribe.callsArgWith(1, JSON.stringify({data: {one: 'two'}}), null, 'test.event.happened')
    wrapper.subscribe('test.event.happened', function (message, replyTo, subject) {
      assert.equal(message.data.one, 'two')
      assert.isNull(replyTo)
      assert.equal(subject, 'test.event.happened')
      done()
    })
  })
})

describe('listen', function () {
  it('listens to point-to-point requests', function (done) {
    NATSsubscribe.callsArgWith(2, JSON.stringify({data: {one: 'two'}}), 'REPLYTO_INBOX', 'test.data.requested')
    wrapper.listen('test.data.requested', function (message, replyTo, subject) {
      assert.equal(message.data.one, 'two')
      assert.isOk(replyTo)
      assert.equal(subject, 'test.data.requested')
      done()
    })
  })
})

describe('process', function () {
  it('performs a process-subscription to a subject', function (done) {
    NATSsubscribe.callsArgWith(2, JSON.stringify({data: {one: 'two'}}), null, 'test.event.happened')
    wrapper.process('test.event.happened', function (message, subject) {
      assert.equal(message.data.one, 'two')
      assert.equal(subject, 'test.event.happened')
      done()
    })
  })
})

describe('publish', function () {
  it('performs publishing to a subject', function (done) {
    NATSpublish.callsArgWith(2, null)
    wrapper.publish('test.event.happened', {message: 'yay!'})
    assert.isTrue(NATSpublish.called)
    done()
  })
})

describe('respond', function () {
  it('responds with an error', function (done) {
    NATSpublish.callsArgWith(2, null)
    wrapper.respond('test.request', new Error('something bad happened'))
    assert.isTrue(NATSpublish.called)
    done()
  })

  it('responds normally', function (done) {
    NATSpublish.callsArgWith(2, null)
    wrapper.respond('test.request', null, {response: 'ok'})
    assert.isTrue(NATSpublish.called)
    done()
  })
})
