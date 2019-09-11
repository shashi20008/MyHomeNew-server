'use strict';
const uuid = require('uuid/v4');
const WebsocketServer = require('websocket').server;
const _get = require('lodash/get');
const EventEmitter = require('events');
const UserModel = require('../models/users');
const JSON_TYPE = 'application/json';

const emitter = new EventEmitter();

module.exports.proxy = function(req, res) {
  const hubClientId = _get(req, 'user.hubClientId');

  if(emitter.listenerCount(hubClientId) === 0) {
    // We should at least retry once in a second or so!!
    return res.status(503).end(); // Server is unavailable.
  }

  emitter.emit(hubClientId, {
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    type: req.get('content-type'),
    cb: resp => {
      const respPayload = typeof resp.body !== 'string' ? JSON.stringify(resp.body) : resp.body; 
      res.status(resp.status || 200).type(req.type || JSON_TYPE).end(respPayload);
    }
  });
};

module.exports.onHubConnect = function(connection, user) {
  const hubClientId = user.hubClientId;

  if(emitter.listenerCount(hubClientId) > 0) {
    console.error('already have a hub attached for account');
    return connection.close();
  }

  function onRequest(reqData) {
    const { cb } = reqData;
    const reqId = uuid();
    reqData = {
      ...reqData, 
      reqId,
      cb: undefined
    };
    connection.on('message', function onResponse(message) {
      try {
        const payload = JSON.parse(message.utf8Data);
        if(payload.reqId !== reqId) {
          return; // This message is not for us. Ignore.
        }
        
        cb(payload);
        connection.removeListener(message, onResponse);
      } catch(e) {
        console.error('could not parse message', message.utf8Data);
      }
    });

    connection.send(JSON.stringify(reqData));
  }

  emitter.on(hubClientId, onRequest);

  // Clean up on websocket close.
  connection.on('close', function() {
    emitter.removeListener(hubClientId, onRequest);
  });
}

module.exports.startWSServer = httpServer => {
  const wsServer = new WebsocketServer({
    httpServer,
    autoAcceptConnections: false
  });

  wsServer.on('request', function(request) {
    const auth = _get(request, 'httpRequest.headers.authorization', '');
    const [hubClientId, hubClientSecret] = auth.split(':');
    if(!hubClientId || !hubClientSecret) {
      console.error('either id or secret missing in hub WS Req');
      return request.reject();
    }

    UserModel.findOne({hubClientId, hubClientSecret})
      .then(user => {
        if(!user) {
          throw new Error('User not found');
        }
        const connection = request.accept('myhomenew', request.origin);
        module.exports.onHubConnect(connection, user);
      })
      .catch(err => {
        console.error('Error', err.stack || err);
      });
  });
};
