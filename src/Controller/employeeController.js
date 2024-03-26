const Employee = require('../Model/Employee');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const multer = require('multer');
const upload = multer({ dest: 'media/profiles' });
const nodemailer = require('nodemailer');

async function addEmployee(req, res) {
  try {
    // Check if the request contains a CSV file
    if (req.file && req.file.mimetype === 'text/csv') {
      // Parse CSV file and add employees
      const employees = [];
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => {
          employees.push(data);
        })
        .on('end', async () => {
          for (const employeeData of employees) {
            const validationResult = isValidEmployeeData(employeeData);
            if (!validationResult.isValid) {
              console.error('Invalid employee data:', validationResult.error);
              continue; // Skip invalid data
            }

            const existingEmployee = await Employee.findOne({ email: employeeData.email });
            if (existingEmployee) {
              console.error('Email address already exists:', employeeData.email);
              continue; // Skip if email already exists
            }

            const newEmployee = new Employee(employeeData);
            await newEmployee.save();
          }

          res.status(201).json({ message: 'Employees added successfully' });
        });
    } else {
      // Handle JSON data upload as before
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
    }
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

    // Validate phoneNumber format
    if (!phoneNumber || !/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const skip = (page - 1) * limit;
    const phoneNumberArray = phoneNumber.split('-');

    const employees = await Employee.find({
      phone: {
        $regex: `^${phoneNumberArray[0]}-${phoneNumberArray[1]}-${phoneNumberArray[2]}$`
      },
      status: true
    })
      .select('name email employeeTitle phone')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ data: employees });
  } catch (error) {
    console.error('Error filtering employees by phone number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getEmployeeByEmail(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const employee = await Employee.findOne({ email: email, status: true }).select('name email employeeTitle phone');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or status is not true' });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// Function to send email
async function sendEmail(req, res) {
  try {
    const { to, subject, text } = req.body;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = {
  addEmployee,
  addEmployeeWithProfilePhoto,
  getEmployeesByPhoneNumber,
  getEmployeeByEmail,
  sendEmail
};
