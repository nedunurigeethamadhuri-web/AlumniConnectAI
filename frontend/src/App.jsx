import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SkillsPage from "./pages/SkillsPage";
import AlumniSkillsPage from "./pages/AlumniSkillsPage";
import MentorRecommendationsPage from "./pages/MentorRecommendationsPage";
import MentorshipRequestsPage from "./pages/MentorshipRequestsPage";
import MenteesPage from "./pages/MenteesPage";
import MentorshipSessionsPage from "./pages/MentorshipSessionsPage";
import SessionDetailsPage from "./pages/SessionDetailsPage";
import MentorshipAnalyticsPage from "./pages/MentorshipAnalyticsPage";
import MessagesPage from "./pages/MessagesPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import SettingsPage from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import CareerRoadmapPage from "./pages/CareerRoadmapPage";

function HomePage() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          Alumni<span>Connect</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>

          <a href="#how-it-works">How It Works</a>

          <a href="/login" className="login-btn">
            Login
          </a>

          <a href="/register" className="signup-btn">
            Get Started
          </a>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">
              ✨ Intelligent Alumni Networking
            </div>

            <h1>
              Connect. Learn.
              <br />
              <span>Grow Together.</span>
            </h1>

            <p>
              AlumniConnect AI brings students and alumni
              together through intelligent mentor matching,
              career guidance, skill analysis, opportunities
              and meaningful professional connections.
            </p>

            <div className="hero-buttons">
              <a
                href="/register"
                className="primary-btn"
              >
                Get Started
              </a>

              <a
                href="#features"
                className="secondary-btn"
              >
                Explore Platform →
              </a>
            </div>

            <div className="trust-section">
              <div>
                <strong>AI-Powered</strong>
                <span>Mentor Matching</span>
              </div>

              <div>
                <strong>Career</strong>
                <span>Roadmaps</span>
              </div>

              <div>
                <strong>Real-Time</strong>
                <span>Networking</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <div>
                  <span className="small-label">
                    YOUR CAREER JOURNEY
                  </span>

                  <h3>Welcome back, Geetha 👋</h3>
                </div>

                <div className="profile-circle">
                  G
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-info">
                  <span>Career Profile</span>
                  <strong>78%</strong>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  🤖
                </div>

                <div>
                  <strong>AI Career Insight</strong>

                  <p>
                    Your profile matches 8 potential
                    mentors in AI/ML.
                  </p>
                </div>
              </div>

              <div className="mentor-section">
                <div className="section-title">
                  <span>Recommended Mentors</span>
                  <span className="view-all">
                    View all
                  </span>
                </div>

                <div className="mentor">
                  <div className="mentor-avatar">
                    AR
                  </div>

                  <div className="mentor-info">
                    <strong>
                      AI/ML Professional
                    </strong>

                    <span>
                      Senior Software Engineer
                    </span>
                  </div>

                  <div className="match">94%</div>
                </div>

                <div className="mentor">
                  <div className="mentor-avatar second">
                    SK
                  </div>

                  <div className="mentor-info">
                    <strong>
                      Data Science Mentor
                    </strong>

                    <span>
                      Machine Learning Engineer
                    </span>
                  </div>

                  <div className="match">89%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="features"
        >
          <div className="section-heading">
            <span>POWERFUL PLATFORM</span>

            <h2>
              Everything you need to build your career
            </h2>

            <p>
              A complete ecosystem connecting students,
              alumni and opportunities in one intelligent
              platform.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>

              <h3>AI Mentor Matching</h3>

              <p>
                Find mentors based on your skills, career
                goals, industry and interests.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>

              <h3>Skill Gap Analysis</h3>

              <p>
                Understand which skills you need to develop
                for your target career.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🗺️</div>

              <h3>Career Roadmaps</h3>

              <p>
                Get personalized learning paths and
                actionable career milestones.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>

              <h3>Opportunities</h3>

              <p>
                Discover internships, jobs, projects,
                hackathons and referrals.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>

              <h3>Mentorship & Chat</h3>

              <p>
                Communicate with mentors and manage
                structured mentorship sessions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>

              <h3>Alumni Communities</h3>

              <p>
                Join communities, discussions and
                professional networking groups.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="how-it-works"
        >
          <div className="section-heading">
            <span>HOW IT WORKS</span>

            <h2>Your journey starts here</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>

              <h3>Create Your Profile</h3>

              <p>
                Add your education, skills, projects and
                career goals.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>

              <h3>Discover Connections</h3>

              <p>
                Our intelligent system identifies relevant
                mentors and opportunities.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>

              <h3>Grow Your Career</h3>

              <p>
                Learn, collaborate, complete tasks and
                track your progress.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          Alumni<span>Connect</span>
        </div>

        <p>
          © 2026 AlumniConnect AI. Intelligent networking
          for better careers.
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/skills"
          element={<SkillsPage />}
        />

        <Route
          path="/alumni-skills"
          element={<AlumniSkillsPage />}
        />

        <Route
          path="/mentor-recommendations"
          element={<MentorRecommendationsPage />}
        />

        <Route
          path="/mentorship-requests"
          element={<MentorshipRequestsPage />}
        />

        <Route
          path="/mentees"
          element={<MenteesPage />}
        />

        <Route
          path="/mentorship-sessions"
          element={<MentorshipSessionsPage />}
        />

        <Route
          path="/mentorship-sessions/:id"
          element={<SessionDetailsPage />}
        />

        <Route
          path="/mentorship-analytics"
          element={<MentorshipAnalyticsPage />}
        />

        <Route
          path="/messages"
          element={<MessagesPage />}
        />

        <Route
          path="/opportunities"
          element={<OpportunitiesPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="/community"
          element={<CommunityPage />}
        />

        <Route
          path="/career-roadmap"
          element={<CareerRoadmapPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;