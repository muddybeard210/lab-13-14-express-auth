'use strict';

const debug = require('debug')('auth:talent-router');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const httpErrors = require('http-errors');

const parseBearerAuth = require('../lib/parse-bearer-auth');
const talentController = require('../controller/talent-controller');


const talentRouter = module.exports = new Router();

talentRouter.post('/talent', parseBearerAuth, jsonParser, function(req, res, next){
  debug('POST /api/talent');
  req.body.userId = req.userId;
  talentController.createTalent(req.body)
  .then( talent => res.json(talent))
  .catch(next);
});

talentRouter.get('/talent', (req, res, next) => {
  next(httpErrors(400, 'no talent id provided'));
});

talentRouter.get('/talent/:id', parseBearerAuth, function(req, res, next){
  talentController.getTalent(req.params.id)
  .then(talent => {
    if(!talent){
      return next(httpErrors(404, 'talent not found'));
    }
    res.json(talent);
  }).catch(next);
});

talentRouter.put('/talent/:id', parseBearerAuth, jsonParser, function(req, res, next){
  talentController.updateTalent(req.params.id, req.body)
  .then(talent => {
    if(!talent) return next(httpErrors(404, 'talent not found'));
    res.json(talent);
  })
  .catch(next);
});

talentRouter.delete('/talent/:id', parseBearerAuth, function(req, res, next){
  talentController.deleteTalent(req.params.id)
  .then(() => {
    res.status(204).send();
  }).catch(next);
});
