const sinon = require('sinon')
const assert = require('chai').assert
const Wrapper = require('./')

const connection = {requestOne: function () {}, currentServer:{url: {host: 'mock host'}}}
const NATSrequestOne = sinon.stub(connection, 'requestOne')
const wrapper = Wrapper({connection: connection})

describe('request', function () {

    it('performs a request and returns successful result', function (done) {
        NATSrequestOne.callsArgWith(4, JSON.stringify({error: null, account: {id: 'ACC001'}}))
        wrapper.request('account.get', {id: 'ACC001'}, function (error, response) {
            assert.isNull(error)
            assert.equal(response.account.id, 'ACC001')
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

    it('performs a request and returns timeout error', function (done) {
        NATSrequestOne.callsArgWith(4, {code: 'REQ_TIMEOUT'})
        wrapper.request('account.get', {id: 'ACC001'}, function (error, response) {
            assert.equal(error.message, 'response timeout')
            assert.isNotOk(response)
            done()
        })
    })

})
