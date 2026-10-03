import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import api from "../services/api";
import "./DashboardPage.css";

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

function getSkillScore(level) {
  const scores = {
    BEGINNER: 35,
    INTERMEDIATE: 60,
    ADVANCED: 80,
    EXPERT: 95,
  };

  return scores[level] || 50;
}

function calculateProfileCompletion(user, skills) {
  const profile = user?.studentProfile || {};

  const fields = [
    user?.firstName,
    user?.lastName,
    user?.email,
    profile?.college,
    profile?.branch,
    profile?.graduationYear,
    profile?.careerGoal,
    profile?.bio,
    profile?.githubUrl,
    profile?.linkedinUrl,
  ];

  const filledFields = fields.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  ).length;

  const basicScore = Math.round(
    (filledFields / fields.length) * 100
  );

  const skillBonus = Math.min(skills.length * 3, 15);

  return Math.min(100, basicScore + skillBonus);
}

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userResponse = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = userResponse.data.user;

        setUser(currentUser);

        const skillsEndpoint =
          currentUser.role === "ALUMNI"
            ? "/alumni/skills"
            : "/skills";

        const [
          skillsResponse,
          mentorResponse,
          opportunityResponse,
          sessionResponse,
        ] = await Promise.allSettled([
          api.get(skillsEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          currentUser.role === "STUDENT"
            ? api.get("/alumni/recommendations", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
            : Promise.resolve(null),

          api.get("/opportunities", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          api.get("/sessions", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (skillsResponse.status === "fulfilled") {
          setSkills(
            skillsResponse.value.data?.data?.skills || []
          );
        }

        if (
          mentorResponse.status === "fulfilled" &&
          mentorResponse.value
        ) {
          setRecommendations(
            mentorResponse.value.data?.data?.recommendations ||
              []
          );
        }

        if (opportunityResponse.status === "fulfilled") {
          setOpportunities(
            opportunityResponse.value.data?.data?.opportunities ||
              []
          );
        }

        if (sessionResponse.status === "fulfilled") {
          setSessions(
            sessionResponse.value.data?.data?.sessions || []
          );
        }
      } catch (error) {
        console.error(
          "Unable to load dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  }

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  const skillCount = skills.length;

  const profileCompletion = useMemo(() => {
    if (!user) return 0;

    if (user.profileCompletion !== undefined) {
      return Number(user.profileCompletion);
    }

    return calculateProfileCompletion(
      user,
      skills
    );
  }, [user, skills]);

  const technicalSkills = useMemo(() => {
    if (!skills.length) return 0;

    const total = skills.reduce(
      (sum, skill) =>
        sum + getSkillScore(skill.level),
      0
    );

    return Math.round(total / skills.length);
  }, [skills]);

  const profileStrength = profileCompletion;

  const careerDirection = useMemo(() => {
    const profile = user?.studentProfile || {};

    const careerGoal =
      profile?.careerGoal ||
      user?.careerGoal ||
      user?.targetCareer ||
      "";

    const hasCareerGoal =
      String(careerGoal).trim().length > 0;

    const hasBranch =
      String(profile?.branch || "").trim().length > 0;

    if (hasCareerGoal && hasBranch) {
      return 100;
    }

    if (hasCareerGoal || hasBranch) {
      return 75;
    }

    return 50;
  }, [user]);

  const careerReadiness = useMemo(() => {
    return Math.round(
      technicalSkills * 0.4 +
        profileStrength * 0.3 +
        careerDirection * 0.3
    );
  }, [
    technicalSkills,
    profileStrength,
    careerDirection,
  ]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status === "SCHEDULED" &&
          new Date(session.scheduledAt) > new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) -
          new Date(b.scheduledAt)
      );
  }, [sessions]);

  const getSessionPerson = (session) => {
    if (user?.role === "ALUMNI") {
      return session.student;
    }

    return session.alumni;
  };

  const getPersonName = (person) => {
    return (
      `${person?.firstName || ""} ${
        person?.lastName || ""
      }`.trim() || "Mentor"
    );
  };

  const getSessionSubtitle = (session) => {
    const person = getSessionPerson(session);

    if (user?.role === "ALUMNI") {
      return (
        person?.studentProfile?.branch ||
        person?.studentProfile?.college ||
        "Student"
      );
    }

    const company =
      person?.alumniProfile?.company;

    const designation =
      person?.alumniProfile?.designation;

    if (company && designation) {
      return `${designation} · ${company}`;
    }

    return (
      designation ||
      company ||
      "Alumni Mentor"
    );
  };

  const formatSessionDate = (date) => {
    const value = new Date(date);

    return {
      day: value.toLocaleDateString("en-IN", {
        day: "2-digit",
      }),
      month: value
        .toLocaleDateString("en-IN", {
          month: "short",
        })
        .toUpperCase(),
    };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const firstName = user.firstName || "User";
  const fullName = `${user.firstName || ""} ${
    user.lastName || ""
  }`.trim();

  const initials = getInitials(fullName || firstName);

  const isAlumni = user.role === "ALUMNI";

  const profileLabel = isAlumni
    ? "Alumni"
    : "Student";

  const dashboardLabel = isAlumni
    ? "ALUMNI DASHBOARD"
    : "STUDENT DASHBOARD";

  return (
    <div className="dashboard-page">
      <aside
        className={
          sidebarOpen
            ? "dashboard-sidebar open"
            : "dashboard-sidebar"
        }
      >
        <div className="sidebar-top">
          <a href="/" className="dashboard-logo">
            Alumni<span>Connect</span>
          </a>

          <button
            className="close-sidebar"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {initials}
          </div>

          <div>
            <strong>{fullName}</strong>
            <span>{profileLabel}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">
            MAIN
          </div>

          <a
            href="#dashboard"
            className="dashboard-nav-item active"
            onClick={closeMobileSidebar}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <Link
            to="/profile"
            className="dashboard-nav-item"
            onClick={closeMobileSidebar}
          >
            <CircleUserRound size={19} />
            <span>My Profile</span>
          </Link>

          {isAlumni ? (
            <>
              <a
                href="#mentees"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <Users size={19} />
                <span>Mentees</span>
                <span className="nav-count">
                  6
                </span>
              </a>

              <Link
                to="/alumni-skills"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <Target size={19} />
                <span>My Skills</span>
              </Link>

              <a
                href="#requests"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <MessageCircle size={19} />
                <span>Mentorship Requests</span>
                <span className="nav-count">
                  3
                </span>
              </a>

              <a
                href="#sessions"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <CalendarDays size={19} />
                <span>Sessions</span>
              </a>
            </>
          ) : (
            <>
              <Link
                to="/mentor-recommendations"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <Users size={19} />
                <span>Mentors</span>
                <span className="nav-count">
                  {recommendations.length}
                </span>
              </Link>

              <Link
                to="/skills"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <Target size={19} />
                <span>Skills</span>
              </Link>

              <Link
                to="/career-roadmap"
                className="dashboard-nav-item"
                onClick={closeMobileSidebar}
              >
                <TrendingUp size={19} />
                <span>Career Roadmap</span>
              </Link>
            </>
          )}

          <div className="nav-section-label second-label">
            NETWORK
          </div>

          <Link
            to="/opportunities"
            className="dashboard-nav-item"
            onClick={closeMobileSidebar}
          >
            <BriefcaseBusiness size={19} />
            <span>Opportunities</span>
          </Link>

          <Link
            to="/messages"
            className="dashboard-nav-item"
            onClick={closeMobileSidebar}
          >
            <MessageCircle size={19} />
            <span>Messages</span>
          </Link>

          <Link
            to="/community"
            className="dashboard-nav-item"
            onClick={closeMobileSidebar}
          >
            <GraduationCap size={19} />
            <span>Community</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link
            to="/settings"
            className="dashboard-nav-item"
            onClick={closeMobileSidebar}
          >
            <Settings size={19} />
            <span>Settings</span>
          </Link>

          <button
            className="dashboard-nav-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        ></div>
      )}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="header-label">
                {dashboardLabel}
              </p>

              <h1>
                Welcome back, {firstName}{" "}
                <span>👋</span>
              </h1>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="header-icon"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <button
              className="header-icon notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span></span>
            </button>

            <Link
              to="/profile"
              className="header-avatar"
            >
              {initials}
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          {isAlumni ? (
            <>
              <section className="dashboard-welcome">
                <div>
                  <span className="welcome-badge">
                    <Sparkles size={14} />
                    AI-POWERED MENTOR PLATFORM
                  </span>

                  <h2>
                    Share your experience with
                    <span>
                      {" "}
                      the next generation.
                    </span>
                  </h2>

                  <p>
                    Guide students, share your
                    industry experience, and help
                    them move closer to their career
                    goals.
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="complete-profile-button"
                >
                  Manage profile
                  <ChevronRight size={17} />
                </Link>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <CircleUserRound size={20} />
                  </div>

                  <div className="stat-content">
                    <span>Profile status</span>
                    <strong>Active</strong>
                  </div>

                  <small>
                    Public mentor profile
                  </small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Users size={20} />
                  </div>

                  <div className="stat-content">
                    <span>Active mentees</span>
                    <strong>6</strong>
                  </div>

                  <small>
                    2 new this month
                  </small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <Target size={20} />
                  </div>

                  <div className="stat-content">
                    <span>Skills offered</span>
                    <strong>{skillCount}</strong>
                  </div>

                  <small>
                    Available for matching
                  </small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <CalendarDays size={20} />
                  </div>

                  <div className="stat-content">
                    <span>Sessions</span>
                    <strong>
                      {sessions.length}
                    </strong>
                  </div>

                  <small>
                    {upcomingSessions.length} upcoming
                  </small>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="dashboard-card large-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        MENTOR IMPACT
                      </span>

                      <h3>
                        Your mentoring snapshot
                      </h3>
                    </div>

                    <div className="ai-card-icon">
                      <Sparkles size={18} />
                    </div>
                  </div>

                  <div className="career-snapshot">
                    <div className="snapshot-main">
                      <div className="snapshot-circle">
                        <span>92</span>
                        <small>%</small>
                      </div>

                      <div>
                        <strong>
                          Mentor engagement
                        </strong>

                        <p>
                          Your mentoring activity is
                          helping students stay
                          connected and focused.
                        </p>
                      </div>
                    </div>

                    <div className="snapshot-items">
                      <div>
                        <span>
                          Response Rate
                        </span>
                        <strong>96%</strong>
                      </div>

                      <div>
                        <span>
                          Session Completion
                        </span>
                        <strong>94%</strong>
                      </div>

                      <div>
                        <span>
                          Student Feedback
                        </span>
                        <strong>4.8/5</strong>
                      </div>
                    </div>
                  </div>

                  <div className="ai-recommendation">
                    <div className="recommendation-icon">
                      💡
                    </div>

                    <div>
                      <strong>
                        AI Mentor Insight
                      </strong>

                      <p>
                        Students interested in DSA
                        and backend development can
                        benefit from your expertise.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card mentors-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        STUDENT MATCHING
                      </span>

                      <h3>
                        Recommended students
                      </h3>
                    </div>

                    <a href="#mentees">
                      View all
                    </a>
                  </div>

                  <div className="mentor-list">
                    <div className="dashboard-mentor">
                      <div className="mentor-avatar purple-avatar">
                        GM
                      </div>

                      <div className="dashboard-mentor-info">
                        <strong>
                          AI/ML Student
                        </strong>

                        <span>
                          DSA • Python • ML
                        </span>
                      </div>

                      <div className="match-score">
                        94%
                      </div>
                    </div>

                    <div className="dashboard-mentor">
                      <div className="mentor-avatar blue-avatar">
                        AS
                      </div>

                      <div className="dashboard-mentor-info">
                        <strong>
                          Software Engineering
                          Student
                        </strong>

                        <span>
                          Java • Backend • DSA
                        </span>
                      </div>

                      <div className="match-score">
                        89%
                      </div>
                    </div>

                    <div className="dashboard-mentor">
                      <div className="mentor-avatar green-avatar">
                        RK
                      </div>

                      <div className="dashboard-mentor-info">
                        <strong>
                          Final Year Student
                        </strong>

                        <span>
                          Placements • Java •
                          Projects
                        </span>
                      </div>

                      <div className="match-score">
                        86%
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="dashboard-grid bottom-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        UPCOMING
                      </span>

                      <h3>
                        Mentorship sessions
                      </h3>
                    </div>

                    <CalendarDays size={20} />
                  </div>

                  {upcomingSessions.length > 0 ? (
                    upcomingSessions
                      .slice(0, 2)
                      .map((session) => {
                        const date =
                          formatSessionDate(
                            session.scheduledAt
                          );

                        const person =
                          getSessionPerson(session);

                        return (
                          <div
                            className="session-card"
                            key={session.id}
                          >
                            <div className="session-date">
                              <strong>
                                {date.day}
                              </strong>

                              <span>
                                {date.month}
                              </span>
                            </div>

                            <div className="session-details">
                              <strong>
                                {session.title ||
                                  "Mentorship Session"}
                              </strong>

                              <span>
                                {getSessionSubtitle(
                                  session
                                )}
                              </span>

                              <small>
                                {new Date(
                                  session.scheduledAt
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </small>
                            </div>

                            <ChevronRight size={18} />
                          </div>
                        );
                      })
                  ) : (
                    <div className="ai-recommendation">
                      <div className="recommendation-icon">
                        📅
                      </div>

                      <div>
                        <strong>
                          No upcoming sessions
                        </strong>

                        <p>
                          Your scheduled mentorship
                          sessions will appear here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        EXPERTISE
                      </span>

                      <h3>Your skills</h3>
                    </div>

                    <Link to="/alumni-skills">
                      Manage
                    </Link>
                  </div>

                  {skills.length > 0 ? (
                    <div className="skill-progress-list">
                      {skills
                        .slice(0, 4)
                        .map((item) => (
                          <div
                            className="skill-row"
                            key={item.id}
                          >
                            <div>
                              <span>
                                {item.skill?.name ||
                                  "Skill"}
                              </span>

                              <strong>
                                {item.level ||
                                  "INTERMEDIATE"}
                              </strong>
                            </div>

                            <div className="skill-bar">
                              <div
                                style={{
                                  width: `${getSkillScore(
                                    item.level
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="ai-recommendation">
                      <div className="recommendation-icon">
                        🎯
                      </div>

                      <div>
                        <strong>
                          Add your expertise
                        </strong>

                        <p>
                          Add your technical skills
                          so the AI matching engine
                          can connect you with
                          relevant students.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="quick-actions">
                <div className="quick-action-heading">
                  <span>
                    QUICK ACTIONS
                  </span>

                  <h3>
                    Manage your mentoring journey
                  </h3>
                </div>

                <div className="quick-action-grid">
                  <a
                    href="#mentees"
                    className="quick-action"
                  >
                    <div>
                      <Users size={21} />
                    </div>

                    <span>View mentees</span>
                    <ChevronRight size={17} />
                  </a>

                  <a
                    href="#requests"
                    className="quick-action"
                  >
                    <div>
                      <MessageCircle size={21} />
                    </div>

                    <span>
                      Review requests
                    </span>

                    <ChevronRight size={17} />
                  </a>

                  <a
                    href="#sessions"
                    className="quick-action"
                  >
                    <div>
                      <CalendarDays size={21} />
                    </div>

                    <span>
                      Manage sessions
                    </span>

                    <ChevronRight size={17} />
                  </a>

                  <Link
                    to="/profile"
                    className="quick-action"
                  >
                    <div>
                      <CircleUserRound size={21} />
                    </div>

                    <span>
                      Update profile
                    </span>

                    <ChevronRight size={17} />
                  </Link>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="dashboard-welcome">
                <div>
                  <span className="welcome-badge">
                    <Sparkles size={14} />
                    AI-POWERED CAREER PLATFORM
                  </span>

                  <h2>
                    Build your career with
                    <span>
                      {" "}
                      the right connections.
                    </span>
                  </h2>

                  <p>
                    Complete your profile and let
                    AlumniConnect AI discover
                    mentors, opportunities and
                    career paths that match your
                    goals.
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="complete-profile-button"
                >
                  Complete profile
                  <ChevronRight size={17} />
                </Link>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <CircleUserRound size={20} />
                  </div>

                  <div className="stat-content">
                    <span>
                      Profile completion
                    </span>

                    <strong>
                      {profileCompletion}%
                    </strong>
                  </div>

                  <div className="mini-progress">
                    <div
                      style={{
                        width: `${profileCompletion}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Users size={20} />
                  </div>

                  <div className="stat-content">
                    <span>
                      Mentor matches
                    </span>

                    <strong>
                      {recommendations.length}
                    </strong>
                  </div>

                  <small>
                    AI compatibility matches
                  </small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <Target size={20} />
                  </div>

                  <div className="stat-content">
                    <span>
                      Skills tracked
                    </span>

                    <strong>
                      {skillCount}
                    </strong>
                  </div>

                  <small>
                    Skills in your profile
                  </small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div className="stat-content">
                    <span>
                      Opportunities
                    </span>

                    <strong>
                      {opportunities.length}
                    </strong>
                  </div>

                  <small>
                    Available opportunities
                  </small>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="dashboard-card large-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        AI INSIGHT
                      </span>

                      <h3>
                        Your career snapshot
                      </h3>
                    </div>

                    <div className="ai-card-icon">
                      <Sparkles size={18} />
                    </div>
                  </div>

                  <div className="career-snapshot">
                    <div className="snapshot-main">
                      <div className="snapshot-circle">
                        <span>
                          {careerReadiness}
                        </span>

                        <small>%</small>
                      </div>

                      <div>
                        <strong>
                          Career readiness
                        </strong>

                        <p>
                          Your readiness score is
                          calculated from your
                          skills, profile strength
                          and career direction.
                        </p>
                      </div>
                    </div>

                    <div className="snapshot-items">
                      <div>
                        <span>
                          Technical Skills
                        </span>

                        <strong>
                          {technicalSkills}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Profile Strength
                        </span>

                        <strong>
                          {profileStrength}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Career Direction
                        </span>

                        <strong>
                          {careerDirection}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="ai-recommendation">
                    <div className="recommendation-icon">
                      💡
                    </div>

                    <div>
                      <strong>
                        AI Recommendation
                      </strong>

                      <p>
                        {skillCount === 0
                          ? "Add your first skills to improve your mentor matching."
                          : recommendations.length === 0
                          ? "Add more relevant skills to discover compatible alumni mentors."
                          : profileCompletion < 70
                          ? "Complete more profile information to improve your career matching."
                          : careerDirection < 75
                          ? "Add your target career goal to improve your career direction score."
                          : "Your profile is ready for stronger mentor and opportunity matching."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card mentors-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        AI MATCHING
                      </span>

                      <h3>
                        Recommended mentors
                      </h3>
                    </div>

                    <Link to="/mentor-recommendations">
                      View all
                    </Link>
                  </div>

                  <div className="mentor-list">
                    {recommendations.length > 0 ? (
                      recommendations
                        .slice(0, 3)
                        .map((mentor, index) => {
                          const avatarClasses = [
                            "purple-avatar",
                            "blue-avatar",
                            "green-avatar",
                          ];

                          return (
                            <div
                              className="dashboard-mentor"
                              key={
                                mentor.alumniId ||
                                mentor.id ||
                                index
                              }
                            >
                              <div
                                className={`mentor-avatar ${
                                  avatarClasses[
                                    index
                                  ]
                                }`}
                              >
                                {mentor.profileImage ? (
                                  <img
                                    src={
                                      mentor.profileImage
                                    }
                                    alt={
                                      mentor.name ||
                                      "Mentor"
                                    }
                                  />
                                ) : (
                                  getInitials(
                                    mentor.name ||
                                      "Mentor"
                                  )
                                )}
                              </div>

                              <div className="dashboard-mentor-info">
                                <strong>
                                  {mentor.name ||
                                    "Alumni Mentor"}
                                </strong>

                                <span>
                                  {mentor.designation ||
                                    mentor.company ||
                                    "Experienced Professional"}
                                </span>
                              </div>

                              <div className="match-score">
                                {Number(
                                  mentor.matchScore || 0
                                )}
                                %
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="ai-recommendation">
                        <div className="recommendation-icon">
                          👥
                        </div>

                        <div>
                          <strong>
                            No matches yet
                          </strong>

                          <p>
                            Add skills to discover
                            suitable alumni mentors.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-grid bottom-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        UPCOMING
                      </span>

                      <h3>
                        Mentorship sessions
                      </h3>
                    </div>

                    <CalendarDays size={20} />
                  </div>

                  {upcomingSessions.length > 0 ? (
                    upcomingSessions
                      .slice(0, 2)
                      .map((session) => {
                        const date =
                          formatSessionDate(
                            session.scheduledAt
                          );

                        return (
                          <div
                            className="session-card"
                            key={session.id}
                          >
                            <div className="session-date">
                              <strong>
                                {date.day}
                              </strong>

                              <span>
                                {date.month}
                              </span>
                            </div>

                            <div className="session-details">
                              <strong>
                                {session.title ||
                                  "Mentorship Session"}
                              </strong>

                              <span>
                                {getSessionSubtitle(
                                  session
                                )}
                              </span>

                              <small>
                                {new Date(
                                  session.scheduledAt
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </small>
                            </div>

                            <ChevronRight size={18} />
                          </div>
                        );
                      })
                  ) : (
                    <div className="ai-recommendation">
                      <div className="recommendation-icon">
                        📅
                      </div>

                      <div>
                        <strong>
                          No upcoming sessions
                        </strong>

                        <p>
                          Your mentorship schedule
                          will appear here once a
                          session is booked.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <span className="card-eyebrow">
                        YOUR PROGRESS
                      </span>

                      <h3>
                        Skill development
                      </h3>
                    </div>

                    <Link to="/skills">
                      View skills
                    </Link>
                  </div>

                  {skills.length > 0 ? (
                    <div className="skill-progress-list">
                      {skills
                        .slice(0, 4)
                        .map((item) => {
                          const score =
                            getSkillScore(
                              item.level
                            );

                          return (
                            <div
                              className="skill-row"
                              key={item.id}
                            >
                              <div>
                                <span>
                                  {item.skill?.name ||
                                    "Skill"}
                                </span>

                                <strong>
                                  {score}%
                                </strong>
                              </div>

                              <div className="skill-bar">
                                <div
                                  style={{
                                    width: `${score}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="ai-recommendation">
                      <div className="recommendation-icon">
                        🎯
                      </div>

                      <div>
                        <strong>
                          Start building your skills
                        </strong>

                        <p>
                          Add your technical skills
                          to start tracking your
                          career development.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="quick-actions">
                <div className="quick-action-heading">
                  <span>
                    QUICK ACTIONS
                  </span>

                  <h3>
                    What would you like to do?
                  </h3>
                </div>

                <div className="quick-action-grid">
                  <Link
                    to="/mentor-recommendations"
                    className="quick-action"
                  >
                    <div>
                      <Users size={21} />
                    </div>

                    <span>
                      Find a mentor
                    </span>

                    <ChevronRight size={17} />
                  </Link>

                  <Link
                    to="/opportunities"
                    className="quick-action"
                  >
                    <div>
                      <BriefcaseBusiness
                        size={21}
                      />
                    </div>

                    <span>
                      Explore opportunities
                    </span>

                    <ChevronRight size={17} />
                  </Link>

                  <Link
                    to="/career-roadmap"
                    className="quick-action"
                  >
                    <div>
                      <TrendingUp size={21} />
                    </div>

                    <span>
                      View career roadmap
                    </span>

                    <ChevronRight size={17} />
                  </Link>

                  <Link
                    to="/profile"
                    className="quick-action"
                  >
                    <div>
                      <CircleUserRound
                        size={21}
                      />
                    </div>

                    <span>
                      Update profile
                    </span>

                    <ChevronRight size={17} />
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;