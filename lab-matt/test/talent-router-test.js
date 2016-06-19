'use strict';

process.env.APP_SECRET = process.env.APP_SECRET || 'pencil';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/test';

const expect = require('chai').expect;
const request = require('superagent-use');
const superPromise = require('superagent-promise-plugin');
const debug = require('debug')('auth:talent-router-test');

const authController = require('../controller/auth-controller');
const userController = require('../controller/user-controller');
const talentController = require('../controller/talent-controller');

const port = process.env.PORT || 3000;
const baseURL = `localhost:${port}/api`;
const server = require('../server');
request.use(superPromise);

describe('testing module talent-router', function(){
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

  describe('testing module talent router', function(){
    beforeEach((done)=>{
      authController.signup({username: 'pippy', password: 'stalkings'})
      .then( token => this.tempToken = token)
      .then(token => {
        return request.post(`${baseURL}/talent`)
        .set({
          Authorization: `Bearer ${token}`
        })
        .send({
          talent: 'Tree Climber',
          description: '...climbs trees'
        })
        .then(res => {
          return this.tempTalent = res.body;
        }).catch(done);
      })
      .then(() => done())
      .catch(done);
    });
    afterEach((done)=> {
      Promise.all([
        userController.removeAllUsers(), talentController.removeAllTalents()
      ])
      .then( () => done())
      .catch(done);
    });
    describe('testing post /api/talent', () => {
      it('1 should return a talent', (done) => {
        request.post(`${baseURL}/talent`)
        .send({
          talent: 'Hoolahoop',
          description: 'can do like so many circles'
        })
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .then( res => {
          expect(res.status).to.equal(200);
          done();
        }).catch(done);
      });
      it('2 should return a 401', (done) => {
        request.post(`${baseURL}/talent`)
        .send({
          talent: 'Hoolahoop',
          description: 'can do like so many circles'
        })
        .set({
          Authorization: 'Bearer'
        })
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(401);
          done();
        });
      });
      it('3 should return a 400', (done) => {
        request.post(`${baseURL}/talent`)
        .send({
          name: 'bad request',
          desc: 'not valid'
        })
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('testing get api/talent/:id', () => {
      it('4 should return a talent', (done) => {
        request.get(`${baseURL}/talent/${this.tempTalent._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .then(res => {
          expect(res.status).to.equal(200);
          done();
        })
        .catch(done);
      });
      it('5 should return a 401', (done) => {
        request.get(`${baseURL}/talent/${this.tempTalent._id}`)
        .set({
          Authorization: 'Bearer'
        })
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(401);
          done();
        });
      });
      it('6 should return a 404', (done) => {
        request.get(`${baseURL}/talent/5760cb49af546ca8c086b0d4`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(404);
          done();
        });
      });
      it('7 should return a 400', (done) => {
        request.get(`${baseURL}/talent`)
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('testing PUT at api/talent/:id', ()=>{
      it('8 should return a new talent', (done) => {
        request.put(`${baseURL}/talent/${this.tempTalent._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          talent: 'Maples',
          description: 'can do like so many circles'
        })
        .then( res => {
          expect(res.status).to.equal(200);
          done();
        }).catch(done);
      });
      it('9 should return a 401', (done) => {
        request.put(`${baseURL}/talent/${this.tempTalent._id}`)
        .send({
          talent: 'Maples',
          description: 'can do like so many circles'
        })
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(401);
          done();
        });
      });
      it('10 should return a 400', (done) => {
        request.put(`${baseURL}/talent/${this.tempTalent._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(400);
          done();
        });
      });
      it('10 should return a 404', (done) => {
        request.put(`${baseURL}/talent/badID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          talent: 'Ice Cream Eater',
          description: 'Eats as much ice cream without getting brain freeze'
        })
        .then(done)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
