'use strict';

const debug = require('debug')('auth:talent-controller');
const Talent = require('../model/talent');
const httpErrors = require('http-errors');

exports.createTalent = function(talentData){
  debug('createTalent');
  return new Promise((resolve, reject) =>{
    new Talent(talentData).save()
    .then(talent => resolve(talent))
    .catch( err => reject(httpErrors(400, err.message)));
  });
};

exports.getTalent = function(talentId) {
  return new Promise((resolve, reject)=>{
    Talent.findOne({_id:talentId})
    .then(talent => {
      resolve(talent);
    })
    .catch(reject);
  });
};

exports.updateTalent = function(talentId, reqbody) {
  return new Promise((resolve, reject) =>{
    if(JSON.stringify(reqbody) === '{}') return reject(httpErrors(400, 'need to provide a body'));
    Talent.findOne({_id:talentId})
    .then(talent => {
      talent.talent = reqbody.talent;
      talent.description = reqbody.description;
      if(reqbody.weakness) {
        talent.weakness = reqbody.weakness;
      }
      talent.save();
      resolve(talent);
    }).catch(err => reject(httpErrors(404, err.message)));
  });
};

exports.deleteTalent = function(talentId){
  return new Promise((resolve, reject) =>{
    Talent.remove({_id:talentId})
    .then(resolve)
    .catch(err => reject(httpErrors(404, err.message)));
  });
};

exports.removeAllTalents = function(){
  return Talent.remove({});
};
