# EmpowerRecruit

EmpowerRecruit is a comprehensive recruitment platform built using the MERN stack, designed to streamline the hiring process for colleges, students, and recruiters. Recruiters can post jobs with job parsing for automated field entry, choose between global or college-specific postings, and utilize a job compatibility score to rank applicants. They can accept or reject applications, with status updates sent via email. Students can apply for jobs using resume parsing for seamless form filling, check their compatibility scores for job descriptions, and track their application statuses. Colleges can manage placement activities, approve drives, track placement statistics, handle student data, and coordinate with recruiters to optimize placement outcomes. Empower Recruit enhances efficiency, transparency, and engagement in the hiring process.

## Features

### Recruiters
- Post jobs with job parsing for automated field entry.
- Choose between global or college-specific job postings.
- Utilize a job compatibility score to rank applicants.
- Accept or reject applications, with status updates sent via email.

### Students
- Apply for jobs using resume parsing for seamless form filling.
- Check compatibility scores for job descriptions.
- Track application statuses.

### Colleges
- Manage placement activities.
- Approve placement drives.
- Track placement statistics.
- Handle student data and coordinate with recruiters to optimize placements.

EmpowerRecruit enhances efficiency, transparency, and engagement in the hiring process.

## Directory Structure

```
└── saisriharsha2003-empowerrecruitupdated/
    ├── README.md  # Project documentation
    ├── Client/  # Frontend React application
    │   ├── package-lock.json  # Lock file for dependencies
    │   ├── package.json  # Project dependencies and scripts
    │   ├── .gitignore  # Files to be ignored in version control
    │   ├── public/
    │   │   ├── index.html  # Main HTML file for React
    │   │   ├── manifest.json  # Web app manifest
    │   │   └── robots.txt  # SEO-related rules
    │   └── src/
    │       ├── App.js  # Main React component
    │       ├── index.js  # Entry point for React app
    │       ├── api/
    │       │   └── axios.js  # Axios configuration for API requests
    │       ├── components/
    │       │   ├── footer.js  # Footer component
    │       │   ├── home.js  # Home page component
    │       │   ├── layout.js  # Layout component
    │       │   ├── login.js  # Login form component
    │       │   ├── notFound.js  # 404 error page
    │       │   ├── signup.js  # Signup form component
    │       │   ├── toast.js  # Notification component
    │       │   ├── userLayout.js  # Layout for user pages
    │       │   ├── admin/
    │       │   │   ├── adminDashboard.js  # Admin dashboard
    │       │   │   ├── adminLayout.js  # Layout for admin panel
    │       │   │   ├── adminOpenings.js  # Job openings management
    │       │   │   ├── adminProfile.js  # Admin profile management
    │       │   │   ├── adminRecruiters.js  # Manage recruiters
    │       │   │   ├── adminSelected.js  # View selected candidates
    │       │   │   └── adminStudents.js  # Manage students
    │       │   ├── college/
    │       │   │   ├── collegeCompanies.js  # View college-associated companies
    │       │   │   ├── collegeCompanyProfile.js  # View company details
    │       │   │   ├── collegeDashboard.js  # College dashboard
    │       │   │   ├── collegeDriveProfile.js  # College drive profile
    │       │   │   ├── collegeDrives.js  # Placement drives list
    │       │   │   ├── collegeLayout.js  # Layout for college panel
    │       │   │   ├── collegeProfile.js  # College profile management
    │       │   │   ├── collegeRegister.js  # College registration form
    │       │   │   ├── collegeSections.js  # College sections view
    │       │   │   └── collegeStudents.js  # Manage students from college
    │       │   ├── recruiter/
    │       │   │   ├── recruiterApplications.js  # View applications
    │       │   │   ├── recruiterDashboard.js  # Recruiter dashboard
    │       │   │   ├── recruiterJobProfile.js  # Job profile details
    │       │   │   ├── recruiterLayout.js  # Layout for recruiter panel
    │       │   │   ├── recruiterOpening.js  # Create a job opening
    │       │   │   ├── recruiterPosted.js  # View posted jobs
    │       │   │   ├── recruiterProfile.js  # Manage recruiter profile
    │       │   │   ├── recruiterRegister.js  # Recruiter registration form
    │       │   │   ├── recruiterStudentProfile.js  # View student profile
    │       │   │   └── uploadJD.js  # Upload job description
    │       │   └── student/
    │       │       ├── studentApplied.js  # View applied jobs
    │       │       ├── studentDashboard.js  # Student dashboard
    │       │       ├── studentJobProfile.js  # Job profile view
    │       │       ├── studentLayout.js  # Layout for student panel
    │       │       ├── studentOpenings.js  # List job openings
    │       │       ├── studentProfile.js  # Manage student profile
    │       │       ├── studentRegister.js  # Student registration form
    │       │       └── uploadResume.js  # Upload resume
    │       ├── hooks/
    │       │   ├── useAxiosPrivate.js  # Custom hook for private API requests
    │       │   └── useRefreshToken.js  # Custom hook for token refresh
    │       └── styles/
    │           ├── dash.css  # Dashboard styles
    │           ├── form.css  # Form styling
    │           ├── home.css  # Home page styles
    │           ├── index.css  # Global styles
    │           └── nav.css  # Navbar styling
    └── Server/  # Backend Node.js and Express API
        ├── Server.js  # Main server file
        ├── package-lock.json  # Lock file for dependencies
        ├── package.json  # Backend dependencies and scripts
        ├── vercel.json  # Deployment configuration for Vercel
        ├── .gitignore  # Files to be ignored in version control
        ├── config/
        │   ├── corsOrigins.js  # CORS configuration
        │   ├── dbConn.js  # Database connection setup
        │   └── whitelist.js  # Whitelist configuration
        ├── controllers/
        │   ├── adminController.js  # Admin-related logic
        │   ├── collegeController.js  # College-related logic
        │   ├── recruiterController.js  # Recruiter-related logic
        │   ├── studentController.js  # Student-related logic
        │   ├── userController.js  # User authentication logic
        │   └── verificationController.js  # Verification logic
        ├── middleware/
        │   ├── credentials.js  # Middleware for credentials handling
        │   ├── upload.js  # Middleware for file uploads
        │   ├── verifyRole.js  # Middleware for role verification
        │   └── verifyJWT.js  # Middleware for JWT authentication
        ├── models/                 # Database models
        │   ├── admin.js            # Admin model
        │   ├── college.js          # College model
        │   ├── job.js              # Job model
        │   ├── mailOTP.js          # Email OTP model
        │   ├── mobileOTP.js        # Mobile OTP model
        │   ├── recruiter.js        # Recruiter model
        │   ├── student.js          # Student model
        │   ├── college/            # College-related models
        │   │   ├── course.js       # Course model
        │   │   ├── institution.js  # Institution model
        │   │   ├── placement.js    # Placement model
        │   │   └── principal.js    # Principal model
        │   ├── recruiter/         # Recruiter-related models
        │   │   ├── company.js      # Company model
        │   │   └── recruiterDetail.js # Recruiter details model
        │   └── student/           # Student-related models
        │      ├── academic.js     # Academic details
        │      ├── appliedJob.js   # Applied jobs model
        │      ├── certification.js # Certification model
        │      ├── contact.js      # Contact details model
        │      ├── personal.js     # Personal details model
        │      ├── project.js      # Project model
        │      └── workExp.js      # Work experience model
        ├── routes/                 # API route definitions
        │   ├── admin.js            # Routes for admin-related operations
        │   ├── college.js          # Routes for college-related operations
        │   ├── recruiter.js        # Routes for recruiter-related operations
        │   ├── student.js          # Routes for student-related operations
        │   └── user.js             # Routes for general user operations
```

## Steps to Set Up and Run the Code (Without Docker)

### Prerequisites:
Ensure you have the following installed:
  - **Node.js** (v14+ recommended)
  - **MongoDB** (local or hosted)


### 1. Clone the Repository
```bash
git clone "https://github.com/saisriharsha2003/EmpowerRecruitUpdated"
```

### 2. Install Dependencies

Run the following command to install all required packages:

Open two separate terminals and run the following commands:

In the first terminal:

```sh
cd Client
npm install
```

In the second terminal:


```bash
cd ../Server
npm install
```
  
### 3. Configuring Environment Variables

Create a .env file in note-nexus-backend with the following values:

```bash
DATABASE_URI=<Your MongoDB connection string>
JWT_SECRET=<Your JWT secret key>
MAIL=<Your email>
PASSWORD=<Your email password>
JOB_PARSER=<Job parser API URL>
ACCESS_TOKEN_SECRET=<Your access token secret>
REFRESH_TOKEN_SECRET=<Your refresh token secret>
TWILIO_PHONE_NUMBER=<Your Twilio phone number>
```

### 4. Start the Application

Open two separate terminals and run the following commands:

In the first terminal:

```bash
cd Client
npm start
```

In the second terminal:

```bash
cd Server
npm start
```

### 5. Access the Application

Open http://localhost:3000 in your browser to use the app.


