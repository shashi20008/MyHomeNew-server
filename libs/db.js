'use strict';

// const nconf = require('nconf');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// nconf.file({ file: 'config/config.json' }).env();

module.exports.connect = () => {
    const user = encodeURIComponent(process.env.MONGO_DB_USER);
    const password = encodeURIComponent(process.env.MONGO_DB_PASS);
    const host = process.env.MONGO_DB_HOST;

    mongoose.connect(`mongodb+srv://${user}:${password}@${host}/myhomenew?retryWrites=true&w=majority`, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('connected to db');
    })
    .catch(err => {
        console.log('DB connection failed: ', err);
    });
};
