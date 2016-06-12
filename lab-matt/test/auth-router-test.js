'use strict';

process.env.APP_SECRET = process.env.APP_SECRET || 'pencil';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/test';

const expect = require('chai').expect;
const request = require('superagent-use');
const superPromise = require('superagent-promise-plugin');
const debug = require('debug')('auth:auth-router-test');

const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller');

const port = process.env.PORT || 3000;
const baseURL = `localhost:${port}/api`;
const server = require('../server');
request.use(superPromise);

describe('testing module auth-router', function(){
  before((done)=> {
    debug('before module auth-router');
    if(!server.isRunning){
      server.listen(port, () => {
        server.isRunning = true;
        debug(`server up on port ${port}`);
        done();
      });
      return;
    }
    done();
  });

  after((done) => {
    debug('after module auth-router');
    if(server.isRunning) {
      server.close(()=>{
        server.isRunning = false;
        debug('server down');
        done();
      });
      return;
    }
    done();
  });
  describe('testing POST /api/signup', function(){
    after((done)=> {
      debug('after POST /api/signup');
      userController.removeAllUsers()
      .then(()=> done())
      .catch(done);
    });
    it('should return 400 bad request', function(done){
      request.post(`${baseURL}/signup`)
      .catch(err => {
        expect(err.response.status).to.equal(400);
        done();
      });
    });
    it('should return a token', function(done){
      debug('test POST /api/signup');
      request.post(`${baseURL}/signup`)
      .send({username: 'iodnfoiasnd', password: 'smith'})
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.text.length).to.equal(205);
        done();
      });
    });
    
    describe('testing GET /api/signup', function(){
      before((done)=>{
        authController.signup({username: 'matt', password: 'test'})
        .then(()=> done())
        .catch(done);

      });
      after((done)=>{
        debug('after GET /api/signup');
        userController.removeAllUsers()
        .then(() => done())
        .catch(done);
      });
      it('should return 401 not authorized', function(done){
        debug('test GET /api/signup');
        request.get(`${baseURL}/signin`)
        .auth('matt', 'wrongPassword')
        .then(done)
        .catch(err =>{
          const res = err.response;
          expect(res.status).to.equal(401);
          done();
        });
      });
      it('should return a token', function(done){
        debug('test GET /api/signup');
        request.get(`${baseURL}/signin`)
        .auth('matt', 'test')
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.text.length).to.equal(205);
          done();
        })
        .catch(done);
      });
    });
  });
});
