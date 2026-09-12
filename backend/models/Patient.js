const mongoose = require('mongoose');
 
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  bloodGroup: { type: String },
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: { name: String, phone: String, relation: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
 
module.exports = mongoose.model('Patient', patientSchema);