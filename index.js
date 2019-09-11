const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const OAuthServer = require('express-oauth-server');
const morgan = require('morgan');

const routes = require('./routes');
const DB = require('./libs/db');
const OAuthModel = require('./models/oAuth');
const Proxy = require('./libs/proxy');

const app = express();
app.oAuth = new OAuthServer({
    debug: true,
    model: OAuthModel
});

if(process.env.mode === 'development') {
  const webpack = require('webpack');
  const middleware = require('webpack-dev-middleware');
  const compiler = webpack(require('./webpack.config'));
  app.use(middleware(compiler, { index: false, lazy: true, publicPath: '/js/' }))
}

app.use(express.static('./dist'));
app.use(express.static('./public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('tiny'));

app.use(session({ 
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 1 week
    store: new SQLiteStore
}));

app.use(passport.initialize());
app.use(passport.session());

routes.setupRoutes(app);

DB.connect();

const server =  http.createServer(app);
Proxy.startWSServer(server);
server.listen(process.env.PORT || 8000);
