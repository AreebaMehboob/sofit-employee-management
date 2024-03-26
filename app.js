const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const upload = multer({ dest: 'upload/employ_data' });
const employeeRoutes = require('./src/routes/employeeRoutes');
const { getEmployeesByPhoneNumber, getEmployeeByEmail ,sendEmail} = require('./src/Controller/employeeController');
const fs = require('fs'); // Import fs module for file operations
const csvParser = require('csv-parser'); // Import csv-parser module for parsing CSV files

dotenv.config();
const app = express();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
   
})
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});
// Routes
app.use('/api/employees', employeeRoutes);

// Route to handle CSV file upload
app.post('/api/upload-csv', upload.single('csv'), (req, res) => {
  try {
    const csvFilePath = req.file.path;
    const employees = [];

    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Process each row of the CSV file
        // Create employee objects and push them to the employees array
        employees.push({
          name: row.Name,
          email: row.Email,
          employeeTitle: row['Employee Title'],
          phone: row.Phone,
          status: row.Status === 'true' ? true : false
        });
      })
      .on('end', () => {
        // Save the employees to the database
        // You can use Employee model and save each employee object in the employees array
        // Handle validation and error cases appropriately
        res.status(201).json({ message: 'Employees added successfully', employees });
      });
  } catch (error) {
    console.error('Error uploading CSV file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve uploaded profile photos
app.use('/api/profiles', express.static('media/profiles'));

// Route to filter employees by phone number
app.get('/api/employees/filter-by-phone', getEmployeesByPhoneNumber);

// Route to get employee by email
app.get('/api/employees/filter-by-email', getEmployeeByEmail);
// Route for sending email
app.post('/api/send-email', sendEmail);

// Handle 404 Not Found errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;