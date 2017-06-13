var Mesh2 = require('happner-2');

var config = {
  name: 'test_c6',
  happn: {
    transport: {
      mode: 'https'
    },
    port: 3111,
  },
  endpoints: {},
  components: {
    data: {}
  }
};

Mesh2.create(config, function (err) {

  if (err) {
    console.log(err);
    process.exit(err.code || 1);
    return;
  }

  console.log('READY');
});
