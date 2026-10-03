import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import "./MentorshipAnalyticsPage.css";

function getToken() {
  return localStorage.getItem("accessToken");
}

function getCurrentRole() {
  return (
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    ""
  ).toUpperCase();
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "SCHEDULED":
      return "Upcoming";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "SCHEDULED":
      return "scheduled";
    case "CANCELLED":
      return "cancelled";
    default:
      return "default";
  }
}

export default function MentorshipAnalyticsPage() {
  const token = getToken();
  const role = getCurrentRole();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        const response = await api.get("/mentorship-analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAnalytics(response.data.data);
      } catch (err) {
        console.error("Unable to load mentorship analytics:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load mentorship analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [token]);

  const overview = analytics?.overview;

  const statusData = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      {
        label: "Completed",
        value: overview.completedSessions || 0,
        className: "completed",
      },
      {
        label: "Upcoming",
        value: overview.upcomingSessions || 0,
        className: "scheduled",
      },
      {
        label: "Cancelled",
        value: overview.cancelledSessions || 0,
        className: "cancelled",
      },
    ];
  }, [overview]);

  const maxStatusValue = Math.max(
    ...statusData.map((item) => item.value),
    1
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="analytics-loading-page">
        <div className="analytics-loading-card">
          <LoaderCircle className="analytics-loading-icon" size={34} />
          <h2>Loading mentorship analytics</h2>
          <p>
            We are preparing your mentorship insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-shell">

        {/* Header */}
        <header className="analytics-header">
          <div className="analytics-header-left">
            <Link
              to="/mentorship-sessions"
              className="analytics-back-link"
            >
              <ArrowLeft size={17} />
              Back to Sessions
            </Link>

            <div className="analytics-title-block">
              <div className="analytics-title-icon">
                <Activity size={22} />
              </div>

              <div>
                <p className="analytics-eyebrow">
                  Mentorship Intelligence
                </p>

                <h1>Mentorship Analytics</h1>

                <p>
                  Track your mentorship activity, progress and
                  engagement in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="analytics-role-badge">
            {role === "ALUMNI" ? "Mentor Dashboard" : "Student Dashboard"}
          </div>
        </header>

        {error && (
          <div className="analytics-error">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!error && analytics && (
          <>
            {/* Overview */}
            <section className="analytics-section">
              <div className="analytics-section-heading">
                <div>
                  <p className="section-kicker">Overview</p>
                  <h2>Your mentorship at a glance</h2>
                </div>

                <div className="live-indicator">
                  <span />
                  Live data
                </div>
              </div>

              <div className="analytics-stat-grid">

                <div className="analytics-stat-card purple">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <Users size={20} />
                    </div>

                    <span className="analytics-stat-label">
                      Active Mentorships
                    </span>
                  </div>

                  <strong>
                    {overview?.activeMentorships || 0}
                  </strong>

                  <p>
                    Accepted mentorship relationships
                  </p>
                </div>

                <div className="analytics-stat-card blue">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <CalendarDays size={20} />
                    </div>

                    <span className="analytics-stat-label">
                      Total Sessions
                    </span>
                  </div>

                  <strong>
                    {overview?.totalSessions || 0}
                  </strong>

                  <p>
                    Sessions created through mentorship
                  </p>
                </div>

                <div className="analytics-stat-card green">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <CheckCircle2 size={20} />
                    </div>

                    <span className="analytics-stat-label">
                      Completed
                    </span>
                  </div>

                  <strong>
                    {overview?.completedSessions || 0}
                  </strong>

                  <p>
                    Successfully completed sessions
                  </p>
                </div>

                <div className="analytics-stat-card orange">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <Clock3 size={20} />
                    </div>

                    <span className="analytics-stat-label">
                      Upcoming
                    </span>
                  </div>

                  <strong>
                    {overview?.upcomingSessions || 0}
                  </strong>

                  <p>
                    Sessions currently scheduled
                  </p>
                </div>

                <div className="analytics-stat-card gold">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <Star size={20} />
                    </div>

                    <span className="analytics-stat-label">
                      Average Rating
                    </span>
                  </div>

                  <strong>
                    {overview?.averageRating || 0}
                    <small>/5</small>
                  </strong>

                  <p>
                    Based on {overview?.totalRatings || 0} rating
                    {overview?.totalRatings === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="analytics-stat-card teal">
                  <div className="analytics-stat-top">
                    <div className="analytics-stat-icon">
                      <TrendingUp size={20} />
                    </div>

                    <span className="analytics-stat-label">
                      Completion Rate
                    </span>
                  </div>

                  <strong>
                    {overview?.completionRate || 0}
                    <small>%</small>
                  </strong>

                  <p>
                    Completed sessions percentage
                  </p>
                </div>

              </div>
            </section>

            {/* Main Analytics */}
            <section className="analytics-main-grid">

              {/* Session Distribution */}
              <div className="analytics-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-kicker">
                      Session Insights
                    </p>

                    <h2>Session distribution</h2>
                  </div>

                  <div className="panel-icon">
                    <Target size={19} />
                  </div>
                </div>

                <div className="distribution-content">
                  {statusData.map((item) => (
                    <div
                      className="distribution-row"
                      key={item.label}
                    >
                      <div className="distribution-label">
                        <span
                          className={`distribution-dot ${item.className}`}
                        />

                        <span>{item.label}</span>

                        <strong>{item.value}</strong>
                      </div>

                      <div className="distribution-bar">
                        <div
                          className={`distribution-fill ${item.className}`}
                          style={{
                            width: `${
                              (item.value / maxStatusValue) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="distribution-footer">
                  <span>
                    Total sessions
                  </span>

                  <strong>
                    {overview?.totalSessions || 0}
                  </strong>
                </div>
              </div>

              {/* Rating */}
              <div className="analytics-panel rating-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-kicker">
                      Feedback
                    </p>

                    <h2>Mentorship rating</h2>
                  </div>

                  <div className="panel-icon gold-icon">
                    <Star size={19} />
                  </div>
                </div>

                <div className="rating-overview">
                  <div className="rating-number">
                    {overview?.averageRating || 0}
                  </div>

                  <div>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          fill={
                            star <=
                            Math.round(
                              overview?.averageRating || 0
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>

                    <p>
                      Average feedback rating
                    </p>
                  </div>
                </div>

                <div className="rating-progress">
                  <div className="rating-progress-header">
                    <span>Feedback received</span>
                    <strong>
                      {overview?.totalRatings || 0}
                    </strong>
                  </div>

                  <div className="rating-progress-track">
                    <div
                      style={{
                        width: `${
                          Math.min(
                            (overview?.totalRatings || 0) * 20,
                            100
                          )
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rating-message">
                  <MessageSquare size={17} />

                  <span>
                    Feedback helps improve the quality of
                    mentorship interactions.
                  </span>
                </div>
              </div>
            </section>

            {/* Recent Sessions */}
            <section className="analytics-panel recent-panel">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">
                    Activity
                  </p>

                  <h2>Recent mentorship sessions</h2>
                </div>

                <Link
                  to="/mentorship-sessions"
                  className="view-all-link"
                >
                  View all
                </Link>
              </div>

              {analytics.recentSessions?.length > 0 ? (
                <div className="recent-session-list">
                  {analytics.recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      to={`/mentorship-sessions/${session.id}`}
                      className="recent-session-item"
                    >
                      <div className="recent-session-icon">
                        <CalendarDays size={18} />
                      </div>

                      <div className="recent-session-main">
                        <h3>{session.title}</h3>

                        <p>
                          Scheduled for{" "}
                          {formatDateTime(session.scheduledAt)}
                        </p>
                      </div>

                      <div className="recent-session-meta">
                        <span
                          className={`analytics-status ${getStatusClass(
                            session.status
                          )}`}
                        >
                          {getStatusLabel(session.status)}
                        </span>

                        <small>
                          Updated{" "}
                          {formatDate(session.updatedAt)}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="analytics-empty">
                  <CalendarDays size={28} />

                  <h3>No sessions yet</h3>

                  <p>
                    Your mentorship sessions will appear here
                    once they are created.
                  </p>

                  <Link
                    to="/mentorship-sessions"
                    className="analytics-primary-link"
                  >
                    Go to Sessions
                  </Link>
                </div>
              )}
            </section>

            {/* Insight */}
            <section className="analytics-insight">
              <div className="insight-icon">
                <TrendingUp size={22} />
              </div>

              <div>
                <p className="section-kicker">
                  Mentorship Insight
                </p>

                <h2>
                  Keep building meaningful mentorship
                  connections.
                </h2>

                <p>
                  Your analytics are calculated from your
                  real mentorship sessions, relationships and
                  feedback activity.
                </p>
              </div>

              <Link
                to="/mentorship-sessions"
                className="insight-action"
              >
                Manage Sessions
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}