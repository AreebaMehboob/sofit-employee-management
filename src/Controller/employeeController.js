const Employee = require('../Model/Employee');
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'media/profiles' });

async function addEmployee(req, res) {
  try {
    const validationResult = isValidEmployeeData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email address already exists' });
    }

    const newEmployee = new Employee(req.body);
    await newEmployee.save();

    res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function addEmployeeWithProfilePhoto(req, res) {
  try {
    const validationResult = isValidEmployeeData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ error: validationResult.error });
    }

    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email address already exists' });
    }

    const newEmployee = new Employee(req.body);

    if (req.file) {
      const profilePhotoExtension = path.extname(req.file.originalname);
      const newProfilePhotoName = `${newEmployee._id}${profilePhotoExtension}`;
      const newProfilePhotoPath = path.join('media/profiles', newProfilePhotoName);
      fs.renameSync(req.file.path, newProfilePhotoPath);
      newEmployee.profilePhotoUrl = `/media/profiles/${newProfilePhotoName}`;
    }

    await newEmployee.save();

    // Construct the response object including profilePhotoUrl if available
    const response = {
      message: 'Employee added successfully',
      employee: {
        name: newEmployee.name,
        email: newEmployee.email,
        employeeTitle: newEmployee.employeeTitle,
        phone: newEmployee.phone,
        status: newEmployee.status,
        _id: newEmployee._id,
        profilePhotoUrl: newEmployee.profilePhotoUrl // Add profilePhotoUrl to the response
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error adding employee with profile photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to validate employee data
function isValidEmployeeData(employee) {
  // Check if name, email, and phone are provided
  if (!employee.name) {
    return { isValid: false, error: 'Name is required' };
  }
  if (!employee.email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!employee.phone) {
    return { isValid: false, error: 'Phone is required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(employee.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Validate phone format (assuming a basic format)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(employee.phone)) {
    return { isValid: false, error: 'Invalid phone number format (10 digits required)' };
  }

  // Validate employee title
  const allowedTitles = ['backend developer', 'frontend developer', 'ai developer'];
  if (!employee.employeeTitle) {
    return { isValid: false, error: 'Employee title is required' };
  }
  if (!allowedTitles.includes(employee.employeeTitle.toLowerCase())) {
    return { isValid: false, error: 'Invalid employee title' };
  }

  // If all validations pass, return true
  return { isValid: true };
}

// Controller function to filter SOFIT Employee records by phone number

async function getEmployeesByPhoneNumber(req, res) {
  try {
    const { page = 1, limit = 10, phoneNumber } = req.query;
    const skip = (page - 1) * limit;

    const phoneNumberRegex = new RegExp(`^${phoneNumber.replace(/-/g, '')}$`);

    const employees = await Employee.find({
      phone: { $regex: phoneNumberRegex },
      status: true
    })
      .select('name email employeeTitle phone')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ employees });
  } catch (error) {
    console.error('Error filtering employees by phone number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  addEmployee,
  addEmployeeWithProfilePhoto,
  getEmployeesByPhoneNumber
};