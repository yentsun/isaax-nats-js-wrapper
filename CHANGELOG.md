[2.1.0]
-------
- [x] ADDED one-time subscription fix #14


[2.0.2] - 2017-09-28
--------------------
- [x] UPDATED TS bindings to match js implementation
- [x] FIXED some typos


[2.0.0] - 2017-09-15
--------------------
- [x] ADDED ids to request/response
- [x] ADDED `connected` event handling fix #13
- [x] CHANGE sinon mocks to live NATS connection @ tests
- [x] REMOVED js standard


[1.6.0] - 2017-08-02
--------------------
- [x] ADDED password screening fix #12


[1.5.4] - 2017-07-03
--------------------
- [x] ADDED more info @ error response logging


[1.5.3] - 2017-05-21
--------------------
- [x] ADDED `unsubscribe` method
- [x] ADDED more info @ error response logging


[1.5.2] - 2017-05-17
--------------------
- [x] ADDED error.stack to error response log entry


[1.5.1] - 2017-05-13
--------------------
- [x] ADDED option to override default logger


[1.5.0] - 2017-05-10
--------------------
- [x] ADDED `group` parameter to queue subscriptions


[1.4.0] - 2017-04-15
--------------------
- [x] CHANGED `response` behavior to always return JSON array with error as first element and message as the second fix #9


[1.3.4] - 2017-04-14
--------------------
- [x] ADDED `close` method which closes underlying NATS connection
- [x] ADDED Typescript definitions


[1.3.3] - 2017-04-04
--------------------
- [x] FIXED empty response handling


[1.3.2] - 2017-04-04
--------------------
- [x] FIXED options loading


[1.3.1] - 2017-03-17
--------------------
- [x] FIXED error serialization


[1.3.0] - 2017-03-17
--------------------
- [x] ADDED `respond` function as part of returned params from `listen`


[1.2.0] - 2017-03-17
--------------------
- [x] ADDED `listen` method to subscribe to point-to-point requests fix #5
- [x] Standard JS polish


[1.1.0] - 2017-03-15
--------------------
- [x] ADDED readme
- [x] ADDED `respond` method fix #4
- [x] ADDED `process` method to subscribe to a queue group fix #4
- [x] REMOVE `options` argument from `subscribe` #4


[1.0.0] - 2017-03-12
--------------------
- [x] CHANGED request response to return unwrapped object fix #3


[0.2.2] - 2017-03-08
--------------------
- [x] CHANGED request logging from verbs to arrows


[0.2.1] - 2017-03-03
--------------------
- [x] CHANGED default log level to `debug`


[0.2.0] - 2017-03-01
--------------------
- [x] ADDED `error.detail` (pg) support


[0.1.2] - 2017-02-28
--------------------
- [x] ADDED default options fix #2


[0.1.1] - 2017-02-28
--------------------
- [x] CHANGED initial response timeout to 1000


[0.1.0] - 2017-02-28
--------------------
- [x] ADDED `request` method #1
- [x] ADDED `publish` method #1
- [x] ADDED `subscribe` method #1