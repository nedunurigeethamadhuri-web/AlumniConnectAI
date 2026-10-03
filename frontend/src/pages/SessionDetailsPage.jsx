import { useEffect, useMemo, useState } from "react";

import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  LoaderCircle,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import "./SessionDetailsPage.css";

function SessionDetailsPage() {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    comments: "",
    strengths: "",
    improvement: "",
  });

  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  const getToken = () =>
    localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSession = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/sessions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSession(response.data.data);
      } catch (err) {
        console.error(
          "Unable to load session details:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load session details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSession();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatShortDate = (date) => {
    if (!date) return "—";

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
    if (!date) return "—";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getPersonName = (person) => {
    if (!person) return "User";

    const name =
      `${person.firstName || ""} ${
        person.lastName || ""
      }`.trim();

    return name || "User";
  };

  const getInitials = (person) => {
    if (!person) return "U";

    const first =
      person.firstName?.charAt(0) || "";

    const last =
      person.lastName?.charAt(0) || "";

    return (
      `${first}${last}`.toUpperCase() || "U"
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "completed";

      case "CANCELLED":
        return "cancelled";

      default:
        return "scheduled";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return "Scheduled";
    }
  };

  const getUserRole = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      return user?.role || "";
    } catch {
      return "";
    }
  };

  const userRole = getUserRole();

  const mentor = session?.alumni;
  const mentee = session?.student;

  const mentorProfile =
    mentor?.alumniProfile || {};

  const menteeProfile =
    mentee?.studentProfile || {};

  const matchScore = Number(
    session?.mentorshipRequest
      ?.compatibilityScore || 0
  );

  const tasks = Array.isArray(session?.tasks)
    ? session.tasks
    : [];

  const feedback = session?.feedback || null;

  const timelineItems = useMemo(() => {
    if (!session) return [];

    const items = [
      {
        title: "Session created",
        description:
          "Mentorship session was created and added to the mentorship timeline.",
        date: session.createdAt,
        icon: CalendarDays,
      },
    ];

    if (
      session.status === "COMPLETED" &&
      session.updatedAt
    ) {
      items.push({
        title: "Session completed",
        description:
          "The mentorship session was marked as completed.",
        date: session.updatedAt,
        icon: CheckCircle2,
      });
    }

    if (
      session.status === "CANCELLED" &&
      session.updatedAt
    ) {
      items.push({
        title: "Session cancelled",
        description:
          "The mentorship session was cancelled.",
        date: session.updatedAt,
        icon: XCircle,
      });
    }

    if (feedback?.createdAt) {
      items.push({
        title: "Feedback submitted",
        description:
          "Participant feedback was added to this mentorship session.",
        date: feedback.createdAt,
        icon: MessageSquare,
      });
    }

    return items;
  }, [session, feedback]);

  const handleFeedbackChange = (field, value) => {
    setFeedbackForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();

    setFeedbackError("");
    setFeedbackSuccess("");

    if (!feedbackForm.rating) {
      setFeedbackError(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setFeedbackError(
        "Your session has expired. Please login again."
      );
      return;
    }

    try {
      setFeedbackSubmitting(true);

      const response = await api.post(
        "/feedback",
        {
          sessionId: id,
          rating: feedbackForm.rating,
          comments: feedbackForm.comments,
          strengths: feedbackForm.strengths,
          improvement: feedbackForm.improvement,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newFeedback =
        response.data.data?.feedback;

      setSession((previous) => ({
        ...previous,
        feedback: newFeedback,
      }));

      setFeedbackForm({
        rating: 0,
        comments: "",
        strengths: "",
        improvement: "",
      });

      setFeedbackSuccess(
        "Your feedback has been submitted successfully."
      );
    } catch (err) {
      console.error(
        "Unable to submit feedback:",
        err
      );

      setFeedbackError(
        err.response?.data?.message ||
          "Unable to submit feedback."
      );
    } finally {
      setFeedbackSubmitting(false);
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

  if (loading) {
    return (
      <div className="session-details-page">
        <div className="session-details-state">
          <LoaderCircle
            size={42}
            className="session-details-spinner"
          />

          <h2>
            Loading session details...
          </h2>

          <p>
            Fetching the mentorship session
            information.
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-details-page">
        <div className="session-details-state error-state">
          <div className="session-error-icon">
            <XCircle size={34} />
          </div>

          <h2>
            Session not found
          </h2>

          <p>
            {error ||
              "The requested mentorship session could not be found."}
          </p>

          <Link
            to="/mentorship-sessions"
            className="session-details-back-button"
          >
            <ArrowLeft size={17} />
            Return to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="session-details-page">
      <div className="session-details-container">

        {/* TOP NAVIGATION */}

        <div className="session-details-topbar">
          <Link
            to="/mentorship-sessions"
            className="session-details-back-link"
          >
            <ArrowLeft size={18} />
            Back to Sessions
          </Link>

          <span className="session-details-top-label">
            MENTORSHIP WORKSPACE
          </span>
        </div>

        {/* HERO */}

        <section className="session-details-hero">
          <div className="session-hero-main">
            <div className="session-hero-icon">
              <CalendarDays size={27} />
            </div>

            <div className="session-hero-content">
              <div className="session-hero-eyebrow">
                MENTORSHIP SESSION
              </div>

              <h1>
                {session.title}
              </h1>

              <p>
                {session.agenda ||
                  "Focused mentorship conversation for career development and professional growth."}
              </p>

              <div className="session-hero-meta">
                <span>
                  <CalendarDays size={15} />
                  {formatShortDate(
                    session.scheduledAt
                  )}
                </span>

                <span>
                  <Clock3 size={15} />
                  {formatTime(
                    session.scheduledAt
                  )}
                </span>

                <span>
                  <Clock3 size={15} />
                  {session.duration || 60} min
                </span>
              </div>
            </div>
          </div>

          <div
            className={`session-details-status ${getStatusClass(
              session.status
            )}`}
          >
            {session.status === "COMPLETED" ? (
              <CheckCircle2 size={17} />
            ) : session.status === "CANCELLED" ? (
              <XCircle size={17} />
            ) : (
              <Clock3 size={17} />
            )}

            {getStatusLabel(
              session.status
            )}
          </div>
        </section>

        {/* QUICK INFORMATION */}

        <section className="session-details-info-grid">
          <div className="session-info-card">
            <div className="session-info-icon purple">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>DATE</span>
              <strong>
                {formatDate(
                  session.scheduledAt
                )}
              </strong>
            </div>
          </div>

          <div className="session-info-card">
            <div className="session-info-icon blue">
              <Clock3 size={19} />
            </div>

            <div>
              <span>TIME</span>
              <strong>
                {formatTime(
                  session.scheduledAt
                )}
              </strong>
            </div>
          </div>

          <div className="session-info-card">
            <div className="session-info-icon green">
              <Target size={19} />
            </div>

            <div>
              <span>CAREER GOAL</span>
              <strong>
                {session.mentorshipRequest
                  ?.careerGoal ||
                  "Career development"}
              </strong>
            </div>
          </div>

          <div className="session-info-card">
            <div className="session-info-icon orange">
              <Sparkles size={19} />
            </div>

            <div>
              <span>AI MATCH</span>
              <strong>
                {matchScore > 0
                  ? `${matchScore}%`
                  : "Not available"}
              </strong>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}

        <div className="session-details-layout">

          <main className="session-details-main">

            {/* PEOPLE */}

            <section className="session-details-card">
              <div className="session-details-card-heading">
                <div className="heading-icon">
                  <Users size={19} />
                </div>

                <div>
                  <span>CONNECTION</span>
                  <h2>
                    Mentor & Mentee
                  </h2>
                </div>
              </div>

              <div className="session-people-grid">

                <div className="session-person-card">
                  <div className="session-person-avatar mentor-avatar">
                    {getInitials(mentor)}
                  </div>

                  <div className="session-person-content">
                    <span>
                      ALUMNI MENTOR
                    </span>

                    <h3>
                      {getPersonName(
                        mentor
                      )}
                    </h3>

                    <p>
                      {mentorProfile.designation ||
                        "Professional Mentor"}
                    </p>

                    {mentorProfile.company && (
                      <small>
                        {mentorProfile.company}
                      </small>
                    )}
                  </div>
                </div>

                <div className="session-person-card">
                  <div className="session-person-avatar mentee-avatar">
                    {getInitials(mentee)}
                  </div>

                  <div className="session-person-content">
                    <span>
                      STUDENT MENTEE
                    </span>

                    <h3>
                      {getPersonName(
                        mentee
                      )}
                    </h3>

                    <p>
                      {menteeProfile.branch ||
                        menteeProfile.degree ||
                        "Student"}
                    </p>

                    {menteeProfile.college && (
                      <small>
                        {menteeProfile.college}
                      </small>
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* AGENDA */}

            <section className="session-details-card">
              <div className="session-details-card-heading">
                <div className="heading-icon">
                  <FileText size={19} />
                </div>

                <div>
                  <span>SESSION PLAN</span>
                  <h2>Agenda</h2>
                </div>
              </div>

              <div className="session-agenda-content">
                {session.agenda ? (
                  <p>
                    {session.agenda}
                  </p>
                ) : (
                  <div className="session-empty-content">
                    <FileText size={19} />

                    <span>
                      No agenda has been added
                      for this session yet.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* CAREER GOAL */}

            <section className="session-details-card">
              <div className="session-details-card-heading">
                <div className="heading-icon">
                  <Target size={19} />
                </div>

                <div>
                  <span>CAREER DIRECTION</span>
                  <h2>
                    Mentorship Objective
                  </h2>
                </div>
              </div>

              <div className="session-objective-box">
                <div className="objective-icon">
                  <Target size={21} />
                </div>

                <div>
                  <span>
                    STUDENT CAREER GOAL
                  </span>

                  <h3>
                    {session.mentorshipRequest
                      ?.careerGoal ||
                      "Career development and professional growth"}
                  </h3>

                  {session.mentorshipRequest
                    ?.message && (
                    <p>
                      {
                        session
                          .mentorshipRequest
                          .message
                      }
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* COMPLETION */}

            {(session.summary ||
              session.actionItems) && (
              <section className="session-details-card">
                <div className="session-details-card-heading">
                  <div className="heading-icon">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <span>
                      SESSION OUTCOME
                    </span>

                    <h2>
                      What was accomplished
                    </h2>
                  </div>
                </div>

                <div className="session-outcome-grid">
                  {session.summary && (
                    <div className="session-outcome-item">
                      <span>
                        SESSION SUMMARY
                      </span>

                      <p>
                        {session.summary}
                      </p>
                    </div>
                  )}

                  {session.actionItems && (
                    <div className="session-outcome-item">
                      <span>
                        ACTION ITEMS
                      </span>

                      <p>
                        {session.actionItems}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TASKS */}

            <section className="session-details-card">
              <div className="session-details-card-heading">
                <div className="heading-icon">
                  <Target size={19} />
                </div>

                <div>
                  <span>FOLLOW-UP</span>
                  <h2>
                    Session Tasks
                  </h2>
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="session-task-list">
                  {tasks.map(
                    (task, index) => (
                      <div
                        className="session-task-item"
                        key={
                          task.id ||
                          index
                        }
                      >
                        <div className="task-check">
                          <CheckCircle2
                            size={18}
                          />
                        </div>

                        <div className="task-content">
                          <strong>
                            {task.title ||
                              task.name ||
                              `Task ${index + 1}`}
                          </strong>

                          {task.description && (
                            <p>
                              {
                                task.description
                              }
                            </p>
                          )}

                          {task.dueDate && (
                            <small>
                              Due{" "}
                              {formatShortDate(
                                task.dueDate
                              )}
                            </small>
                          )}
                        </div>

                        {task.status && (
                          <span className="task-status">
                            {task.status}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="session-empty-content">
                  <Target size={19} />

                  <span>
                    No follow-up tasks have
                    been created for this
                    session yet.
                  </span>
                </div>
              )}
            </section>
          </main>

          {/* SIDEBAR */}

          <aside className="session-details-sidebar">

            {/* MEETING */}

            <section className="session-sidebar-card meeting-card">
              <div className="sidebar-card-heading">
                <div className="sidebar-heading-icon">
                  <Link2 size={18} />
                </div>

                <div>
                  <span>
                    SESSION ACCESS
                  </span>

                  <h3>Meeting</h3>
                </div>
              </div>

              {session.meetingUrl &&
              session.status ===
                "SCHEDULED" ? (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="meeting-button"
                >
                  <ExternalLink
                    size={17}
                  />
                  Join Meeting
                </a>
              ) : (
                <div className="meeting-unavailable">
                  <Clock3 size={18} />

                  <p>
                    {session.status ===
                    "COMPLETED"
                      ? "This session has already been completed."
                      : session.status ===
                          "CANCELLED"
                        ? "This session has been cancelled."
                        : "No meeting link has been added yet."}
                  </p>
                </div>
              )}
            </section>

            {/* AI INSIGHT */}

            <section className="session-sidebar-card ai-insight-card">
              <div className="sidebar-card-heading">
                <div className="sidebar-heading-icon ai">
                  <Sparkles size={18} />
                </div>

                <div>
                  <span>
                    AI ANALYSIS
                  </span>

                  <h3>
                    Match Insight
                  </h3>
                </div>
              </div>

              <div className="ai-score-circle">
                <strong>
                  {matchScore > 0
                    ? `${matchScore}%`
                    : "—"}
                </strong>

                <span>
                  Compatibility
                </span>
              </div>

              <p className="ai-insight-text">
                {session
                  .mentorshipRequest
                  ?.matchReason ||
                  "This mentorship connection is based on the student's career direction and the mentor's professional expertise."}
              </p>
            </section>

            {/* FEEDBACK */}

            <section className="session-sidebar-card feedback-sidebar-card">
              <div className="sidebar-card-heading">
                <div className="sidebar-heading-icon">
                  <MessageSquare size={18} />
                </div>

                <div>
                  <span>FEEDBACK</span>

                  <h3>
                    Session Feedback
                  </h3>
                </div>
              </div>

              {feedback ? (
                <div className="feedback-content">

                  <div className="feedback-submitted-badge">
                    <CheckCircle2 size={15} />
                    Feedback submitted
                  </div>

                  {feedback.rating != null && (
                    <div className="feedback-rating-display">
                      <div className="feedback-stars-display">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <Star
                              key={star}
                              size={18}
                              fill={
                                star <=
                                feedback.rating
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          )
                        )}
                      </div>

                      <strong>
                        {feedback.rating}
                        <span>/5</span>
                      </strong>
                    </div>
                  )}

                  {feedback.comments && (
                    <div className="feedback-view-item">
                      <span>
                        COMMENTS
                      </span>

                      <p>
                        {feedback.comments}
                      </p>
                    </div>
                  )}

                  {feedback.strengths && (
                    <div className="feedback-view-item">
                      <span>
                        STRENGTHS
                      </span>

                      <p>
                        {feedback.strengths}
                      </p>
                    </div>
                  )}

                  {feedback.improvement && (
                    <div className="feedback-view-item">
                      <span>
                        IMPROVEMENT
                      </span>

                      <p>
                        {feedback.improvement}
                      </p>
                    </div>
                  )}

                  {feedback.givenBy && (
                    <small className="feedback-given-by">
                      Submitted by{" "}
                      {getPersonName(
                        feedback.givenBy
                      )}
                    </small>
                  )}
                </div>
              ) : session.status ===
                  "COMPLETED" ? (
                <form
                  className="feedback-form"
                  onSubmit={
                    handleSubmitFeedback
                  }
                >
                  <div className="feedback-form-intro">
                    <div className="feedback-form-icon">
                      <Star size={20} />
                    </div>

                    <div>
                      <strong>
                        How was this session?
                      </strong>

                      <p>
                        Share your experience
                        to help improve
                        mentorship quality.
                      </p>
                    </div>
                  </div>

                  <div className="feedback-rating-selector">
                    <span>
                      YOUR RATING
                    </span>

                    <div
                      className="feedback-star-buttons"
                      onMouseLeave={() =>
                        setFeedbackHover(0)
                      }
                    >
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            type="button"
                            key={star}
                            className={
                              star <=
                              (feedbackHover ||
                                feedbackForm.rating)
                                ? "active"
                                : ""
                            }
                            onMouseEnter={() =>
                              setFeedbackHover(
                                star
                              )
                            }
                            onClick={() =>
                              handleFeedbackChange(
                                "rating",
                                star
                              )
                            }
                            aria-label={`${star} star`}
                          >
                            <Star
                              size={25}
                              fill={
                                star <=
                                (feedbackHover ||
                                  feedbackForm.rating)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        )
                      )}
                    </div>

                    <small>
                      {feedbackForm.rating
                        ? `${feedbackForm.rating} out of 5`
                        : "Select a rating"}
                    </small>
                  </div>

                  <label className="feedback-field">
                    <span>
                      COMMENTS
                    </span>

                    <textarea
                      value={
                        feedbackForm.comments
                      }
                      onChange={(event) =>
                        handleFeedbackChange(
                          "comments",
                          event.target.value
                        )
                      }
                      placeholder="Share your overall experience..."
                      rows={3}
                      maxLength={500}
                    />
                  </label>

                  <label className="feedback-field">
                    <span>
                      STRENGTHS
                    </span>

                    <textarea
                      value={
                        feedbackForm.strengths
                      }
                      onChange={(event) =>
                        handleFeedbackChange(
                          "strengths",
                          event.target.value
                        )
                      }
                      placeholder="What went well?"
                      rows={3}
                      maxLength={500}
                    />
                  </label>

                  <label className="feedback-field">
                    <span>
                      IMPROVEMENT
                    </span>

                    <textarea
                      value={
                        feedbackForm.improvement
                      }
                      onChange={(event) =>
                        handleFeedbackChange(
                          "improvement",
                          event.target.value
                        )
                      }
                      placeholder="What could be improved?"
                      rows={3}
                      maxLength={500}
                    />
                  </label>

                  {feedbackError && (
                    <div className="feedback-form-error">
                      <XCircle size={16} />
                      {feedbackError}
                    </div>
                  )}

                  {feedbackSuccess && (
                    <div className="feedback-form-success">
                      <CheckCircle2 size={16} />
                      {feedbackSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="feedback-submit-button"
                    disabled={
                      feedbackSubmitting
                    }
                  >
                    {feedbackSubmitting ? (
                      <>
                        <LoaderCircle
                          size={17}
                          className="feedback-spinner"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="meeting-unavailable">
                  <MessageSquare size={18} />

                  <p>
                    Feedback can be submitted
                    after the mentorship session
                    is completed.
                  </p>
                </div>
              )}
            </section>

            {/* PROFILE */}

            <section className="session-sidebar-card">
              <div className="sidebar-card-heading">
                <div className="sidebar-heading-icon">
                  <UserRound size={18} />
                </div>

                <div>
                  <span>
                    CONNECTION
                  </span>

                  <h3>Profiles</h3>
                </div>
              </div>

              <div className="profile-shortcuts">
                <div className="profile-shortcut">
                  <div className="shortcut-avatar">
                    {getInitials(
                      userRole ===
                        "ALUMNI"
                        ? mentee
                        : mentor
                    )}
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
                        userRole ===
                          "ALUMNI"
                          ? mentee
                          : mentor
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* TIMELINE */}

        <section className="session-details-card session-timeline-card">
          <div className="session-details-card-heading">
            <div className="heading-icon">
              <Clock3 size={19} />
            </div>

            <div>
              <span>ACTIVITY</span>

              <h2>
                Session Timeline
              </h2>
            </div>
          </div>

          <div className="session-timeline">
            {timelineItems.map(
              (item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className="timeline-item"
                    key={index}
                  >
                    <div className="timeline-marker">
                      <Icon size={17} />
                    </div>

                    <div className="timeline-content">
                      <div>
                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {formatShortDate(
                            item.date
                          )}
                        </span>
                      </div>

                      <p>
                        {
                          item.description
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* FOOTER */}

        <footer className="session-details-footer">
          <Link
            to="/mentorship-sessions"
            className="session-details-footer-link"
          >
            <ArrowLeft size={17} />
            Back to Mentorship Sessions
          </Link>

          <span>
            AlumniConnect AI · Mentorship Workspace
          </span>
        </footer>

      </div>
    </div>
  );
}

export default SessionDetailsPage;