import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Clock3,
  Sparkles,
  Users,
  Target,
  MessageCircle,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import api from "../services/api";

import "./MentorshipRequestsPage.css";

function MentorshipRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token")
    );
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login to view mentorship requests.");
        return;
      }

      const response = await api.get(
        "/mentorship/requests/received",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(response.data.data || []);
    } catch (err) {
      console.error(
        "Failed to fetch mentorship requests:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load mentorship requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    try {
      setActionId(requestId);
      setActionType(action);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again to continue.");
        return;
      }

      const endpoint =
        action === "accept"
          ? `/mentorship/requests/${requestId}/accept`
          : `/mentorship/requests/${requestId}/reject`;

      await api.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status:
                  action === "accept"
                    ? "ACCEPTED"
                    : "REJECTED",
              }
            : request
        )
      );
    } catch (err) {
      console.error(
        `Failed to ${action} mentorship request:`,
        err
      );

      setError(
        err.response?.data?.message ||
          `Unable to ${action} this mentorship request.`
      );
    } finally {
      setActionId(null);
      setActionType("");
    }
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "PENDING":
        return "Pending";
      case "CANCELLED":
        return "Cancelled";
      case "COMPLETED":
        return "Completed";
      default:
        return status || "Unknown";
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "S";
  };

  const getCompatibilityScore = (score) => {
    if (score === null || score === undefined) {
      return null;
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return null;
    }

    return Math.min(Math.max(numericScore, 0), 100);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const acceptedCount = requests.filter(
    (request) => request.status === "ACCEPTED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  return (
    <div className="requests-page">
      <div className="requests-container">

        {/* Back Navigation */}
        <div className="requests-back-navigation">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="requests-header">
          <div>
            <span className="requests-eyebrow">
              MENTORSHIP
            </span>

            <h1>Mentorship Requests</h1>

            <p>
              Review student requests, understand their goals,
              and build meaningful mentorship connections.
            </p>
          </div>

          <div className="request-count">
            <strong>{requests.length}</strong>
            <span>Total Requests</span>
          </div>
        </div>

        {/* Summary */}
        {!loading && !error && requests.length > 0 && (
          <div className="request-summary">

            <div className="summary-card">
              <div className="summary-icon pending">
                <Clock3 size={18} />
              </div>

              <div>
                <strong>{pendingCount}</strong>
                <span>Pending</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon accepted">
                <Check size={18} />
              </div>

              <div>
                <strong>{acceptedCount}</strong>
                <span>Accepted</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon rejected">
                <X size={18} />
              </div>

              <div>
                <strong>{rejectedCount}</strong>
                <span>Rejected</span>
              </div>
            </div>

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="request-error">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="requests-loading">
            <div className="loading-spinner"></div>

            <h3>Loading mentorship requests...</h3>

            <p>
              Fetching the latest requests from students.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && requests.length === 0 && !error ? (
          <div className="empty-requests">
            <div className="empty-icon">
              <Users size={32} />
            </div>

            <h2>No mentorship requests yet</h2>

            <p>
              When students request you as their mentor,
              their requests will appear here.
            </p>

            <Link
              to="/dashboard"
              className="empty-dashboard-link"
            >
              <ArrowLeft size={16} />
              Return to Dashboard
            </Link>
          </div>
        ) : (
          !loading && (
            <div className="requests-grid">
              {requests.map((request) => {
                const student = request.student || {};
                const score = getCompatibilityScore(
                  request.compatibilityScore
                );

                return (
                  <article
                    className="request-card"
                    key={request.id}
                  >

                    {/* Card Header */}
                    <div className="request-card-top">

                      <div className="student-info">

                        <div className="student-avatar">
                          {student.profileImage ? (
                            <img
                              src={student.profileImage}
                              alt={`${student.firstName || "Student"} profile`}
                            />
                          ) : (
                            getInitials(
                              student.firstName,
                              student.lastName
                            )
                          )}
                        </div>

                        <div>
                          <h2>
                            {student.firstName || "Student"}{" "}
                            {student.lastName || ""}
                          </h2>

                          <span>
                            {student.email ||
                              "Student profile"}
                          </span>
                        </div>

                      </div>

                      <span
                        className={`request-status ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status === "PENDING" && (
                          <Clock3 size={14} />
                        )}

                        {request.status === "ACCEPTED" && (
                          <Check size={14} />
                        )}

                        {request.status === "REJECTED" && (
                          <X size={14} />
                        )}

                        {getStatusLabel(request.status)}
                      </span>

                    </div>

                    <div className="request-divider"></div>

                    {/* Request Details */}
                    <div className="request-details">

                      <div className="detail-block">

                        <span className="detail-label">
                          <Target size={14} />
                          CAREER GOAL
                        </span>

                        <strong>
                          {request.careerGoal ||
                            "Not specified"}
                        </strong>

                      </div>

                      <div className="detail-block">

                        <span className="detail-label">
                          COMPATIBILITY
                        </span>

                        <div className="score-row">

                          <div className="score-track">
                            <div
                              className="score-fill"
                              style={{
                                width: `${score ?? 0}%`,
                              }}
                            ></div>
                          </div>

                          <strong className="score-value">
                            {score !== null
                              ? `${Math.round(score)}%`
                              : "N/A"}
                          </strong>

                        </div>

                      </div>

                    </div>

                    {/* Student Message */}
                    {request.message && (
                      <div className="message-box">

                        <span className="message-label">
                          <MessageCircle size={14} />
                          STUDENT MESSAGE
                        </span>

                        <p>
                          "{request.message}"
                        </p>

                      </div>
                    )}

                    {/* Match Reason */}
                    {request.matchReason && (
                      <div className="match-reason">

                        <span className="reason-icon">
                          <Sparkles size={17} />
                        </span>

                        <div>
                          <span>WHY THIS MATCH</span>

                          <p>
                            {request.matchReason}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* Trust / Mentorship Info */}
                    {request.status === "ACCEPTED" && (
                      <div className="accepted-note">

                        <ShieldCheck size={16} />

                        <span>
                          You are now connected as mentor and
                          mentee.
                        </span>

                      </div>
                    )}

                    {/* Footer */}
                    <div className="request-footer">

                      <span className="request-date">
                        <CalendarDays size={15} />

                        Requested{" "}
                        {formatDate(request.createdAt)}
                      </span>

                      {request.status === "PENDING" && (
                        <div className="request-actions">

                          <button
                            type="button"
                            className="reject-btn"
                            onClick={() =>
                              handleRequestAction(
                                request.id,
                                "reject"
                              )
                            }
                            disabled={
                              actionId === request.id
                            }
                          >
                            {actionId === request.id &&
                            actionType === "reject" ? (
                              "Rejecting..."
                            ) : (
                              <>
                                <X size={16} />
                                Reject
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="accept-btn"
                            onClick={() =>
                              handleRequestAction(
                                request.id,
                                "accept"
                              )
                            }
                            disabled={
                              actionId === request.id
                            }
                          >
                            {actionId === request.id &&
                            actionType === "accept" ? (
                              "Accepting..."
                            ) : (
                              <>
                                <Check size={16} />
                                Accept Request
                              </>
                            )}
                          </button>

                        </div>
                      )}

                    </div>

                  </article>
                );
              })}
            </div>
          )
        )}

      </div>
    </div>
  );
}

export default MentorshipRequestsPage;