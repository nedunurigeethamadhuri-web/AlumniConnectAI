import { useEffect, useMemo, useState } from "react";

import { Link, Navigate } from "react-router-dom";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Plus,
  Star,
  Sparkles,
  Target,
  Link2,
  X,
} from "lucide-react";

import api from "../services/api";
import "./MentorshipSessionsPage.css";

function MentorshipSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [userRole, setUserRole] = useState("");

  const [activeTab, setActiveTab] = useState("upcoming");

  const [showScheduleModal, setShowScheduleModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showCompleteModal, setShowCompleteModal] =
    useState(false);

  const [showFeedbackModal, setShowFeedbackModal] =
    useState(false);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    mentorshipRequestId: "",
    title: "",
    agenda: "",
    meetingUrl: "",
    scheduledAt: "",
    duration: "60",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    agenda: "",
    meetingUrl: "",
    scheduledAt: "",
    duration: "60",
  });

  const [completeForm, setCompleteForm] = useState({
    summary: "",
    actionItems: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    comments: "",
    strengths: "",
    improvement: "",
  });

  const getToken = () =>
    localStorage.getItem("accessToken");

  const getCurrentRole = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      return user?.role || "";
    } catch {
      return "";
    }
  };

  const loadSessions = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await api.get("/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSessions(
        response.data.data?.sessions || []
      );
    } catch (err) {
      console.error(
        "Unable to load mentorship sessions:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load mentorship sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * IMPORTANT:
   * role is passed directly from useEffect.
   * This avoids reading stale userRole state.
   */
  const loadMentees = async (role = userRole) => {
    const token = getToken();

    if (!token || role !== "ALUMNI") {
      return;
    }

    try {
      const response = await api.get("/mentees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMentees(
        response.data.data?.mentees || []
      );
    } catch (err) {
      console.error(
        "Unable to load mentees:",
        err
      );
    }
  };

  useEffect(() => {
    const role = getCurrentRole();

    setUserRole(role);

    loadSessions();

    if (role === "ALUMNI") {
      loadMentees(role);
    }
  }, []);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status === "SCHEDULED" &&
          new Date(session.scheduledAt) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) -
          new Date(b.scheduledAt)
      );
  }, [sessions]);

  const completedSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status === "COMPLETED"
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt) -
          new Date(a.scheduledAt)
      );
  }, [sessions]);

  const cancelledSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.status === "CANCELLED"
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt) -
          new Date(a.scheduledAt)
      );
  }, [sessions]);

  const visibleSessions =
    activeTab === "upcoming"
      ? upcomingSessions
      : activeTab === "completed"
      ? completedSessions
      : cancelledSessions;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatDateTimeInput = (date) => {
    const value = new Date(date);

    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    const hours = String(
      value.getHours()
    ).padStart(2, "0");

    const minutes = String(
      value.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getPersonName = (person) => {
    return (
      `${person?.firstName || ""} ${
        person?.lastName || ""
      }`.trim() || "User"
    );
  };

  const getInitials = (person) => {
    const first =
      person?.firstName?.charAt(0) || "";

    const last =
      person?.lastName?.charAt(0) || "";

    return (
      `${first}${last}`.toUpperCase() || "U"
    );
  };

  const getSessionPerson = (session) => {
    if (userRole === "ALUMNI") {
      return session.student;
    }

    return session.alumni;
  };

  const getSessionPersonSubtitle = (session) => {
    if (userRole === "ALUMNI") {
      return (
        session.student?.studentProfile?.branch ||
        session.student?.studentProfile?.college ||
        "Student"
      );
    }

    const company =
      session.alumni?.alumniProfile?.company;

    const designation =
      session.alumni?.alumniProfile?.designation;

    if (company && designation) {
      return `${designation} · ${company}`;
    }

    return (
      designation ||
      company ||
      "Alumni Mentor"
    );
  };

  const getStatusLabel = (status) => {
    if (status === "COMPLETED") {
      return "Completed";
    }

    if (status === "CANCELLED") {
      return "Cancelled";
    }

    return "Scheduled";
  };

  const getStatusClass = (status) => {
    if (status === "COMPLETED") {
      return "status-completed";
    }

    if (status === "CANCELLED") {
      return "status-cancelled";
    }

    return "status-scheduled";
  };

  const openScheduleModal = () => {
    setActionError("");

    setScheduleForm({
      mentorshipRequestId:
        mentees[0]?.id || "",
      title: "",
      agenda: "",
      meetingUrl: "",
      scheduledAt: "",
      duration: "60",
    });

    setShowScheduleModal(true);
  };

  const openEditModal = (session) => {
    setActionError("");
    setSelectedSession(session);

    setEditForm({
      title: session.title || "",
      agenda: session.agenda || "",
      meetingUrl: session.meetingUrl || "",
      scheduledAt: formatDateTimeInput(
        session.scheduledAt
      ),
      duration: String(
        session.duration || 60
      ),
    });

    setShowEditModal(true);
  };

  const openFeedbackModal = (session) => {
    setActionError("");
    setSelectedSession(session);

    setFeedbackForm({
      rating: session.feedback?.rating || 0,
      comments: session.feedback?.comments || "",
      strengths: session.feedback?.strengths || "",
      improvement:
        session.feedback?.improvement || "",
    });

    setShowFeedbackModal(true);
  };

  const openCompleteModal = (session) => {
    setActionError("");
    setSelectedSession(session);

    setCompleteForm({
      summary: session.summary || "",
      actionItems: session.actionItems || "",
    });

    setShowCompleteModal(true);
  };

  const closeModals = () => {
    if (actionLoading) {
      return;
    }

    setShowScheduleModal(false);
    setShowEditModal(false);
    setShowCompleteModal(false);
    setShowFeedbackModal(false);
    setSelectedSession(null);
    setActionError("");
  };

  const handleScheduleChange = (event) => {
    const { name, value } = event.target;

    setScheduleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;

    setFeedbackForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCompleteChange = (event) => {
    const { name, value } = event.target;

    setCompleteForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await api.post(
        "/sessions",
        {
          ...scheduleForm,
          scheduledAt: new Date(
            scheduleForm.scheduledAt
          ).toISOString(),
          duration: Number(
            scheduleForm.duration
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeModals();

      await loadSessions();
    } catch (err) {
      console.error(
        "Unable to schedule session:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Unable to schedule session."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSession) {
      return;
    }

    const token = getToken();

    setActionLoading(true);
    setActionError("");

    try {
      await api.patch(
        `/sessions/${selectedSession.id}`,
        {
          ...editForm,
          scheduledAt: new Date(
            editForm.scheduledAt
          ).toISOString(),
          duration: Number(
            editForm.duration
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeModals();

      await loadSessions();
    } catch (err) {
      console.error(
        "Unable to update session:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Unable to update session."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedSession) {
      return;
    }

    const token = getToken();

    setActionLoading(true);
    setActionError("");

    try {
      await api.patch(
        `/sessions/${selectedSession.id}/complete`,
        completeForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeModals();

      await loadSessions();

      setActiveTab("completed");
    } catch (err) {
      console.error(
        "Unable to complete session:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Unable to complete session."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedSession) {
      return;
    }

    if (!feedbackForm.rating) {
      setActionError(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }

    const token = getToken();

    setActionLoading(true);
    setActionError("");

    try {
      await api.post(
        `/sessions/${selectedSession.id}/feedback`,
        {
          rating: Number(
            feedbackForm.rating
          ),
          comments: feedbackForm.comments,
          strengths: feedbackForm.strengths,
          improvement:
            feedbackForm.improvement,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeModals();

      await loadSessions();
    } catch (err) {
      console.error(
        "Unable to submit feedback:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Unable to submit feedback."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSession = async (
    session
  ) => {
    const shouldCancel = window.confirm(
      `Cancel "${session.title}"?`
    );

    if (!shouldCancel) {
      return;
    }

    const token = getToken();

    setActionLoading(true);
    setActionError("");

    try {
      await api.patch(
        `/sessions/${session.id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadSessions();

      setActiveTab("cancelled");
    } catch (err) {
      console.error(
        "Unable to cancel session:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Unable to cancel session."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div className="sessions-page">
      <div className="sessions-container">

        {/* ================= HEADER ================= */}

        <header className="sessions-header">
          <div>
            <Link
              to="/dashboard"
              className="sessions-back-link"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <div className="sessions-title-row">
              <div className="sessions-title-icon">
                <CalendarDays size={25} />
              </div>

              <div>
                <span className="sessions-eyebrow">
                  MENTORSHIP WORKSPACE
                </span>

                <h1>
                  Mentorship Sessions
                </h1>

                <p>
                  Plan meaningful mentoring
                  conversations, stay organized
                  and turn every session into
                  measurable career progress.
                </p>
              </div>
            </div>
          </div>

          {userRole === "ALUMNI" && (
            <div
              className="sessions-header-actions"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/mentorship-analytics"
                className="schedule-main-button analytics-main-button"
                style={{
                  textDecoration: "none",
                }}
              >
                <BarChart3 size={18} />
                Analytics
              </Link>

              <button
                type="button"
                className="schedule-main-button"
                onClick={openScheduleModal}
              >
                <Plus size={18} />
                Schedule Session
              </button>
            </div>
          )}
        </header>

        {/* ================= GLOBAL ERROR ================= */}

        {actionError &&
          !showScheduleModal &&
          !showEditModal &&
          !showCompleteModal &&
          !showFeedbackModal && (
            <div className="global-action-error">
              <span>{actionError}</span>

              <button
                type="button"
                onClick={() =>
                  setActionError("")
                }
              >
                <X size={16} />
              </button>
            </div>
          )}

        {/* ================= SUMMARY ================= */}

        <section className="session-summary">

          <div className="summary-card">
            <div className="summary-icon purple">
              <Clock3 size={19} />
            </div>

            <div>
              <strong>
                {upcomingSessions.length}
              </strong>

              <span>Upcoming</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">
              <Check size={19} />
            </div>

            <div>
              <strong>
                {completedSessions.length}
              </strong>

              <span>Completed</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon blue">
              <CalendarDays size={19} />
            </div>

            <div>
              <strong>
                {sessions.length}
              </strong>

              <span>Total Sessions</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon orange">
              <Target size={19} />
            </div>

            <div>
              <strong>
                {mentees.length}
              </strong>

              <span>
                {userRole === "ALUMNI"
                  ? "Active Mentees"
                  : "Mentorships"}
              </span>
            </div>
          </div>

        </section>

        {/* ================= TABS ================= */}

        <div className="session-tabs">

          <button
            type="button"
            className={
              activeTab === "upcoming"
                ? "session-tab active"
                : "session-tab"
            }
            onClick={() =>
              setActiveTab("upcoming")
            }
          >
            Upcoming
            <span>
              {upcomingSessions.length}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "completed"
                ? "session-tab active"
                : "session-tab"
            }
            onClick={() =>
              setActiveTab("completed")
            }
          >
            Completed
            <span>
              {completedSessions.length}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "cancelled"
                ? "session-tab active"
                : "session-tab"
            }
            onClick={() =>
              setActiveTab("cancelled")
            }
          >
            Cancelled
            <span>
              {cancelledSessions.length}
            </span>
          </button>

        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="sessions-state">
            <LoaderCircle
              className="sessions-spinner"
              size={38}
            />

            <h3>
              Loading your sessions...
            </h3>

            <p>
              Fetching your mentorship schedule.
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div className="sessions-state error">
            <div className="state-error-icon">
              !
            </div>

            <h3>
              Unable to load sessions
            </h3>

            <p>{error}</p>

            <button
              type="button"
              className="retry-button"
              onClick={() => {
                setLoading(true);
                loadSessions();
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          visibleSessions.length === 0 && (
            <div className="sessions-state">

              <div className="empty-session-icon">
                <CalendarDays size={34} />
              </div>

              <h3>
                {activeTab === "upcoming"
                  ? "No upcoming sessions"
                  : activeTab === "completed"
                  ? "No completed sessions yet"
                  : "No cancelled sessions"}
              </h3>

              <p>
                {activeTab === "upcoming" &&
                userRole === "ALUMNI"
                  ? "Schedule your next mentoring conversation with one of your active mentees."
                  : activeTab === "upcoming"
                  ? "Your upcoming mentorship sessions will appear here."
                  : activeTab === "completed"
                  ? "Completed mentorship sessions and their outcomes will appear here."
                  : "Cancelled sessions will appear here."}
              </p>

              {userRole === "ALUMNI" &&
                activeTab === "upcoming" &&
                mentees.length > 0 && (
                  <button
                    type="button"
                    className="empty-schedule-button"
                    onClick={
                      openScheduleModal
                    }
                  >
                    <Plus size={17} />
                    Schedule First Session
                  </button>
                )}

            </div>
          )}

        {/* ================= SESSION LIST ================= */}

        {!loading &&
          !error &&
          visibleSessions.length > 0 && (
            <section className="sessions-content">

              <div className="sessions-section-heading">
                <div>
                  <span>
                    {activeTab === "upcoming"
                      ? "YOUR SCHEDULE"
                      : activeTab === "completed"
                      ? "SESSION HISTORY"
                      : "CANCELLED SESSIONS"}
                  </span>

                  <h2>
                    {activeTab === "upcoming"
                      ? "Upcoming mentorship conversations"
                      : activeTab === "completed"
                      ? "Completed mentorship sessions"
                      : "Previously cancelled sessions"}
                  </h2>
                </div>
              </div>

              <div className="sessions-list">

                {visibleSessions.map(
                  (session) => {
                    const person =
                      getSessionPerson(
                        session
                      );

                    return (
                      <article
                        className="session-card"
                        key={session.id}
                      >

                        {/* ===== CARD TOP ===== */}

                        <div className="session-card-top">

                          <div className="session-date-block">
                            <span>
                              {formatDate(
                                session.scheduledAt
                              )}
                            </span>

                            <strong>
                              {formatTime(
                                session.scheduledAt
                              )}
                            </strong>
                          </div>

                          <div
                            className={`session-status ${getStatusClass(
                              session.status
                            )}`}
                          >
                            {session.status ===
                              "COMPLETED" && (
                              <Check size={14} />
                            )}

                            {session.status ===
                              "SCHEDULED" && (
                              <Clock3 size={14} />
                            )}

                            {session.status ===
                              "CANCELLED" && (
                              <X size={14} />
                            )}

                            {getStatusLabel(
                              session.status
                            )}
                          </div>

                        </div>

                        {/* ===== CARD MAIN ===== */}

                        <div className="session-main">

                          <div className="session-heading-row">
                            <div>
                              <h3>
                                {session.title}
                              </h3>

                              <p className="session-duration">
                                <Clock3 size={14} />

                                {session.duration ||
                                  60}{" "}
                                minutes
                              </p>
                            </div>
                          </div>

                          {/* PERSON */}

                          <div className="session-person">
                            <div className="session-person-avatar">
                              {getInitials(person)}
                            </div>

                            <div>
                              <span>
                                {userRole ===
                                "ALUMNI"
                                  ? "MENTEE"
                                  : "MENTOR"}
                              </span>

                              <strong>
                                {getPersonName(
                                  person
                                )}
                              </strong>

                              <p>
                                {getSessionPersonSubtitle(
                                  session
                                )}
                              </p>
                            </div>
                          </div>

                          {/* AGENDA */}

                          {session.agenda && (
                            <div className="session-detail-box">

                              <div className="detail-box-icon">
                                <Sparkles
                                  size={16}
                                />
                              </div>

                              <div>
                                <span>
                                  SESSION AGENDA
                                </span>

                                <p>
                                  {session.agenda}
                                </p>
                              </div>

                            </div>
                          )}

                          {/* CAREER GOAL */}

                          {session
                            .mentorshipRequest
                            ?.careerGoal && (
                            <div className="career-goal-box">

                              <Target size={16} />

                              <div>
                                <span>
                                  CAREER GOAL
                                </span>

                                <strong>
                                  {
                                    session
                                      .mentorshipRequest
                                      .careerGoal
                                  }
                                </strong>
                              </div>

                            </div>
                          )}

                          {/* MATCH INFORMATION */}

                          {session
                            .mentorshipRequest
                            ?.compatibilityScore !=
                            null && (
                            <div className="session-match-box">

                              <div className="match-score">
                                <strong>
                                  {
                                    session
                                      .mentorshipRequest
                                      .compatibilityScore
                                  }%
                                </strong>

                                <span>
                                  Match
                                </span>
                              </div>

                              <div>
                                <span>
                                  AI COMPATIBILITY
                                </span>

                                <p>
                                  {session
                                    .mentorshipRequest
                                    .matchReason ||
                                    "Strong alignment between mentor expertise and career goals."}
                                </p>
                              </div>

                            </div>
                          )}

                          {/* COMPLETED DETAILS */}

                          {session.status ===
                            "COMPLETED" &&
                            (session.summary ||
                              session.actionItems) && (
                              <div className="completed-details">

                                {session.summary && (
                                  <div>
                                    <span>
                                      SESSION SUMMARY
                                    </span>

                                    <p>
                                      {
                                        session.summary
                                      }
                                    </p>
                                  </div>
                                )}

                                {session.actionItems && (
                                  <div>
                                    <span>
                                      ACTION ITEMS
                                    </span>

                                    <p>
                                      {
                                        session.actionItems
                                      }
                                    </p>
                                  </div>
                                )}

                              </div>
                            )}

                          {/* FEEDBACK SUMMARY */}

                          {session.feedback && (
                            <div className="completed-details">

                              <div>
                                <span>
                                  YOUR FEEDBACK
                                </span>

                                <p>
                                  {"★".repeat(
                                    session.feedback.rating
                                  )}
                                  {"☆".repeat(
                                    5 -
                                      session.feedback
                                        .rating
                                  )}
                                  {" · "}
                                  {
                                    session.feedback
                                      .rating
                                  }/5
                                </p>
                              </div>

                              {session.feedback.comments && (
                                <div>
                                  <span>
                                    FEEDBACK COMMENTS
                                  </span>

                                  <p>
                                    {
                                      session.feedback
                                        .comments
                                    }
                                  </p>
                                </div>
                              )}

                            </div>
                          )}

                        </div>

                        {/* ================= FOOTER ================= */}

                        <div className="session-card-footer">

                          {session.meetingUrl &&
                            session.status ===
                              "SCHEDULED" && (
                              <a
                                href={
                                  session.meetingUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="join-session-button"
                              >
                                <ExternalLink
                                  size={16}
                                />
                                Join Meeting
                              </a>
                            )}

                          <div className="session-actions">

                            {/* VIEW DETAILS */}

                            <Link
                              to={`/mentorship-sessions/${session.id}`}
                              className="session-action view"
                            >
                              <Link2
                                size={15}
                              />
                              View Details
                            </Link>

                            {/* FEEDBACK */}

                            {session.status ===
                              "COMPLETED" &&
                              !session.feedback && (
                                <button
                                  type="button"
                                  className="session-action complete"
                                  onClick={() =>
                                    openFeedbackModal(
                                      session
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                >
                                  <Star size={15} />
                                  Give Feedback
                                </button>
                              )}

                            {/* EXISTING ALUMNI ACTIONS */}

                            {userRole ===
                              "ALUMNI" &&
                              session.status ===
                                "SCHEDULED" && (
                                <>
                                  <button
                                    type="button"
                                    className="session-action edit"
                                    onClick={() =>
                                      openEditModal(
                                        session
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    <Pencil
                                      size={15}
                                    />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="session-action complete"
                                    onClick={() =>
                                      openCompleteModal(
                                        session
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    <Check
                                      size={15}
                                    />
                                    Complete
                                  </button>

                                  <button
                                    type="button"
                                    className="session-action cancel"
                                    onClick={() =>
                                      handleCancelSession(
                                        session
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                  >
                                    <X
                                      size={15}
                                    />
                                    Cancel
                                  </button>
                                </>
                              )}

                          </div>
                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            </section>
          )}

      </div>

      {/* =====================================================
          SCHEDULE SESSION MODAL
          ===================================================== */}

      {showScheduleModal && (
        <div
          className="session-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModals();
            }
          }}
        >
          <div className="session-modal">

            <div className="modal-header">
              <div>
                <span>
                  MENTORSHIP WORKSPACE
                </span>

                <h2>
                  Schedule a Session
                </h2>

                <p>
                  Create a focused mentoring
                  conversation for one of your
                  active mentees.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModals}
                disabled={actionLoading}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="session-form"
              onSubmit={
                handleScheduleSubmit
              }
            >

              <label>
                Mentee

                <select
                  name="mentorshipRequestId"
                  value={
                    scheduleForm.mentorshipRequestId
                  }
                  onChange={
                    handleScheduleChange
                  }
                  required
                >
                  <option value="">
                    Select a mentee
                  </option>

                  {mentees.map((mentee) => (
                    <option
                      key={mentee.id}
                      value={mentee.id}
                    >
                      {getPersonName(
                        mentee.student
                      )}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Session Title

                <input
                  type="text"
                  name="title"
                  value={
                    scheduleForm.title
                  }
                  onChange={
                    handleScheduleChange
                  }
                  placeholder="e.g. DSA Interview Preparation"
                  required
                />
              </label>

              <div className="form-grid">

                <label>
                  Date & Time

                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={
                      scheduleForm.scheduledAt
                    }
                    onChange={
                      handleScheduleChange
                    }
                    required
                  />
                </label>

                <label>
                  Duration

                  <select
                    name="duration"
                    value={
                      scheduleForm.duration
                    }
                    onChange={
                      handleScheduleChange
                    }
                  >
                    <option value="30">
                      30 minutes
                    </option>

                    <option value="45">
                      45 minutes
                    </option>

                    <option value="60">
                      60 minutes
                    </option>

                    <option value="90">
                      90 minutes
                    </option>

                    <option value="120">
                      120 minutes
                    </option>
                  </select>
                </label>

              </div>

              <label>
                Meeting Link

                <div className="input-with-icon">
                  <Link2 size={16} />

                  <input
                    type="url"
                    name="meetingUrl"
                    value={
                      scheduleForm.meetingUrl
                    }
                    onChange={
                      handleScheduleChange
                    }
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </label>

              <label>
                Agenda

                <textarea
                  name="agenda"
                  value={
                    scheduleForm.agenda
                  }
                  onChange={
                    handleScheduleChange
                  }
                  placeholder="What should you discuss in this session?"
                  rows="4"
                />
              </label>

              {actionError && (
                <div className="modal-error">
                  {actionError}
                </div>
              )}

              <div className="modal-actions">

                <button
                  type="button"
                  className="modal-secondary"
                  onClick={closeModals}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-primary"
                  disabled={
                    actionLoading ||
                    mentees.length === 0
                  }
                >
                  {actionLoading ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="button-spinner"
                      />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarDays
                        size={16}
                      />
                      Schedule Session
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT SESSION MODAL
          ===================================================== */}

      {showEditModal &&
        selectedSession && (
          <div className="session-modal-overlay">
            <div className="session-modal">

              <div className="modal-header">
                <div>
                  <span>
                    SESSION MANAGEMENT
                  </span>

                  <h2>
                    Edit Session
                  </h2>

                  <p>
                    Update the schedule or
                    details before the session
                    begins.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={closeModals}
                  disabled={actionLoading}
                >
                  <X size={19} />
                </button>
              </div>

              <form
                className="session-form"
                onSubmit={
                  handleEditSubmit
                }
              >

                <label>
                  Session Title

                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={
                      handleEditChange
                    }
                    required
                  />
                </label>

                <div className="form-grid">

                  <label>
                    Date & Time

                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      value={
                        editForm.scheduledAt
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />
                  </label>

                  <label>
                    Duration

                    <select
                      name="duration"
                      value={
                        editForm.duration
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      <option value="30">
                        30 minutes
                      </option>

                      <option value="45">
                        45 minutes
                      </option>

                      <option value="60">
                        60 minutes
                      </option>

                      <option value="90">
                        90 minutes
                      </option>

                      <option value="120">
                        120 minutes
                      </option>
                    </select>
                  </label>

                </div>

                <label>
                  Meeting Link

                  <div className="input-with-icon">
                    <Link2 size={16} />

                    <input
                      type="url"
                      name="meetingUrl"
                      value={
                        editForm.meetingUrl
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                </label>

                <label>
                  Agenda

                  <textarea
                    name="agenda"
                    value={
                      editForm.agenda
                    }
                    onChange={
                      handleEditChange
                    }
                    rows="4"
                  />
                </label>

                {actionError && (
                  <div className="modal-error">
                    {actionError}
                  </div>
                )}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="modal-secondary"
                    onClick={closeModals}
                    disabled={
                      actionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="modal-primary"
                    disabled={
                      actionLoading
                    }
                  >
                    {actionLoading ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="button-spinner"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          FEEDBACK MODAL
          ===================================================== */}

      {showFeedbackModal &&
        selectedSession && (
          <div className="session-modal-overlay">
            <div className="session-modal">

              <div className="modal-header">
                <div>
                  <span>
                    SESSION FEEDBACK
                  </span>

                  <h2>
                    Rate Your Mentorship Session
                  </h2>

                  <p>
                    Share your experience and
                    help make future mentorship
                    sessions more valuable.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={closeModals}
                  disabled={actionLoading}
                >
                  <X size={19} />
                </button>
              </div>

              <form
                className="session-form"
                onSubmit={
                  handleFeedbackSubmit
                }
              >

                <div>
                  <label>
                    Overall Rating
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFeedbackForm(
                              (previous) => ({
                                ...previous,
                                rating: star,
                              })
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          aria-label={`${star} star${
                            star > 1
                              ? "s"
                              : ""
                          }`}
                          style={{
                            border: "none",
                            background:
                              "transparent",
                            padding: "2px",
                            cursor: "pointer",
                          }}
                        >
                          <Star
                            size={30}
                            fill={
                              star <=
                              feedbackForm.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      )
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    {feedbackForm.rating ===
                    0
                      ? "Select a rating"
                      : `${feedbackForm.rating} out of 5 stars`}
                  </span>
                </div>

                <label>
                  Comments

                  <textarea
                    name="comments"
                    value={
                      feedbackForm.comments
                    }
                    onChange={
                      handleFeedbackChange
                    }
                    placeholder="How was your overall mentorship experience?"
                    rows="4"
                  />
                </label>

                <label>
                  What went well?

                  <textarea
                    name="strengths"
                    value={
                      feedbackForm.strengths
                    }
                    onChange={
                      handleFeedbackChange
                    }
                    placeholder="Mention the most helpful parts of the session..."
                    rows="3"
                  />
                </label>

                <label>
                  What could be improved?

                  <textarea
                    name="improvement"
                    value={
                      feedbackForm.improvement
                    }
                    onChange={
                      handleFeedbackChange
                    }
                    placeholder="Share any suggestions for future sessions..."
                    rows="3"
                  />
                </label>

                {actionError && (
                  <div className="modal-error">
                    {actionError}
                  </div>
                )}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="modal-secondary"
                    onClick={closeModals}
                    disabled={
                      actionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="modal-primary"
                    disabled={
                      actionLoading ||
                      !feedbackForm.rating
                    }
                  >
                    {actionLoading ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="button-spinner"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star size={16} />
                        Submit Feedback
                      </>
                    )}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          COMPLETE SESSION MODAL
          ===================================================== */}

      {showCompleteModal &&
        selectedSession && (
          <div className="session-modal-overlay">
            <div className="session-modal">

              <div className="modal-header">
                <div>
                  <span>
                    SESSION OUTCOME
                  </span>

                  <h2>
                    Complete Session
                  </h2>

                  <p>
                    Record what was discussed
                    and what the student should
                    work on next.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={closeModals}
                  disabled={actionLoading}
                >
                  <X size={19} />
                </button>
              </div>

              <form
                className="session-form"
                onSubmit={
                  handleCompleteSubmit
                }
              >

                <label>
                  Session Summary

                  <textarea
                    name="summary"
                    value={
                      completeForm.summary
                    }
                    onChange={
                      handleCompleteChange
                    }
                    placeholder="Summarize the key points discussed..."
                    rows="5"
                  />
                </label>

                <label>
                  Action Items

                  <textarea
                    name="actionItems"
                    value={
                      completeForm.actionItems
                    }
                    onChange={
                      handleCompleteChange
                    }
                    placeholder="What should the student work on before the next session?"
                    rows="5"
                  />
                </label>

                {actionError && (
                  <div className="modal-error">
                    {actionError}
                  </div>
                )}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="modal-secondary"
                    onClick={closeModals}
                    disabled={
                      actionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="modal-primary complete-primary"
                    disabled={
                      actionLoading
                    }
                  >
                    {actionLoading ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="button-spinner"
                        />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Mark Completed
                      </>
                    )}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

    </div>
  );
}

export default MentorshipSessionsPage;