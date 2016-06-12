'use strict';

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const debug = require('debug')('auth:user');
const httpErrors = require('http-errors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  findHash: {type: String, unique: true}
});

userSchema.methods.generateHash = function(password){
  debug('generateHash');
  return new Promise((resolve, reject) =>{
    bcrypt.hash(password, 10, (err, hash) =>{
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.compareHash = function(password){
  debug('compareHash');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this. password, (err, result) => {
      if (err) return reject(err);
      if(!result) return reject(httpErrors(401, 'wrong password'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');
  return new Promise((resolve, reject) => {
    var tries = 0;
    _generateFindHash.call(this);

    function _generateFindHash(){
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then(() => resolve(this.findHash))
      .catch((err) => {
        if(tries > 5) reject(err);
        tries++;
        _generateFindHash.call(this);
      });
    }
  });
};

userSchema.methods.generateToken = function(){
  debug('generateToken');
  return new Promise((resolve, reject) =>{
    this.generateFindHash()
    .then( findHash => resolve(jwt.sign({token: findHash}, process.env.APP_SECRET)))
    .catch(reject);
  });
};

module.exports = mongoose.model('user', userSchema);
