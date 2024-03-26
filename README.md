

# Sofit Employee Management

Sofit Employee Management is a Node.js application designed to manage employee records, including adding new employees, retrieving employee data, filtering employees by phone number or email, and sending emails to employees. This README provides instructions on how to set up and use the application.

## Setup Instructions

1. **Clone the Repository**: Clone the repository to your local machine using the following command:

    ```bash
    git clone https://github.com/your-username/sofit-employee-management.git
    ```

2. **Install Dependencies**: Navigate to the project directory and install the required dependencies using npm or yarn:

    ```bash
    cd sofit-employee-management
    npm install
    ```

3. **Set Environment Variables**: Create a `.env` file in the project root directory and specify the required environment variables. Here's an example:

    ```plaintext
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/sofit-employees
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASSWORD=your-email-password
    ```

    - `PORT`: Specifies the port on which the server will run. Default is `3000`.
    - `MONGODB_URI`: MongoDB connection URI for connecting to the database.
    - `EMAIL_USER`: Your email address for sending emails.
    - `EMAIL_PASSWORD`: Your email password.

4. **Start the Server**: Start the Node.js server by running the following command:

    ```bash
    npm start
    ```

    The server should now be running and listening for requests on the specified port (default is `3000`).

## Usage

- **Employee Routes**: The application provides RESTful API endpoints for managing employee records. Use tools like cURL or Postman to interact with these endpoints.

- **API Documentation**: For detailed information on available endpoints and their usage, refer to the API documentation provided in the `src/routes/employeeRoutes.js` file.

- **Sending Emails**: To send emails to employees, use the `/api/send-email` endpoint with the appropriate payload containing the recipient's email address, subject, and message.

## Additional Notes

- **Database**: By default, the application uses a local MongoDB database (`MONGODB_URI=mongodb://localhost:27017/sofit-employees`). Ensure that MongoDB is installed and running on your machine.

- **Security**: Avoid hardcoding sensitive information like email credentials directly into the codebase. Use environment variables and ensure proper security measures are in place.

- **Testing**: Thoroughly test the application's functionality, including edge cases and error handling, before deploying it to production.

## Here's the list of libraries used in the application along with brief descriptions:
1. **Express**: Used for building web applications and APIs in Node.js.
2. **Mongoose**: Provides MongoDB object modeling for Node.js.
3. **dotenv**: Loads environment variables from a .env file.
4. **Multer**: Middleware for handling multipart/form-data, primarily used for file uploads.
5. **Nodemailer**: Module for sending emails from Node.js applications.
6. **csv-parser**: Library for parsing CSV files.
7. **validator**: Library for string validation and sanitization.
8. **body-parser**: Middleware for parsing JSON and URL-encoded request bodies.
