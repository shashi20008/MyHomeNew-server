'use strict';

const { authorize } = require('../libs/passport');
const { proxy } = require('../libs/proxy');

module.exports = function (app) {
  app.use('/devices', authorize, proxy);
}