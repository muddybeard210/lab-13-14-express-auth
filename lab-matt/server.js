'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const httpErrors = require('http-errors');
const debug = require('debug')('auth:server');
const handleError = require('./lib/handle-error');
const authRouter = require('./route/auth-router');

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost/auth';


mongoose.connect(mongoURI);

app.use(morgan('dev'));

app.use('/api', authRouter);

app.all('*', function(req, res, next){
  debug('404 * route');
  next(httpErrors(404, 'no such route'));
});

app.use(handleError);

const server = app.listen(port, function(){
  console.log('server up on', port);
});

server.isRunning = true;
module.exports = server;
