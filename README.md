# AlumniConnectAI 🎓

## Intelligent Alumni Networking & Mentorship Platform

AlumniConnectAI is a full-stack web platform designed to connect students and alumni through mentorship, networking, skill development, career opportunities, messaging, and community engagement.

The platform provides a centralized environment where students can discover relevant alumni mentors, request mentorship, communicate with alumni, track skills, explore opportunities, participate in a community, and follow a career roadmap.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Student and Alumni registration
- Secure login
- JWT-based authentication
- Protected API routes
- Role-based application flow

### 👤 Profiles
- Student profiles
- Alumni profiles
- Profile completion tracking
- Career goals and professional information
- Skill management

### 🤝 Mentor Recommendations
- Mentor discovery
- Skill and profile-based mentor matching
- Recommended mentors for students
- Mentorship request workflow

### 📩 Mentorship Management
- Send mentorship requests
- Accept and manage mentorship requests
- Track mentorship sessions
- Session details
- Session feedback
- Mentorship analytics

### 💬 Messaging
- User-to-user messaging
- Conversation management
- Message history
- Unread message tracking
- Mark messages as read
- User search

### 💼 Opportunities
- Browse career opportunities
- Opportunity details
- Bookmark opportunities
- Student-focused opportunity discovery

### 🌐 Community
- Create community posts
- Like and unlike posts
- Add comments
- Delete own posts and comments
- Community feed

### 📊 Dynamic Dashboard
The dashboard dynamically displays information based on the logged-in user's data.

It includes:
- Profile completion
- Mentor matches
- Skills tracked
- Opportunities
- Career readiness
- Technical skill progress
- Profile strength
- Career direction
- Upcoming mentorship sessions
- Recommended mentors
- Skill development progress

### 🗺️ Career Roadmap
- Career goal visualization
- Learning path
- Skill gap identification
- Career insights
- Recommended projects
- Mentorship guidance

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   JavaScript + CSS   │
                    └──────────┬───────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │        Routes         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      Middleware       │
                    │  JWT Authentication   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │     Controllers       │
                    │    Business Logic     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │        Prisma         │
                    │         ORM           │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      PostgreSQL       │
                    │       Database        │
                    └────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend
- React
- JavaScript
- HTML5
- CSS3
- Vite

## Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication

## Database
- PostgreSQL
- Prisma ORM
- Prisma Migrations

## Development Tools
- Git
- GitHub
- VS Code
- Postman

---

# 📂 Project Structure

```text
AlumniConnectAI/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
└── README.md
```

---

# 🔄 How the Application Works

A typical request follows this flow:

```text
User Action
     ↓
React Frontend
     ↓
REST API Request
     ↓
Express Route
     ↓
Authentication Middleware
     ↓
Controller
     ↓
Prisma ORM
     ↓
PostgreSQL
     ↓
JSON Response
     ↓
React UI Update
```

For example, when a student sends a mentorship request:

```text
Student
   ↓
Mentor Recommendations Page
   ↓
POST /api/mentorship-requests
   ↓
Authentication Middleware
   ↓
Mentorship Request Controller
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Request Created
   ↓
Response to React
```

---

# 🔐 Authentication Flow

AlumniConnectAI uses JWT-based authentication.

```text
User Login
    ↓
Email + Password
    ↓
Backend Validation
    ↓
JWT Access Token
    ↓
Frontend
    ↓
Protected API Request
    ↓
Authentication Middleware
    ↓
Token Verification
    ↓
Controller
```

Protected endpoints require:

```text
Authorization: Bearer <access-token>
```

---

# 🗄️ Database Design

The application uses PostgreSQL with Prisma ORM.

Major entities include:

- User
- StudentProfile
- AlumniProfile
- Skill
- StudentSkill
- AlumniSkill
- MentorshipRequest
- MentorshipSession
- Feedback
- Message
- Opportunity
- OpportunityBookmark
- CommunityPost
- CommunityLike
- CommunityComment

These entities are connected through relational relationships defined in the Prisma schema.

---

# 🤖 Mentor Matching

The platform includes a skill and profile-based mentor matching module.

The matching process considers information such as:

```text
Student Profile
      +
Skills
      +
Career Interests
      ↓
Matching Logic
      ↓
Relevant Alumni
      ↓
Mentor Recommendations
```

The matching logic is separated into:

```text
backend/src/services/mentorMatching.service.js
```

This structure also allows more advanced AI/ML recommendation techniques to be integrated in the future.

---

# 📊 Dynamic Dashboard

The dashboard uses user-specific data instead of relying only on hard-coded values.

It dynamically displays:

- Profile completion
- Skills tracked
- Mentor matches
- Opportunities
- Career readiness
- Technical skill progress
- Profile strength
- Career direction
- Upcoming sessions
- Recommended mentors
- Skill development progress

---

# 🔌 API Modules

The backend provides REST API modules for:

- Authentication
- Profiles
- Skills
- Alumni
- Mentors
- Mentorship Requests
- Mentorship Sessions
- Feedback
- Messages
- Opportunities
- Community
- Analytics

The APIs are organized using Express routes and controllers.

---

# 🧪 Testing

The application was tested during development using API requests and frontend integration.

Important flows tested include:

- User authentication
- Protected API access
- Mentorship requests
- Mentorship sessions
- Messaging
- Opportunities
- Community posts
- Likes and comments
- Dashboard data retrieval

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/nedunurigeethamadhuri-web/AlumniConnectAI.git
```

```bash
cd AlumniConnectAI
```

---

## 2. Backend Setup

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example`.

Configure your PostgreSQL database and required environment variables.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔒 Environment Variables

Sensitive environment variables should never be committed to GitHub.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

The actual `.env` file is excluded using `.gitignore`.

---

# 🎯 Future Enhancements

- Advanced AI/ML-based mentor recommendation
- AI-powered career recommendations
- Resume analysis
- Skill gap prediction
- Personalized learning recommendations
- Alumni event recommendations
- Notification system
- Email notifications
- Real-time WebSocket messaging
- Advanced analytics
- Cloud deployment

---

# 👩‍💻 Developer

**Nedunuri Geetha Madhuri**

B.Tech – Artificial Intelligence & Machine Learning

---

# ⭐ Project Goal

AlumniConnectAI aims to bridge the gap between students and alumni by providing a centralized platform for:

**Networking + Mentorship + Skills + Opportunities + Career Growth**

---

## 📌 Project Status

**Active Development**

Core full-stack modules including authentication, profiles, mentorship, messaging, opportunities, community, analytics, dynamic dashboard, and career roadmap have been implemented.
