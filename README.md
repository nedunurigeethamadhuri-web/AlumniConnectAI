# AlumniConnectAI

AlumniConnectAI is a web application that connects students and alumni on a single platform. It helps students find alumni mentors, communicate with them, explore career opportunities and get guidance based on their interests and skills.

## About the Project

The main purpose of this project is to make communication between students and alumni easier.

Students can create their profiles, add their skills and interests, find suitable mentors, send mentorship requests and communicate with alumni. Alumni can manage their profiles, respond to mentorship requests and interact with students.

The application also provides opportunities, community discussions, a career roadmap and mentorship analytics.

## Features

- User registration and login
- Student and alumni profiles
- Skill management
- Mentor recommendations
- Mentorship requests
- Mentorship sessions
- Messaging between students and alumni
- Internship and job opportunities
- Bookmark opportunities
- Community posts
- Likes and comments
- Career roadmap
- Dynamic dashboard
- Mentorship analytics

## Technologies Used

**Frontend**
- React
- JavaScript
- HTML
- CSS
- Vite

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT

**Database**
- PostgreSQL
- Prisma ORM

**Tools**
- Git
- GitHub
- Visual Studio Code
- Postman

## How It Works

The application has a React frontend and a Node.js backend.

The frontend sends requests to the backend through REST APIs. Express handles the API requests and the controllers contain the main application logic. Prisma is used to perform database operations with PostgreSQL.

Authentication is handled using JWT. Protected requests are checked by the authentication middleware before the user can access them.

## Main Modules

### Authentication

Users can register and log in as students or alumni. JWT authentication is used to protect the application.

### Student and Alumni Profiles

Users can create and manage their profiles. They can add information such as skills, interests and career-related details.

### Mentor Recommendations

Students can find alumni mentors based on their profile information, skills and career interests.

### Mentorship

Students can send mentorship requests to alumni. Alumni can accept or manage these requests. Mentorship sessions can be created for accepted requests.

### Messaging

Students and alumni can communicate with each other using the messaging feature.

### Opportunities

Students can view internships, jobs and other opportunities. They can also bookmark opportunities for future reference.

### Community

Users can create posts and interact with other users through likes and comments.

### Career Roadmap

The career roadmap provides a learning path based on the user's career direction and current skills.

### Dashboard

The dashboard displays information such as profile completion, skills, mentor matches, opportunities and career-related progress.

### Mentorship Analytics

The analytics section provides information about mentorship requests, sessions and feedback.

## Project Structure

The project contains two main folders:

**Frontend**
- `src/components` - Reusable React components
- `src/pages` - Different pages of the application
- `src/services` - API related code
- `App.jsx` - Application routes

**Backend**
- `src/config` - Database configuration
- `src/controllers` - Application logic
- `src/middleware` - Authentication and other middleware
- `src/routes` - API routes
- `src/services` - Application services
- `src/utils` - Utility functions
- `src/app.js` - Express application setup
- `src/server.js` - Starts the backend server
- `prisma` - Database schema and migrations

## Database

PostgreSQL is used as the database and Prisma is used as the ORM.

The database contains information related to:

- Users
- Student profiles
- Alumni profiles
- Skills
- Mentorship requests
- Mentorship sessions
- Messages
- Opportunities
- Community posts
- Likes and comments
- Feedback

## Running the Project

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

### Clone the Repository

```bash
git clone https://github.com/nedunurigeethamadhuri-web/AlumniConnectAI.git
cd AlumniConnectAI
```

### Backend Setup

Open the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add the required database and JWT configuration.

Then run:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## Environment Variables

The backend requires environment variables for the database connection and JWT authentication.

Example:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
```

Do not upload actual passwords, secret keys or other sensitive information to GitHub.

## Future Improvements

The project can be extended with features such as:

- Advanced AI based mentor matching
- AI based career recommendations
- Resume analysis
- Skill gap analysis
- Notifications
- Email notifications
- Video mentoring
- Advanced search and filtering
- Cloud deployment

## Project Status

The project is currently under development. The main modules such as authentication, profiles, mentorship, messaging, opportunities, community, career roadmap and analytics have been implemented.

## Developer

**Nedunuri Geetha Madhuri**

B.Tech - Artificial Intelligence and Machine Learning

GitHub: https://github.com/nedunurigeethamadhuri-web/AlumniConnectAI
