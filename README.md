# 🚀 AMKOV Backend API

The robust and scalable backend powering the AMKOV platform. Built with **Node.js, Express, TypeScript, and MongoDB**, this API handles everything from advanced product inventory and category management to secure user authentication, dynamic email notifications, and automated Google Calendar integrations for service inspections.

## 🔗 Live Website  
* **Production:** [https://amkov.com](https://amkov.com)
* **Backend API:** [https://api.amkov.com](https://api.amkov.com) 

---

## 🛠️ Tech Stack

* **Core:** Node.js, Express.js, TypeScript
* **Database:** MongoDB, Mongoose
* **Validation & Types:** Zod
* **Authentication:** JSON Web Tokens (JWT), bcrypt
* **Email Services:** Nodemailer, EJS (Embedded JavaScript templates)
* **Integrations:** Google Calendar API (OAuth 2.0)
* **Deployment & Infrastructure:** AWS EC2, PM2, Nginx, Let's Encrypt (Certbot), GitHub Actions (CI/CD)

---

## ✨ Core Features

* **Advanced Product Management:** Full CRUD operations for products with support for multi-category mapping, dynamic variations (size, color, stock), custom specifications, and manual/algorithmic sorting (`orderBy` & `createdAt`).
* **Automated Email Workflows:** Beautiful, customized HTML email templates (via EJS) for appointment confirmations, password resets, and user notifications.
* **Admin Analytics Engine:** Complex aggregation pipelines generating real-time metrics, time-series data, and status breakdowns for the React Admin Dashboard.
* **Role-Based Access Control (RBAC):** Secure routes protecting sensitive Admin and Super Admin endpoints.
* **FAQ & Contact Management:** Streamlined handling of customer inquiries and dynamic FAQ generation.

---

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the root directory and add the following variables:
```env
# Application
NODE_ENV=development
PORT=5000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/amkov?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=465
SMTP_USER=your_email@amkov.com
SMTP_PASS=your_email_password
SMTP_FROM="AMKOV" <no-reply@amkov.com>

# Google Calendar API (For Inspections)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=[https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Amazon Web Services
AWS_ACCESS_KEY_ID=your_aws_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=region_here
S3_BUCKET_NAME=bucket_name