describe('e9_session_management', function () {

  var expect = require('expect.js');
  var Mesh = require('happner');
  var Mesh2 = require('happner-2');

  var serviceInstance;
  var clientInstance = new Mesh.MeshClient({secure: true, port: 11111});

  var disconnectClient = function(client, cb){

    if (typeof client === 'function'){
      cb = client;
      client = null;
    }

    if (!client) client = clientInstance;

    if (client) {
      client.disconnect(cb);
    } else cb();
  };

  var stopService = function(callback){
    if (serviceInstance)
      serviceInstance.stop(callback);
    else
      callback();
  };

  after('disconnects the client and stops the server', function(callback){

    this.timeout(3000);

    disconnectClient();
    setTimeout(function(){
      stopService(callback);
    }, 1000);

  });

  var getService = function(activateSessionManagement, logSessionActivity, callback, port){

    if (typeof activateSessionManagement == 'function'){
      callback = activateSessionManagement;
      activateSessionManagement = true;
      logSessionActivity = true;
    }

    if (typeof logSessionActivity == 'function'){
      callback = logSessionActivity;
      activateSessionManagement = true;
      logSessionActivity = true;
    }

    disconnectClient();

    setTimeout(function(){

      stopService(function(e){

        if (e) return callback(e);

        if (!port) port = 11111;

        var config = {
          secure:true,
          happn:{
            adminPassword:'happn',
            port: port,
            activateSessionManagement:activateSessionManagement,
            logSessionActivity:logSessionActivity
          }
        };

        Mesh2.create(config, function (err, instance) {

          serviceInstance = instance;

          if (err) return callback(err);

          clientInstance = new Mesh.MeshClient({secure: true, port: port});

          clientInstance
            .login({username: '_ADMIN', password: 'happn'})
            .then(function(){
              setTimeout(callback, 1000)
            })
            .catch(callback);

        });
      });

    }, 1000);
  };

  it('tests active sessions and session activity logging on a secure instance', function (callback) {

    this.timeout(6000);

    getService(function(e){

      if (e) return callback(e);

      clientInstance.exchange.security.listActiveSessions(function(e, list){

        if (e) return callback(e);
        expect(list.length <= 2).to.be(true);

        setTimeout(function(){

          clientInstance.exchange.security.listSessionActivity(function(e, list){

            if (e) return callback(e);
            expect(list.length <= 2).to.be(true);

            callback();

          });

        }, 1000);
      });
    });
  });

  it('tests session revocation on a secure instance', function (callback) {

    this.timeout(15000);

    getService(true, true, function(e){

      if (e) return callback(e);

      clientInstance.exchange.security.listActiveSessions(function(e, list){

        if (e) return callback(e);
        expect(list.length).to.be(2);

        clientInstance.exchange.security.listSessionActivity(function(e, list){

          if (e) return callback(e);
          expect(list.length <= 2).to.be(true);

          var newInstance = new Mesh.MeshClient({secure: true, port: 11112});

          newInstance

            .login({username: '_ADMIN', password: 'happn'})
            .then(function(){

              clientInstance.exchange.security.listActiveSessions(function(e, list){

                if (e) return callback(e);
                expect(list.length <= 3).to.be(true);
                expect(newInstance.data.pubsub.readyState).to.be(3);

                clientInstance.exchange.security.revokeToken(newInstance.data.session.token, 'APP', function(e){

                  if (e) return callback(e);

                  setTimeout(function(){
                    clientInstance.exchange.security.listRevokedTokens(function(e, items){
                      expect(items.length).to.be(1);
                      expect(newInstance.data.pubsub.readyState).to.be(2);
                      callback();
                    });
                  }, 2000);
                });
              });
            })
            .catch(callback);
        });
      });
    },11112);
  });

  it('tests switching on active sessions but not session activity logging on a secure instance', function (callback) {

    this.timeout(10000);

    getService(false, false, function(e){

      if (e) return callback(e);

      clientInstance.exchange.security.listActiveSessions(function(e, list){

        expect(e.toString()).to.be('Error: session management not activated');

        clientInstance.exchange.security.listSessionActivity(function(e, list){

          expect(e.toString()).to.be('Error: session activity logging not activated');

          clientInstance.exchange.security.activateSessionManagement(function(e){

            if (e) return callback(e);

            setTimeout(function(){

              clientInstance.exchange.security.listActiveSessions(function(e, list){

                if (e) return callback(e);

                expect(list.length <= 2).to.be(true);

                clientInstance.exchange.security.listSessionActivity(function(e, list){
                  expect(e.toString()).to.be('Error: session activity logging not activated');
                  callback();
                });
              });

            }, 1000);
          });
        });
      });
    }, 11113);
  });

  it('tests switching on active sessions and session activity logging on a secure instance', function (callback) {

    this.timeout(6000);

    getService(false, false, function(e){

      if (e) return callback(e);

      clientInstance.exchange.security.listActiveSessions(function(e, list){

        expect(e.toString()).to.be('Error: session management not activated');

        clientInstance.exchange.security.listSessionActivity(function(e, list){

          expect(e.toString()).to.be('Error: session activity logging not activated');

          clientInstance.exchange.security.activateSessionManagement(true, function(e){

            if (e) return callback(e);

            clientInstance.exchange.security.listActiveSessions(function(e, list){

              if (e) return callback(e);
              expect(list.length <= 2).to.be(true);

              clientInstance.exchange.security.listSessionActivity(function(e, list){

                if (e) return callback(e);
                expect(list.length <= 2).to.be(true);

                callback();

              });
            });
          });
        });
      });
    }, 11114);
  });

  it('tests switching on active sessions and session activity logging on a secure instance, then switching them off', function (callback) {

    this.timeout(6000);

    getService(false, false, function(e){

      if (e) return callback(e);

      clientInstance.exchange.security.listActiveSessions(function(e, list){

        expect(e.toString()).to.be('Error: session management not activated');

        clientInstance.exchange.security.listSessionActivity(function(e, list){

          expect(e.toString()).to.be('Error: session activity logging not activated');

          clientInstance.exchange.security.activateSessionManagement(true, function(e){

            if (e) return callback(e);

            clientInstance.exchange.security.listActiveSessions(function(e, list){

              if (e) return callback(e);
              expect(list.length <= 2).to.be(true);

              clientInstance.exchange.security.listSessionActivity(function(e, list){

                if (e) return callback(e);
                expect(list.length <= 2).to.be(true);

                clientInstance.exchange.security.deactivateSessionManagement(true, function(e){

                  if (e) return callback(e);

                  clientInstance.exchange.security.listActiveSessions(function(e, list){

                    expect(e.toString()).to.be('Error: session management not activated');

                    clientInstance.exchange.security.listSessionActivity(function(e, list){

                      expect(e.toString()).to.be('Error: session activity logging not activated');

                      callback();

                    });
                  });
                });
              });
            });
          });
        });
      });
    }, 11115);
  });

  it('tests switching on active sessions and session activity logging on a secure instance, then switching off activity logging', function (callback) {
    this.timeout(6000);

    getService(false, false, function(e){

      if (e) return callback(e);

      clientInstance.exchange.security.listActiveSessions(function(e){

        expect(e.toString()).to.be('Error: session management not activated');

        clientInstance.exchange.security.listSessionActivity(function(e){

          expect(e.toString()).to.be('Error: session activity logging not activated');

          clientInstance.exchange.security.activateSessionManagement(true, function(e){

            if (e) return callback(e);

            clientInstance.exchange.security.listActiveSessions(function(e, list){

              if (e) return callback(e);

              expect(list.length <= 2).to.be(true);

              clientInstance.exchange.security.listSessionActivity(function(e, list){

                if (e) return callback(e);

                expect(list.length <= 2).to.be(true);

                clientInstance.exchange.security.deactivateSessionActivity(true, function(e){

                  if (e) return callback(e);

                  clientInstance.exchange.security.listActiveSessions(function(e, list){

                    if (e) return callback(e);

                    expect(list.length <= 2).to.be(true);

                    clientInstance.exchange.security.listSessionActivity(function(e, list){

                      expect(e.toString()).to.be('Error: session activity logging not activated');

                      callback();

                    });
                  });
                });
              });
            });
          });
        });
      });
    }, 11116);
  });

});
