var Mesh = require('happner-2');

var config = {
  name: 'test_6',
  version: '1.0.0',
  happn: {
    port: 3111,
    secure: true,
    adminPassword: 'password'
  },
  endpoints: {},
  modules: {
    component: {
      path: __dirname + '/6-testMeshComponent',
      create: {
        type: "sync",
        parameters: []
      }
    }
  },
  components: {
    data: {},
    'component': {
      moduleName: "component",
      schema: {
        "exclusive": false
      }
    }
  }
};

Mesh.create(config, function (err) {

  if (err) {
    console.log(err);
    process.exit(err.code || 1);
    return;
  }

  console.log('READY');

});