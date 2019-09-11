'use strict';
const _get = require('lodash/get');
const { proxy } = require('../libs/proxy');

module.exports =  app => {
  app.post('/assistant/fullfill', app.oAuth.authenticate(), (req, res) => {
    req.user = _get(res, 'locals.oauth.token.user', {});
    return proxy(req, res);
  });
}
