const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  employeeTitle: {
    type: String,
    enum: ['backend developer', 'frontend developer', 'ai developer'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
