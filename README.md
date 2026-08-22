# Node.js JWT Authentication, Blog Post & Contact Us API

A robust Node.js backend built with Express, MongoDB/Mongoose, JWT Authentication, Multer/Cloudinary image upload support, Blog Post CRUD, and Contact Us form management.

## Features
- **Direct User Registration**: Instant signup without requiring email OTP verification.
- **JWT-Based Authentication**: Secure login issuing JSON Web Tokens.
- **JWT Auth Middleware**: Protect any route using Bearer tokens.
- **Google OAuth 2.0 Integration**: Easy authentication via Google.
- **Blog Post CRUD**: Full CRUD functionality with slug auto-generation, search keyword filtering, categories, tags, image uploads, pagination, and view count tracking.
- **Contact Us Inquiries CRUD**: Public inquiry submissions, admin listing with status filters (`pending`, `read`, `resolved`, `replied`), automatic status tracking, and admin notes.

---

## Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or verify `.env` file in the root directory:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
ENCRYPTION_KEY=your_jwt_secret_encryption_key
JWT_EXPIRATION_MINUTES=1440
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 3. Start the Application
```bash
npm start
```
Server runs on: `http://localhost:8080`

---

## API Endpoints

### 🔐 Authentication (`/admin/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/auth/signUp` | Direct user signup (multipart/form-data or JSON with `userName`, `email`, `password`, optional `image`). Returns token immediately. |
| `POST` | `/admin/auth/signIn` | User login with `email` and `password`. Returns JWT `authToken`. |
| `POST` | `/admin/auth/resetPassword` | Change password with `email` and `newPassword`. |
| `GET` | `/admin/auth/google` | Initiates Google OAuth login. |
| `GET` | `/admin/auth/google/callback` | Google OAuth callback handler. |

---

### 📝 Blog Posts CRUD (`/admin/blogs`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/blogs` | Create a new blog post (multipart or JSON with `title`, `content`, `category`, `tags`, `author`, `status`, optional `image`). |
| `GET` | `/admin/blogs` | Get all blog posts with query params: `?search=xyz&category=Tech&status=published&page=1&limit=10`. |
| `GET` | `/admin/blogs/:id` | Get a single blog post by Mongo `_id` or `slug` (increments view counter). |
| `PUT` | `/admin/blogs/:id` | Update an existing blog post by `_id` or `slug` (supports optional image update). |
| `DELETE` | `/admin/blogs/:id` | Delete a blog post by `_id` or `slug`. |

---

### 📬 Contact Us Form CRUD (`/admin/contacts`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/contacts` | Submit a new contact inquiry (`name`, `email`, `phone`, `subject`, `message`). |
| `GET` | `/admin/contacts` | Get all contact inquiries with query params: `?status=pending&search=ahmed&page=1&limit=10`. |
| `GET` | `/admin/contacts/:id` | Get single contact message by `_id` (auto-marks status as `read` if pending). |
| `PUT` | `/admin/contacts/:id` | Update contact status (`status: "resolved"` or `adminNotes`). |
| `DELETE` | `/admin/contacts/:id` | Delete a contact inquiry by `_id`. |

---

## License
MIT
