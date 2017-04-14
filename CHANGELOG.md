[1.3.4] - 2017-04-14
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