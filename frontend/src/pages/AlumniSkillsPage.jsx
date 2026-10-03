import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Check,
  Code2,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AlumniSkillsPage.css";

const levels = [
  {
    value: "BEGINNER",
    label: "Beginner",
    percentage: 35,
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    percentage: 60,
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    percentage: 80,
  },
  {
    value: "EXPERT",
    label: "Expert",
    percentage: 95,
  },
];

function AlumniSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    level: "INTERMEDIATE",
    years: "",
  });

  const token = localStorage.getItem("accessToken");

  async function loadSkills() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/alumni/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSkills(response.data.data?.skills || []);
    } catch (err) {
      console.error("Unable to load alumni skills:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your skills. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      name: "",
      category: "",
      description: "",
      level: "INTERMEDIATE",
      years: "",
    });

    setEditingSkill(null);
    setShowForm(false);
  }

  function openAddForm() {
    setSuccess("");
    setError("");
    setEditingSkill(null);

    setFormData({
      name: "",
      category: "",
      description: "",
      level: "INTERMEDIATE",
      years: "",
    });

    setShowForm(true);
  }

  function openEditForm(skillItem) {
    setSuccess("");
    setError("");
    setEditingSkill(skillItem);

    setFormData({
      name: skillItem.skill?.name || "",
      category: skillItem.skill?.category || "",
      description: skillItem.skill?.description || "",
      level: skillItem.level || "INTERMEDIATE",
      years:
        skillItem.years !== null && skillItem.years !== undefined
          ? String(skillItem.years)
          : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Skill name is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingSkill) {
        await api.put(
          `/alumni/skills/${editingSkill.id}`,
          {
            level: formData.level,
            years: formData.years,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess("Skill updated successfully.");
      } else {
        await api.post(
          "/alumni/skills",
          {
            name: formData.name.trim(),
            category: formData.category.trim(),
            description: formData.description.trim(),
            level: formData.level,
            years: formData.years,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess("Skill added successfully.");
      }

      resetForm();
      await loadSkills();
    } catch (err) {
      console.error("Unable to save alumni skill:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save skill. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(skillId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to remove this skill?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/alumni/skills/${skillId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Skill removed successfully.");

      await loadSkills();
    } catch (err) {
      console.error("Unable to delete alumni skill:", err);

      setError(
        err.response?.data?.message ||
          "Unable to remove skill. Please try again."
      );
    }
  }

  function getLevelData(level) {
    return (
      levels.find((item) => item.value === level) || levels[1]
    );
  }

  return (
    <div className="alumni-skills-page">
      <header className="skills-header">
        <div className="skills-header-left">
          <Link to="/dashboard" className="back-button">
            <ArrowLeft size={18} />
          </Link>

          <div>
            <p className="page-eyebrow">ALUMNI EXPERTISE</p>
            <h1>My Skills</h1>
            <p className="page-subtitle">
              Manage the skills and expertise you offer as a mentor.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="add-skill-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Skill
        </button>
      </header>

      <main className="skills-content">
        {error && (
          <div className="skills-alert error-alert">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="skills-alert success-alert">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        {showForm && (
          <section className="skill-form-card">
            <div className="form-card-header">
              <div>
                <span className="form-eyebrow">
                  {editingSkill ? "UPDATE EXPERTISE" : "NEW EXPERTISE"}
                </span>

                <h2>
                  {editingSkill
                    ? "Edit your skill"
                    : "Add a new skill"}
                </h2>
              </div>

              <button
                type="button"
                className="close-form-button"
                onClick={resetForm}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Java"
                    disabled={Boolean(editingSkill)}
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Programming"
                    disabled={Boolean(editingSkill)}
                  />
                </div>

                <div className="form-field">
                  <label>Skill Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    {levels.map((level) => (
                      <option
                        key={level.value}
                        value={level.value}
                      >
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="years"
                    value={formData.years}
                    onChange={handleInputChange}
                    placeholder="e.g. 3"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="form-field description-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your expertise..."
                  rows="4"
                  disabled={Boolean(editingSkill)}
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : editingSkill ? (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Add Skill
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="skills-summary">
          <div className="summary-card">
            <div className="summary-icon purple">
              <Award size={21} />
            </div>

            <div>
              <span>Total Skills</span>
              <strong>{skills.length}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon blue">
              <Code2 size={21} />
            </div>

            <div>
              <span>Expertise Areas</span>
              <strong>
                {
                  new Set(
                    skills
                      .map((item) => item.skill?.category)
                      .filter(Boolean)
                  ).size
                }
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">
              <BriefcaseBusiness size={21} />
            </div>

            <div>
              <span>Mentor Skills</span>
              <strong>{skills.length}</strong>
            </div>
          </div>
        </section>

        <section className="skills-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">YOUR EXPERTISE</span>
              <h2>Skills you can mentor</h2>
            </div>

            <span className="skill-count">
              {skills.length}{" "}
              {skills.length === 1 ? "skill" : "skills"}
            </span>
          </div>

          {loading ? (
            <div className="skills-loading">
              <div className="loading-spinner"></div>
              <p>Loading your skills...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="empty-skills">
              <div className="empty-icon">
                <Award size={30} />
              </div>

              <h3>No skills added yet</h3>

              <p>
                Add your technical skills and expertise so the
                matching engine can connect you with relevant
                students.
              </p>

              <button
                type="button"
                className="add-skill-button empty-add-button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add Your First Skill
              </button>
            </div>
          ) : (
            <div className="skills-grid">
              {skills.map((item) => {
                const levelData = getLevelData(item.level);

                return (
                  <article
                    className="skill-card"
                    key={item.id}
                  >
                    <div className="skill-card-top">
                      <div className="skill-icon">
                        <Code2 size={22} />
                      </div>

                      <div className="skill-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          aria-label={`Edit ${
                            item.skill?.name || "skill"
                          }`}
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Delete ${
                            item.skill?.name || "skill"
                          }`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <h3>{item.skill?.name || "Skill"}</h3>

                    <div className="skill-meta">
                      <span>
                        {item.skill?.category || "Technical Skill"}
                      </span>

                      {item.years !== null &&
                        item.years !== undefined && (
                          <span>
                            {item.years}{" "}
                            {Number(item.years) === 1
                              ? "year"
                              : "years"}
                          </span>
                        )}
                    </div>

                    {item.skill?.description && (
                      <p className="skill-description">
                        {item.skill.description}
                      </p>
                    )}

                    <div className="skill-level-row">
                      <span>Level</span>

                      <strong>{levelData.label}</strong>
                    </div>

                    <div className="skill-progress">
                      <div
                        className="skill-progress-fill"
                        style={{
                          width: `${levelData.percentage}%`,
                        }}
                      ></div>
                    </div>

                    <div className="skill-percentage">
                      <span>Mentorship readiness</span>
                      <strong>
                        {levelData.percentage}%
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AlumniSkillsPage;