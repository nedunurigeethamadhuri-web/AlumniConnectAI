import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";
import "./MentorRecommendationsPage.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getScoreClass(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  return "moderate";
}

function MentorRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minimumScore, setMinimumScore] = useState("0");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/alumni/recommendations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mentors =
          response.data?.data?.recommendations || [];

        setRecommendations(mentors);
      } catch (err) {
        console.error("Mentor recommendation error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load mentor recommendations. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [token]);

  const filteredRecommendations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const score = Number(minimumScore);

    return recommendations.filter((mentor) => {
      const searchableText = [
        mentor.name,
        mentor.company,
        mentor.designation,
        mentor.industry,
        mentor.location,
        mentor.mentorshipAreas,
        ...(mentor.matchedSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        Number(mentor.matchScore || 0) >= score
      );
    });
  }, [recommendations, searchTerm, minimumScore]);

  const averageMatch = useMemo(() => {
    if (!recommendations.length) return 0;

    const total = recommendations.reduce(
      (sum, mentor) => sum + Number(mentor.matchScore || 0),
      0
    );

    return Math.round(total / recommendations.length);
  }, [recommendations]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mentor-page">

      {/* TOP BAR */}
      <header className="mentor-topbar">
        <div className="mentor-topbar-inner">

          <Link
            to="/dashboard"
            className="mentor-back-link"
          >
            <span className="icon-text">←</span>
            <span>Back to Dashboard</span>
          </Link>

          <div className="mentor-brand">
            <div className="mentor-brand-icon">
              ✨
            </div>

            <div>
              <h1>AlumniConnect</h1>
              <span>AI Mentor Matching</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mentor-page-content">

        {/* HERO */}
        <section className="mentor-hero">

          <div className="mentor-hero-content">

            <div className="mentor-eyebrow">
              <span>✨</span>
              <span>Intelligent Mentor Discovery</span>
            </div>

            <h2>
              Find mentors who match your career journey.
            </h2>

            <p>
              Our AI matching engine analyzes your skills and
              compares them with alumni expertise, professional
              experience, and mentorship areas to find relevant
              mentors.
            </p>

            <div className="mentor-hero-stats">

              <div className="hero-stat">
                <div className="hero-stat-icon">
                  👥
                </div>

                <div>
                  <strong>
                    {recommendations.length}
                  </strong>
                  <span>Mentors analyzed</span>
                </div>
              </div>

              <div className="hero-stat">
                <div className="hero-stat-icon">
                  🎯
                </div>

                <div>
                  <strong>
                    {averageMatch}%
                  </strong>
                  <span>Average match</span>
                </div>
              </div>

              <div className="hero-stat">
                <div className="hero-stat-icon">
                  ✨
                </div>

                <div>
                  <strong>AI</strong>
                  <span>Powered matching</span>
                </div>
              </div>

            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="mentor-hero-visual">

            <div className="ai-orbit orbit-one"></div>
            <div className="ai-orbit orbit-two"></div>

            <div className="ai-center">
              ✨
            </div>

            <div className="floating-node node-one">
              👥
            </div>

            <div className="floating-node node-two">
              🎯
            </div>

            <div className="floating-node node-three">
              🏆
            </div>

          </div>
        </section>

        {/* SEARCH / FILTER */}
        <section className="mentor-toolbar">

          <div className="mentor-search">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by mentor, company, skill or expertise..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}

          </div>

          <div className="score-filter">

            <label htmlFor="minimum-score">
              Minimum match
            </label>

            <select
              id="minimum-score"
              value={minimumScore}
              onChange={(event) =>
                setMinimumScore(event.target.value)
              }
            >
              <option value="0">
                All matches
              </option>

              <option value="80">
                80% and above
              </option>

              <option value="70">
                70% and above
              </option>

              <option value="60">
                60% and above
              </option>

              <option value="50">
                50% and above
              </option>
            </select>

          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <section className="mentor-state">

            <div className="loading-spinner"></div>

            <h3>
              Finding your best mentors...
            </h3>

            <p>
              Our matching engine is analyzing alumni
              expertise against your skills.
            </p>

          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="mentor-state error-state">

            <div className="state-icon error-icon">
              ✕
            </div>

            <h3>
              Unable to load recommendations
            </h3>

            <p>{error}</p>

            <button
              type="button"
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

          </section>
        )}

        {/* NO MENTORS */}
        {!loading &&
          !error &&
          recommendations.length === 0 && (
            <section className="mentor-state empty-state">

              <div className="state-icon">
                👥
              </div>

              <h3>
                No mentor recommendations yet
              </h3>

              <p>
                Add more skills to your student profile so the AI
                matching engine can find suitable alumni mentors.
              </p>

              <Link
                to="/skills"
                className="primary-action"
              >
                Add My Skills
                <span>→</span>
              </Link>

            </section>
          )}

        {/* NO FILTER RESULTS */}
        {!loading &&
          !error &&
          recommendations.length > 0 &&
          filteredRecommendations.length === 0 && (
            <section className="mentor-state empty-state">

              <div className="state-icon">
                🔍
              </div>

              <h3>
                No mentors match your filters
              </h3>

              <p>
                Try a different search term or lower the
                minimum match percentage.
              </p>

              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setSearchTerm("");
                  setMinimumScore("0");
                }}
              >
                Clear Filters
              </button>

            </section>
          )}

        {/* RESULTS */}
        {!loading &&
          !error &&
          filteredRecommendations.length > 0 && (
            <section className="mentor-results">

              <div className="results-heading">

                <div>
                  <span className="section-label">
                    AI RECOMMENDATIONS
                  </span>

                  <h3>
                    Recommended mentors{" "}
                    <span>
                      {filteredRecommendations.length}
                    </span>
                  </h3>
                </div>

                <p>
                  Ranked by compatibility with your profile
                </p>

              </div>

              <div className="mentor-grid">

                {filteredRecommendations.map((mentor) => {
                  const score = Number(
                    mentor.matchScore || 0
                  );

                  const scoreClass =
                    getScoreClass(score);

                  return (
                    <article
                      className="mentor-card"
                      key={mentor.alumniId}
                    >

                      {/* CARD HEADER */}
                      <div className="mentor-card-top">

                        <div className="mentor-profile">

                          {mentor.profileImage ? (
                            <img
                              src={mentor.profileImage}
                              alt={mentor.name}
                              className="mentor-avatar"
                            />
                          ) : (
                            <div className="mentor-avatar mentor-initials">
                              {getInitials(mentor.name)}
                            </div>
                          )}

                          <div className="mentor-basic-info">

                            <h4>
                              {mentor.name}
                            </h4>

                            <p>
                              {mentor.designation ||
                                "Experienced Professional"}
                            </p>

                            {mentor.company && (
                              <span>
                                💼 {mentor.company}
                              </span>
                            )}

                          </div>
                        </div>

                        <div
                          className={`match-score ${scoreClass}`}
                        >
                          <strong>
                            {score}%
                          </strong>

                          <span>
                            Match
                          </span>
                        </div>

                      </div>

                      {/* META */}
                      <div className="mentor-meta">

                        {mentor.location && (
                          <span>
                            📍 {mentor.location}
                          </span>
                        )}

                        {mentor.experienceYears > 0 && (
                          <span>
                            💼{" "}
                            {mentor.experienceYears}{" "}
                            {mentor.experienceYears === 1
                              ? "year"
                              : "years"}{" "}
                            experience
                          </span>
                        )}

                        {mentor.availability && (
                          <span>
                            🕐 {mentor.availability}
                          </span>
                        )}

                      </div>

                      {/* BIO */}
                      {mentor.bio && (
                        <p className="mentor-bio">
                          {mentor.bio}
                        </p>
                      )}

                      {/* MATCHED SKILLS */}
                      {mentor.matchedSkills?.length > 0 && (
                        <div className="mentor-section">

                          <div className="mentor-section-title">
                            <span>✓</span>
                            Skills matched
                          </div>

                          <div className="skill-chips">

                            {mentor.matchedSkills.map(
                              (skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      {/* MENTORSHIP AREAS */}
                      {mentor.mentorshipAreas && (
                        <div className="mentor-section">

                          <div className="mentor-section-title">
                            <span>🎯</span>
                            Mentorship areas
                          </div>

                          <p className="mentorship-areas">
                            {mentor.mentorshipAreas}
                          </p>

                        </div>
                      )}

                      {/* REASONS */}
                      {mentor.reasons?.length > 0 && (
                        <div className="mentor-section">

                          <div className="mentor-section-title">
                            <span>✨</span>
                            Why this mentor?
                          </div>

                          <ul className="reason-list">

                            {mentor.reasons.map(
                              (reason, index) => (
                                <li
                                  key={`${reason}-${index}`}
                                >
                                  <span>✓</span>
                                  <span>
                                    {reason}
                                  </span>
                                </li>
                              )
                            )}

                          </ul>

                        </div>
                      )}

                      {/* MATCH BREAKDOWN */}
                      <div className="match-breakdown">

                        <div className="breakdown-heading">

                          <span>
                            AI match breakdown
                          </span>

                          <strong>
                            {score}%
                          </strong>

                        </div>

                        {/* SKILL */}
                        <div className="breakdown-item">

                          <div>
                            <span>
                              Skill compatibility
                            </span>

                            <strong>
                              {mentor.matchBreakdown
                                ?.skillMatch || 0}
                              %
                            </strong>
                          </div>

                          <div className="breakdown-track">

                            <div
                              className="breakdown-fill"
                              style={{
                                width: `${
                                  mentor.matchBreakdown
                                    ?.skillMatch || 0
                                }%`,
                              }}
                            ></div>

                          </div>
                        </div>

                        {/* EXPERIENCE */}
                        <div className="breakdown-item">

                          <div>
                            <span>
                              Experience
                            </span>

                            <strong>
                              {mentor.matchBreakdown
                                ?.experienceScore || 0}
                              %
                            </strong>
                          </div>

                          <div className="breakdown-track">

                            <div
                              className="breakdown-fill"
                              style={{
                                width: `${
                                  mentor.matchBreakdown
                                    ?.experienceScore || 0
                                }%`,
                              }}
                            ></div>

                          </div>
                        </div>

                        {/* MENTORSHIP */}
                        <div className="breakdown-item">

                          <div>
                            <span>
                              Mentorship alignment
                            </span>

                            <strong>
                              {mentor.matchBreakdown
                                ?.mentorshipMatch || 0}
                              %
                            </strong>
                          </div>

                          <div className="breakdown-track">

                            <div
                              className="breakdown-fill"
                              style={{
                                width: `${
                                  mentor.matchBreakdown
                                    ?.mentorshipMatch || 0
                                }%`,
                              }}
                            ></div>

                          </div>
                        </div>

                      </div>

                      {/* FOOTER */}
                      <div className="mentor-card-footer">

                        <div className="mentor-social-links">

                          {mentor.linkedinUrl && (
                            <a
                              href={mentor.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${mentor.name} LinkedIn`}
                              title="LinkedIn"
                            >
                              in
                            </a>
                          )}

                          {mentor.githubUrl && (
                            <a
                              href={mentor.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${mentor.name} GitHub`}
                              title="GitHub"
                            >
                              GH
                            </a>
                          )}

                          {mentor.portfolioUrl && (
                            <a
                              href={mentor.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${mentor.name} Portfolio`}
                              title="Portfolio"
                            >
                              ↗
                            </a>
                          )}

                        </div>

                        <button
                          type="button"
                          className="request-button"
                          disabled
                          title="Mentorship request workflow will be connected next"
                        >
                          Request Mentorship
                          <span>→</span>
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            </section>
          )}

      </main>
    </div>
  );
}

export default MentorRecommendationsPage;