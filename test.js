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

})
