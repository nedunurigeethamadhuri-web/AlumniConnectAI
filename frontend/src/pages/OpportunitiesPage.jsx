import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  CalendarDays,
  BriefcaseBusiness,
  GraduationCap,
  Trophy,
  Award,
  Code2,
  Users,
  SlidersHorizontal,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./OpportunitiesPage.css";

const API_BASE_URL = "http://localhost:5000/api";

const opportunityTypes = [
  { value: "ALL", label: "All Opportunities" },
  { value: "INTERNSHIP", label: "Internships" },
  { value: "JOB", label: "Jobs" },
  { value: "HACKATHON", label: "Hackathons" },
  { value: "SCHOLARSHIP", label: "Scholarships" },
  { value: "COMPETITION", label: "Competitions" },
  { value: "WORKSHOP", label: "Workshops" },
  { value: "FELLOWSHIP", label: "Fellowships" },
  { value: "OTHER", label: "Other" },
];

const opportunityModes = [
  { value: "ALL", label: "All Modes" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const typeIconMap = {
  INTERNSHIP: BriefcaseBusiness,
  JOB: BriefcaseBusiness,
  HACKATHON: Code2,
  SCHOLARSHIP: GraduationCap,
  COMPETITION: Trophy,
  WORKSHOP: Users,
  FELLOWSHIP: Award,
  OTHER: Sparkles,
};

const getToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

const formatType = (type) => {
  if (!type) return "Opportunity";

  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "No deadline";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No deadline";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isDeadlinePassed = (date) => {
  if (!date) return false;

  const deadline = new Date(date);

  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  return deadline.getTime() < Date.now();
};

const getDeadlineText = (date) => {
  if (!date) return "No deadline";

  if (isDeadlinePassed(date)) {
    return "Deadline passed";
  }

  return `Apply by ${formatDate(date)}`;
};

function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [savedOpportunities, setSavedOpportunities] =
    useState([]);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] =
    useState("ALL");
  const [selectedMode, setSelectedMode] =
    useState("ALL");
  const [location, setLocation] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    company: "",
    organization: "",
    type: "INTERNSHIP",
    mode: "REMOTE",
    location: "",
    skills: "",
    salary: "",
    stipend: "",
    deadline: "",
    applicationUrl: "",
    imageUrl: "",
  });

  const token = getToken();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (selectedType !== "ALL") {
        params.set("type", selectedType);
      }

      if (selectedMode !== "ALL") {
        params.set("mode", selectedMode);
      }

      if (location.trim()) {
        params.set("location", location.trim());
      }

      params.set("page", page);
      params.set("limit", 12);

      const response = await fetch(
        `${API_BASE_URL}/opportunities?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load opportunities."
        );
      }

      setOpportunities(
        result.data?.opportunities || []
      );

      setPagination(
        result.data?.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error(
        "Fetch opportunities error:",
        err
      );

      setError(
        err.message ||
          "Unable to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedOpportunities = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/opportunities/saved`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return;
      }

      setSavedOpportunities(
        result.data?.opportunities || []
      );
    } catch (err) {
      console.error(
        "Fetch saved opportunities error:",
        err
      );
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [
    page,
    selectedType,
    selectedMode,
    location,
  ]);

  useEffect(() => {
    fetchSavedOpportunities();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
        return;
      }

      fetchOpportunities();
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  const savedIds = useMemo(() => {
    return new Set(
      savedOpportunities.map(
        (opportunity) => opportunity.id
      )
    );
  }, [savedOpportunities]);

  const displayedOpportunities = useMemo(() => {
    if (activeTab === "saved") {
      return savedOpportunities;
    }

    return opportunities;
  }, [
    activeTab,
    opportunities,
    savedOpportunities,
  ]);

  const handleToggleBookmark = async (
    opportunityId
  ) => {
    try {
      setSavingId(opportunityId);

      const response = await fetch(
        `${API_BASE_URL}/opportunities/${opportunityId}/bookmark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update saved opportunity."
        );
      }

      const isSaved = result.data?.isSaved;

      setOpportunities((current) =>
        current.map((opportunity) =>
          opportunity.id === opportunityId
            ? {
                ...opportunity,
                isSaved,
              }
            : opportunity
        )
      );

      if (isSaved) {
        const selectedOpportunity =
          opportunities.find(
            (opportunity) =>
              opportunity.id === opportunityId
          );

        if (selectedOpportunity) {
          setSavedOpportunities((current) => [
            {
              ...selectedOpportunity,
              isSaved: true,
            },
            ...current.filter(
              (item) =>
                item.id !== opportunityId
            ),
          ]);
        }
      } else {
        setSavedOpportunities((current) =>
          current.filter(
            (item) =>
              item.id !== opportunityId
          )
        );
      }
    } catch (err) {
      console.error(
        "Toggle bookmark error:",
        err
      );

      alert(
        err.message ||
          "Unable to update saved opportunity."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateOpportunity = async (
    event
  ) => {
    event.preventDefault();

    try {
      setCreating(true);

      const response = await fetch(
        `${API_BASE_URL}/opportunities`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...createForm,
            deadline: createForm.deadline
              ? new Date(
                  createForm.deadline
                ).toISOString()
              : null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to create opportunity."
        );
      }

      setShowCreateModal(false);

      setCreateForm({
        title: "",
        description: "",
        company: "",
        organization: "",
        type: "INTERNSHIP",
        mode: "REMOTE",
        location: "",
        skills: "",
        salary: "",
        stipend: "",
        deadline: "",
        applicationUrl: "",
        imageUrl: "",
      });

      setPage(1);

      await fetchOpportunities();

      alert(
        "Opportunity created successfully."
      );
    } catch (err) {
      console.error(
        "Create opportunity error:",
        err
      );

      alert(
        err.message ||
          "Unable to create opportunity."
      );
    } finally {
      setCreating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedType("ALL");
    setSelectedMode("ALL");
    setLocation("");
    setPage(1);
  };

  const hasActiveFilters =
    selectedType !== "ALL" ||
    selectedMode !== "ALL" ||
    location.trim() !== "";

  return (
    <div className="opportunities-page">
      <div className="opportunities-container">

        {/* HEADER */}
        <header className="opportunities-header">
          <div className="opportunities-heading">
            <div className="opportunities-title-icon">
              <Sparkles size={22} />
            </div>

            <div>
              <span className="opportunities-eyebrow">
                CAREER DISCOVERY
              </span>

              <h1>
                Opportunities
              </h1>

              <p>
                Discover internships, jobs,
                hackathons, scholarships and
                career-building opportunities.
              </p>
            </div>
          </div>

          <div className="opportunities-header-actions">
            <Link
              to="/dashboard"
              className="back-dashboard-button"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <button
              type="button"
              className="create-opportunity-button"
              onClick={() =>
                setShowCreateModal(true)
              }
            >
              <Plus size={18} />
              Post Opportunity
            </button>
          </div>
        </header>

        {/* SEARCH */}
        <section className="opportunities-search-section">
          <div className="opportunities-search">
            <Search size={20} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search internships, jobs, skills, companies..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`filter-toggle ${
              showFilters
                ? "filter-toggle-active"
                : ""
            }`}
            onClick={() =>
              setShowFilters(
                (current) => !current
              )
            }
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </section>

        {/* FILTERS */}
        <section
          className={`opportunity-filters ${
            showFilters
              ? "opportunity-filters-open"
              : ""
          }`}
        >
          <div className="filter-group">
            <label>Type</label>

            <select
              value={selectedType}
              onChange={(event) => {
                setSelectedType(
                  event.target.value
                );
                setPage(1);
              }}
            >
              {opportunityTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Mode</label>

            <select
              value={selectedMode}
              onChange={(event) => {
                setSelectedMode(
                  event.target.value
                );
                setPage(1);
              }}
            >
              {opportunityModes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>

            <input
              type="text"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setPage(1);
              }}
              placeholder="e.g. Bangalore"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-button"
              onClick={clearFilters}
            >
              <X size={16} />
              Clear
            </button>
          )}
        </section>

        {/* TABS */}
        <section className="opportunities-toolbar">
          <div className="opportunity-tabs">
            <button
              type="button"
              className={
                activeTab === "all"
                  ? "opportunity-tab active"
                  : "opportunity-tab"
              }
              onClick={() =>
                setActiveTab("all")
              }
            >
              All Opportunities
              <span>
                {pagination.total}
              </span>
            </button>

            <button
              type="button"
              className={
                activeTab === "saved"
                  ? "opportunity-tab active"
                  : "opportunity-tab"
              }
              onClick={() =>
                setActiveTab("saved")
              }
            >
              <Bookmark size={16} />
              Saved
              <span>
                {savedOpportunities.length}
              </span>
            </button>
          </div>

          {activeTab === "all" &&
            pagination.total > 0 && (
              <span className="results-count">
                {pagination.total} opportunities
              </span>
            )}
        </section>

        {/* ERROR */}
        {error && (
          <div className="opportunities-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchOpportunities}
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && activeTab === "all" ? (
          <div className="opportunities-grid">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  className="opportunity-skeleton"
                  key={index}
                >
                  <div className="skeleton-line skeleton-small"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line skeleton-medium"></div>
                  <div className="skeleton-block"></div>
                  <div className="skeleton-line"></div>
                </div>
              )
            )}
          </div>
        ) : displayedOpportunities.length > 0 ? (
          <div className="opportunities-grid">
            {displayedOpportunities.map(
              (opportunity) => {
                const Icon =
                  typeIconMap[
                    opportunity.type
                  ] || Sparkles;

                const isSaved =
                  opportunity.isSaved ||
                  savedIds.has(
                    opportunity.id
                  );

                const expired =
                  isDeadlinePassed(
                    opportunity.deadline
                  );

                return (
                  <article
                    className={`opportunity-card ${
                      expired
                        ? "opportunity-expired"
                        : ""
                    }`}
                    key={opportunity.id}
                  >
                    <div className="opportunity-card-top">
                      <div className="opportunity-type-icon">
                        <Icon size={21} />
                      </div>

                      <div className="opportunity-card-actions">
                        <button
                          type="button"
                          className={`bookmark-button ${
                            isSaved
                              ? "bookmark-active"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggleBookmark(
                              opportunity.id
                            )
                          }
                          disabled={
                            savingId ===
                            opportunity.id
                          }
                          aria-label={
                            isSaved
                              ? "Remove from saved"
                              : "Save opportunity"
                          }
                        >
                          {isSaved ? (
                            <BookmarkCheck
                              size={19}
                            />
                          ) : (
                            <Bookmark size={19} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="opportunity-type-label">
                      {formatType(
                        opportunity.type
                      )}
                    </div>

                    <h2>
                      {opportunity.title}
                    </h2>

                    <div className="opportunity-company">
                      {opportunity.company ||
                        opportunity.organization ||
                        "Organization not specified"}
                    </div>

                    <p className="opportunity-description">
                      {opportunity.description}
                    </p>

                    <div className="opportunity-meta">
                      {opportunity.mode && (
                        <span>
                          <BriefcaseBusiness
                            size={15}
                          />
                          {formatType(
                            opportunity.mode
                          )}
                        </span>
                      )}

                      {opportunity.location && (
                        <span>
                          <MapPin size={15} />
                          {opportunity.location}
                        </span>
                      )}

                      {opportunity.deadline && (
                        <span
                          className={
                            expired
                              ? "deadline-expired"
                              : ""
                          }
                        >
                          <CalendarDays
                            size={15}
                          />
                          {getDeadlineText(
                            opportunity.deadline
                          )}
                        </span>
                      )}
                    </div>

                    {opportunity.skills && (
                      <div className="opportunity-skills">
                        {opportunity.skills
                          .split(",")
                          .map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={`${skill}-${index}`}
                              >
                                {skill.trim()}
                              </span>
                            )
                          )}
                      </div>
                    )}

                    {(opportunity.salary ||
                      opportunity.stipend) && (
                      <div className="opportunity-compensation">
                        <span>
                          {opportunity.salary
                            ? "Salary"
                            : "Stipend"}
                        </span>

                        <strong>
                          {opportunity.salary ||
                            opportunity.stipend}
                        </strong>
                      </div>
                    )}

                    <div className="opportunity-card-footer">
                      <span className="posted-date">
                        Posted{" "}
                        {formatDate(
                          opportunity.createdAt
                        )}
                      </span>

                      {opportunity.applicationUrl ? (
                        <a
                          href={
                            opportunity.applicationUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`apply-button ${
                            expired
                              ? "apply-button-disabled"
                              : ""
                          }`}
                          onClick={(event) => {
                            if (expired) {
                              event.preventDefault();
                            }
                          }}
                        >
                          {expired
                            ? "Closed"
                            : "Apply Now"}
                          <ExternalLink
                            size={15}
                          />
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="apply-button apply-button-disabled"
                          disabled
                        >
                          No Application Link
                        </button>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div className="empty-opportunities">
            <div className="empty-opportunities-icon">
              <BriefcaseBusiness size={30} />
            </div>

            <h2>
              {activeTab === "saved"
                ? "No saved opportunities"
                : "No opportunities found"}
            </h2>

            <p>
              {activeTab === "saved"
                ? "Save opportunities you want to explore later."
                : "Try changing your search or filters."}
            </p>

            {activeTab === "all" &&
              hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
          </div>
        )}

        {/* PAGINATION */}
        {activeTab === "all" &&
          pagination.totalPages > 1 && (
            <div className="opportunities-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(current - 1, 1)
                  )
                }
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <div className="pagination-pages">
                {Array.from(
                  {
                    length:
                      pagination.totalPages,
                  },
                  (_, index) => index + 1
                )
                  .slice(
                    Math.max(page - 3, 0),
                    Math.min(
                      page + 2,
                      pagination.totalPages
                    )
                  )
                  .map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        pageNumber === page
                          ? "pagination-page active"
                          : "pagination-page"
                      }
                      onClick={() =>
                        setPage(pageNumber)
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}
              </div>

              <button
                type="button"
                disabled={
                  page >=
                  pagination.totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        current + 1,
                        pagination.totalPages
                      )
                  )
                }
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          )}

        {/* CREATE MODAL */}
        {showCreateModal && (
          <div
            className="opportunity-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowCreateModal(false);
              }
            }}
          >
            <div className="opportunity-modal">
              <div className="opportunity-modal-header">
                <div>
                  <span>
                    CREATE OPPORTUNITY
                  </span>

                  <h2>
                    Post a new opportunity
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  handleCreateOpportunity
                }
              >
                <div className="form-grid">
                  <div className="form-field form-field-full">
                    <label>
                      Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={
                        createForm.title
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="e.g. AI/ML Developer Internship"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Company
                    </label>

                    <input
                      type="text"
                      name="company"
                      value={
                        createForm.company
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="Company name"
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Organization
                    </label>

                    <input
                      type="text"
                      name="organization"
                      value={
                        createForm.organization
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="Organization"
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Type *
                    </label>

                    <select
                      name="type"
                      value={
                        createForm.type
                      }
                      onChange={
                        handleCreateChange
                      }
                      required
                    >
                      {opportunityTypes
                        .filter(
                          (item) =>
                            item.value !==
                            "ALL"
                        )
                        .map((item) => (
                          <option
                            key={
                              item.value
                            }
                            value={
                              item.value
                            }
                          >
                            {item.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      Mode *
                    </label>

                    <select
                      name="mode"
                      value={
                        createForm.mode
                      }
                      onChange={
                        handleCreateChange
                      }
                    >
                      {opportunityModes
                        .filter(
                          (item) =>
                            item.value !==
                            "ALL"
                        )
                        .map((item) => (
                          <option
                            key={
                              item.value
                            }
                            value={
                              item.value
                            }
                          >
                            {item.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      Location
                    </label>

                    <input
                      type="text"
                      name="location"
                      value={
                        createForm.location
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="Remote / Bangalore"
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Skills
                    </label>

                    <input
                      type="text"
                      name="skills"
                      value={
                        createForm.skills
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="Python, ML, Java"
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Salary
                    </label>

                    <input
                      type="text"
                      name="salary"
                      value={
                        createForm.salary
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="e.g. ₹8 LPA"
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Stipend
                    </label>

                    <input
                      type="text"
                      name="stipend"
                      value={
                        createForm.stipend
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="e.g. ₹15,000/month"
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Deadline
                    </label>

                    <input
                      type="datetime-local"
                      name="deadline"
                      value={
                        createForm.deadline
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </div>

                  <div className="form-field form-field-full">
                    <label>
                      Application URL
                    </label>

                    <input
                      type="url"
                      name="applicationUrl"
                      value={
                        createForm.applicationUrl
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-field form-field-full">
                    <label>
                      Description *
                    </label>

                    <textarea
                      name="description"
                      value={
                        createForm.description
                      }
                      onChange={
                        handleCreateChange
                      }
                      placeholder="Describe the opportunity..."
                      rows="5"
                      required
                    />
                  </div>
                </div>

                <div className="opportunity-modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={() =>
                      setShowCreateModal(
                        false
                      )
                    }
                    disabled={creating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="modal-submit-button"
                    disabled={creating}
                  >
                    {creating
                      ? "Creating..."
                      : "Create Opportunity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunitiesPage;