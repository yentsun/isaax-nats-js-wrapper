NATS Wrapper for JavaScript
===========================

A wrapper over [node-nats](https://github.com/nats-io/node-nats), designed
to meet the needs of ISAAX project.


Installation
------------

```
npm install xshellinc/isaax-nats-js-wrapper#v2.0.0 --save
```

Usage
-----

Create an instance of the wrapper:

```ecmascript 6
import NATSWrapper from 'isaax-nats-js-wrapper';

const nats = NATSWrapper({group: 'some-service'});
 nats.on('connect', () => {
     // wrapper is ready at this point
 });
 nats.on('error', () => {
     process.exit(1); // error message will be logged before exiting
 });
```


Publish a request and get a response in callback:

```ecmascript 6
nats.request('some.package', {type: 'ordinary'}, (error, package) => {
    console.log(error, package)
});
```
_Note: this method uses `requestOne` inside, no need to worry about max responses_ 


Subscribe and respond to a request:

```ecmascript 6
nats.listen('some.request', ({id}, respond) => {
    someModule.fetch(id, (error, pack) => {
        respond(error, pack);
    });
});
```

_Note: a listener is automatically added to queue group `some.request.listeners`_


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

`listen`, `subscribe` and `process` methods return an integer subscription ID (SID) which can be used to unsubscribe from a subject:

```ecmascript 6
const sid = nats.process('*.package.sent', (pack, subject) => {
    console.log(subject, pack);
});

// ...

nats.unsubscribe(sid);
```

Close NATS connection (if needed):

```ecmascript 6
nats.close();
```
