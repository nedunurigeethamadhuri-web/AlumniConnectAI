import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  LoaderCircle,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";

import api from "../services/api";
import "./MenteesPage.css";

function MenteesPage() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMentees() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/mentees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMentees(response.data.data?.mentees || []);
      } catch (err) {
        console.error("Unable to load mentees:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your mentees. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMentees();
  }, []);

  const getInitials = (student) => {
    const first = student?.firstName?.charAt(0) || "";
    const last = student?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "S";
  };

  const getFullName = (student) => {
    return (
      `${student?.firstName || ""} ${
        student?.lastName || ""
      }`.trim() || "Student"
    );
  };

  if (!localStorage.getItem("accessToken")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mentees-page">
      <div className="mentees-container">
        <header className="mentees-header">
          <div>
            <Link to="/dashboard" className="back-link">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <div className="page-title-row">
              <div className="page-title-icon">
                <Users size={25} />
              </div>

              <div>
                <span className="page-eyebrow">
                  MENTOR NETWORK
                </span>

                <h1>My Mentees</h1>

                <p>
                  Manage your active mentorship connections and
                  support students throughout their career journey.
                </p>
              </div>
            </div>
          </div>

          <div className="mentee-count-card">
            <strong>{mentees.length}</strong>
            <span>Active Mentees</span>
          </div>
        </header>

        {loading && (
          <div className="mentees-state">
            <LoaderCircle
              className="state-spinner"
              size={38}
            />

            <h3>Loading your mentees...</h3>

            <p>
              Fetching your active mentorship connections.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mentees-state error-state">
            <div className="state-icon">!</div>

            <h3>Unable to load mentees</h3>

            <p>{error}</p>
          </div>
        )}

        {!loading && !error && mentees.length === 0 && (
          <div className="mentees-state">
            <div className="empty-icon">
              <Users size={32} />
            </div>

            <h3>No active mentees yet</h3>

            <p>
              Once you accept a student's mentorship request,
              that student will appear here.
            </p>

            <Link
              to="/mentorship-requests"
              className="primary-action"
            >
              Review mentorship requests
              <ChevronRight size={17} />
            </Link>
          </div>
        )}

        {!loading && !error && mentees.length > 0 && (
          <section className="mentees-content">
            <div className="section-heading">
              <div>
                <span>ACTIVE CONNECTIONS</span>

                <h2>Your mentorship relationships</h2>
              </div>

              <Link
                to="/mentorship-requests"
                className="secondary-action"
              >
                Review requests
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="mentees-grid">
              {mentees.map((mentee) => {
                const student = mentee.student || mentee;

                return (
                  <article
                    className="mentee-card"
                    key={mentee.id}
                  >
                    <div className="mentee-card-top">
                      <div className="mentee-avatar">
                        {getInitials(student)}
                      </div>

                      <div className="mentee-status">
                        <span className="status-dot"></span>
                        Active
                      </div>
                    </div>

                    <div className="mentee-info">
                      <h3>{getFullName(student)}</h3>

                      <p className="mentee-email">
                        {student.email || "Student"}
                      </p>
                    </div>

                    <div className="mentee-details">
                      {student.studentProfile?.careerGoal && (
                        <div className="detail-item">
                          <div className="detail-icon purple">
                            <Target size={16} />
                          </div>

                          <div>
                            <span>Career Goal</span>

                            <strong>
                              {student.studentProfile.careerGoal}
                            </strong>
                          </div>
                        </div>
                      )}

                      {student.studentProfile?.branch && (
                        <div className="detail-item">
                          <div className="detail-icon blue">
                            <GraduationCap size={16} />
                          </div>

                          <div>
                            <span>Branch</span>

                            <strong>
                              {student.studentProfile.branch}
                            </strong>
                          </div>
                        </div>
                      )}

                      {student.studentProfile?.college && (
                        <div className="detail-item">
                          <div className="detail-icon green">
                            <BriefcaseBusiness size={16} />
                          </div>

                          <div>
                            <span>College</span>

                            <strong>
                              {student.studentProfile.college}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>

                    {mentee.message && (
                      <div className="mentee-message">
                        <MessageCircle size={16} />

                        <p>{mentee.message}</p>
                      </div>
                    )}

                    <div className="mentee-card-footer">
                      <div className="connection-date">
                        <CalendarDays size={15} />

                        <span>
                          Connected{" "}
                          {mentee.updatedAt
                            ? new Date(
                                mentee.updatedAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recently"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="view-mentee-button"
                      >
                        View
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default MenteesPage;