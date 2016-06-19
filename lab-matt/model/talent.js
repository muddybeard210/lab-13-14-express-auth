'use strict';

const mongoose = require('mongoose');

const talentSchema = mongoose.Schema({
  talent: {type: String, required: true, unique: true},
  description: {type: String, required:true},
  weakness: {type: String},
  userId: {type: mongoose.Schema.ObjectId, required: true}
});

module.exports = mongoose.model('talent', talentSchema);
