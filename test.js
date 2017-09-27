const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const Wrapper = require('./');


const wrapper = new Wrapper({url: 'nats://localhost:4222', group: 'tests', requestTimeout: 100}); // a nats server should be running
let nats;
wrapper.on('error', () => {
    process.exit(1);
});

describe('wrapper', () => {

    before((done) => {
        wrapper.on('connect', () => {
            nats = wrapper._nats;
            done();
        });
    });

    describe('request', () => {

        before((done) => {
            wrapper.listen('request.ok', (message, respond) => {
                respond(null, message);
            });
            wrapper.listen('request.password', (message, respond) => {
                respond(null, message);
            });
            wrapper.listen('request.error', (message, respond) => {
                respond(new Error('service error'));
            });
            wrapper.listen('request.empty', (message, respond) => {
                respond(null, null);
            });
            wrapper.listen('request.error.detail', (message, respond) => {
                respond({detail: 'service error'}, null);
            });
            done();
        });

        it('performs a request and returns successful result', (done) => {
            wrapper.request('request.ok', {foo: 'bar'}, (error, response) => {
                assert.isNull(error);
                assert.equal(response.foo, 'bar');
                done();
            })
        });

        it('performs a request and screens password field in logs', (done) => {
            wrapper.request('request.password', {password: 'should not see this'}, (error, response) => {
                assert.isNull(error);
                assert.equal(response.password, 'should not see this');
                done()
            })
        });

        it('performs a request and returns error', (done) => {
            wrapper.request('request.error', {foo: 'bar'}, (error, response) => {
                assert.equal(error.message, 'service error');
                assert.isNotOk(response);
                done()
            })
        });

        it('performs a request and returns an empty response', (done) => {
            wrapper.request('request.empty', {foo: 'bar'}, (error, response) => {
                assert.isNull(error);
                assert.isNull(response);
                done()
            })
        });

        it('performs a request and returns error from error.detail', (done) => {
            wrapper.request('request.error.detail', {foo: 'bar'}, (error, response) => {
                assert.equal(error.message, 'service error');
                assert.isNotOk(response);
                done()
            })
        });

        it('performs a request and returns timeout error', (done) => {
            wrapper.request('request.timeout', {foo: 'bar'}, (error, response) => {
                assert.equal(error.message, 'response timeout');
                assert.isNotOk(response);
                done()
            })
        }).timeout(110);
    });

    describe('subscribe', () => {
        it('performs a response-subscription to a subject', (done) => {
            wrapper.subscribe('broadcast', (message, replyTo, subject) => {
                assert.equal(message.foo, 'bar');
                assert.isNotOk(replyTo);
                assert.equal(subject, 'broadcast');
                done()
            });
            wrapper.publish('broadcast', {foo: 'bar'});
        })
    });

    describe('listen', () => {
        it('listens to requests', (done) => {
            wrapper.listen('request.listen', (message, respond) => {
                assert.equal(message.foo, 'bar');
                respond(null, {bar: 'foo'});
            });
            wrapper.request('request.listen', {foo: 'bar'}, (error, response) => {
                assert.isNull(error);
                assert.equal(response.bar, 'foo');
                done();
            });
        })
    });

    describe('process', () => {
        it('process a queue message as group member', (done) => {
            wrapper.process('process', (message, subject) => {
                assert.equal(message.foo, 'bar');
                assert.equal(subject, 'process');
                done()
            });
            wrapper.publish('process', {foo: 'bar'});
        })
    });

    describe('publish', () => {
        it('publishes a message to a subject', (done) => {
            wrapper.process('publish', (message) => {
                assert.equal(message.message, 'yay!');
                done();
            });
            wrapper.publish('publish', {message: 'yay!'});
        });
    });

    describe('unsubscribe', () => {
        it('unsubscribes from NATS subject', () => {
            const sid = wrapper.subscribe('subscribe', ()=>{});
            wrapper.unsubscribe(sid);
            wrapper._nats.on('unsubscribe', (subId, subject) => {
                assert.equal(subId, sid);
                assert.equal(subject, 'unsubscribe');
                done();
            });
        })
    });

    describe('close', () => {
        it('closes underlying connection with NATS', (done) => {
            wrapper.close();
            assert.isTrue(wrapper._nats.closed);
            done();
        })
    });

});
