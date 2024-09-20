# Node.js JWT Authentication & Google Login

A simple and secure Node.js application for handling user authentication using JWT (JSON Web Token). This project allows users to sign up, log in, maintain sessions via JWT tokens, and authenticate via Google.

## Features
- User registration with hashed passwords
- Secure login with JWT-based authentication
- Google authentication using OAuth 2.0
- Token validation for protected routes
- Error handling for failed authentication
- Nodemailer integration for OTP or email verification

## Technologies Used
- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Token)
- Nodemailer
- Google OAuth 2.0

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nodejs-jwt-authentication.git
cd nodejs-jwt-authentication
```

### 2. Install Dependencies
Make sure you have Node.js installed. Then run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```
PORT=8080
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=<your-google-callback-url>
```

### 4. Start the Application
To run the app in development mode:
```bash
npm run dev
```
The server will start on `http://localhost:8080`.

### 5. Test the Endpoints
You can use Postman or a similar tool to test the following endpoints:
- **POST /api/auth/register** – User registration
- **POST /api/auth/login** – User login with JWT token
- **GET /api/protected** – Access protected route with valid token
- **GET /auth/google** – Initiates Google login flow
- **GET /auth/google/callback** – Handles Google authentication callback

### 6. Nodemailer for OTP Verification (Optional)
To enable email-based OTP verification, configure your email service (e.g., Gmail or SMTP) in the `.env` file. The OTP will be sent when a new user registers.

## License
This project is open-source and licensed under the MIT License.

---

This version includes the Google authentication setup alongside JWT authentication. Let me know if you need further adjustments!
