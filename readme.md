happner-2-backward-compatability
--------------------------------
*we took all the tests for happner v1.28.4 latest, and converted them into a suite of tests that created all parent/remote meshes as happner-2 instances, and all child meshes/happner clients as happner 1 instances or clients, the tests can be run with every new release of happner-2 or happner as they are bot latest in the package.json*

HAPPNER-2 SERVERS ARE ABOUT 99.50% COMPATIBLE WITH HAPPNER 1 MESHES OR CLIENTS.

ONLY 1 BREAKING CHANGE:

```javascript

//errors come back in the format {name:'[Error name]', message: [Error message]}
//instead of {name: '[Error name]: [Error message]'}, ie:

//old
{
  "name":"AccessDenied: unauthorized"
}
//new
{
  "name":"AccessDenied",
  "message":"unauthorized"
}
```

*this is linked to a change in the [happn protocol](https://github.com/happner/happn-protocol)*

