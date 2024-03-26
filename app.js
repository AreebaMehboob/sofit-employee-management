const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const employeeRoutes = require('./src/routes/employeeRoutes');
const { getEmployeesByPhoneNumber } = require('./src/Controller/employeeController');

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/employees', employeeRoutes);

// Handle 404 Not Found errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});
// Serve uploaded profile photos
app.use('/api/profiles', express.static('media/profiles'));
// Handle 404 Not Found errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

app.get('/api/employees/filter-by-phone', getEmployeesByPhoneNumber);
// MongoDB connection
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

module.exports = app;
