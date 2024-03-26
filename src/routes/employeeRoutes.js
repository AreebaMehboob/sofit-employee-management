const express = require('express');
const multer = require('multer');
const { addEmployee, getEmployeesByPhoneNumber, addEmployeeWithProfilePhoto } = require('../Controller/employeeController');

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({ dest: 'media/profiles' }); // Change the destination directory as needed

// POST route to add SOFIT Employees
router.post('/', addEmployee);

// GET route to filter SOFIT Employee records by phone number
router.get('/filter-by-phone', getEmployeesByPhoneNumber);

// POST route to add SOFIT Employees along with profile photos
router.post('/upload-profile', upload.single('profilePhoto'), addEmployeeWithProfilePhoto);

module.exports = router;
