NATS Wrapper for JavaScript
===========================

A wrapper over [node-nats](https://github.com/nats-io/node-nats), designed
to meet the needs of ISAAX project.

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


Installation
------------

```
npm install xshellinc/isaax-nats-js-wrapper#v1.3.0 --save
```

Usage
-----

Publish a request and get a response in callback:

```ecmascript 6
nats.request('some.package', {type: 'ordinary'}, (error, package) => {
    console.log(error, package)
});
```
_Note: this method uses `requestOne` inside, no deed to worry about max responses_ 


Subscribe and respond to a request:

```ecmascript 6
nats.listen('some.request', ({id}, respond) => {
    someModule.fetch(id, (error, pack) => {
        respond(error, pack);
    });
});
```

Publish an event:

```ecmascript 6
nats.publish('some.package.sent', pack);
```

Subscribe and process as worker queue:

```ecmascript 6
 nats.process('*.package.sent', (pack, subject) => {
    console.log(subject, pack);
});
```

Close NATS connection:

```ecmascript 6
nats.close();
```
