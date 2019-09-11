'use strict';
const uuid = require('uuid/v4');
const _get = require('lodash/get');
const { authorize } = require('../libs/passport');
const { createClient } = require('../models/oAuth');

module.exports = (app) => {
  app.get('/authorize', function(req, res) {
    if(!req.isAuthenticated() || !req.user) {
      return res.redirect(`/login?redirectTo=${encodeURIComponent(req.originalUrl)}`)
    }
    
    const prefix = '<!DOCTYPE html><html><head><title>Authorize</title></head><body>' +
      '<form action="/authorize" method="POST"><input type="hidden" name="grant_type" value="code" />' +
      '<h4>Authorize Google assistant to control your devices</h4>';
    const inputs = Object.keys(req.query).reduce((html, key) => 
      html + `<input type="hidden" name="${key}" value="${req.query[key]}" />`, '');
    const postfix = '<button type="submit">Authorize</button></form></body></html>'
    res.type('html').send(prefix + inputs + postfix);
  });
  app.post('/authorize', authorize, app.oAuth.authorize({
    authenticateHandler: {
      handle: (req, res) => {
        console.log(req.user);
        return req.user;
      }
    }
  }));
  app.post('/token', app.oAuth.token());

  app.post('/create-client', authorize, (req, res) => {
    const email = _get(req, 'user.email');
    if(email === 'shashi20008@gmail.com') {
      const name = req.body.name;
      const id = uuid().replace(/-/g, '');
      const secret = uuid().replace(/-/g, '');
      const grants = [ 'authorization_code',  'refresh_token' ];
      const redirectUris = [ req.body.redirectUri ];
      return createClient({name, id, secret, grants, redirectUris})
        .then(resp => res.json(resp.toJSON()))
        .catch(err => res.status(500).json({err: err.message}));
    }
    return res.status(403).end();
  });
}
