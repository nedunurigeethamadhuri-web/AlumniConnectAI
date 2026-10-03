import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Code2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";
import "./SkillsPage.css";

const skillLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    level: "BEGINNER",
    years: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login to manage your skills.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSkills(response.data.data.skills || []);
    } catch (requestError) {
      console.error("Load skills error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load your skills."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleAddSkill(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter a skill name.");
      return;
    }

    setAdding(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("accessToken");

    try {
      const response = await api.post(
        "/skills",
        {
          name: formData.name,
          category: formData.category,
          level: formData.level,
          years: formData.years,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills((previous) => [
        response.data.data.skill,
        ...previous,
      ]);

      setFormData({
        name: "",
        category: "",
        level: "BEGINNER",
        years: "",
      });

      setMessage("Skill added successfully.");
    } catch (requestError) {
      console.error("Add skill error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to add skill."
      );
    } finally {
      setAdding(false);
    }
  }

  function handleSkillChange(skillId, field, value) {
    setSkills((previous) =>
      previous.map((item) =>
        item.id === skillId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

    setMessage("");
    setError("");
  }

  async function handleUpdateSkill(skillId) {
    const selectedSkill = skills.find(
      (item) => item.id === skillId
    );

    if (!selectedSkill) {
      return;
    }

    setSavingId(skillId);
    setMessage("");
    setError("");

    const token = localStorage.getItem("accessToken");

    try {
      const response = await api.put(
        `/skills/${skillId}`,
        {
          level: selectedSkill.level,
          years: selectedSkill.years,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills((previous) =>
        previous.map((item) =>
          item.id === skillId
            ? response.data.data.skill
            : item
        )
      );

      setMessage("Skill updated successfully.");
    } catch (requestError) {
      console.error("Update skill error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update skill."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteSkill(skillId) {
    const token = localStorage.getItem("accessToken");

    setDeletingId(skillId);
    setMessage("");
    setError("");

    try {
      await api.delete(`/skills/${skillId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSkills((previous) =>
        previous.filter((item) => item.id !== skillId)
      );

      setMessage("Skill removed successfully.");
    } catch (requestError) {
      console.error("Delete skill error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to remove skill."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getLevelPercentage(level) {
    const percentages = {
      BEGINNER: 25,
      INTERMEDIATE: 50,
      ADVANCED: 75,
      EXPERT: 100,
    };

    return percentages[level] || 25;
  }

  if (loading) {
    return (
      <div className="skills-loading">
        <Loader2 className="skills-loader" size={32} />
        <p>Loading your skills...</p>
      </div>
    );
  }

  return (
    <div className="skills-page">
      <header className="skills-topbar">
        <Link to="/dashboard" className="skills-back">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="skills-logo">
          Alumni<span>Connect</span>
        </div>
      </header>

      <main className="skills-content">
        <section className="skills-hero">
          <div>
            <span className="skills-eyebrow">
              YOUR SKILL PROFILE
            </span>

            <h1>Build your skill portfolio</h1>

            <p>
              Add your technical and professional skills.
              AlumniConnect AI will use them for mentor matching,
              skill-gap analysis and personalized career guidance.
            </p>
          </div>

          <div className="skills-hero-stat">
            <div className="skills-stat-icon">
              <Award size={21} />
            </div>

            <div>
              <strong>{skills.length}</strong>
              <span>Skills tracked</span>
            </div>
          </div>
        </section>

        {message && (
          <div className="skills-success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="skills-error">
            {error}
          </div>
        )}

        <section className="skills-layout">
          <div className="skills-main-card">
            <div className="skills-card-heading">
              <div className="skills-heading-icon">
                <Code2 size={20} />
              </div>

              <div>
                <h2>Your skills</h2>
                <p>
                  Keep your skill levels updated as you improve.
                </p>
              </div>
            </div>

            {skills.length === 0 ? (
              <div className="skills-empty">
                <div className="empty-icon">
                  <Sparkles size={25} />
                </div>

                <h3>No skills added yet</h3>

                <p>
                  Add your first skill to start building your
                  professional profile.
                </p>
              </div>
            ) : (
              <div className="skills-list">
                {skills.map((item) => {
                  const percentage = getLevelPercentage(
                    item.level
                  );

                  return (
                    <div
                      className="skill-item"
                      key={item.id}
                    >
                      <div className="skill-item-top">
                        <div className="skill-name-area">
                          <div className="skill-icon">
                            {item.skill.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{item.skill.name}</strong>

                            <span>
                              {item.skill.category ||
                                "Professional skill"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="delete-skill"
                          onClick={() =>
                            handleDeleteSkill(item.id)
                          }
                          disabled={
                            deletingId === item.id
                          }
                          aria-label={`Delete ${item.skill.name}`}
                        >
                          {deletingId === item.id ? (
                            <Loader2
                              size={17}
                              className="button-loader"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>

                      <div className="skill-controls">
                        <div className="skill-control">
                          <label>Level</label>

                          <select
                            value={item.level}
                            onChange={(event) =>
                              handleSkillChange(
                                item.id,
                                "level",
                                event.target.value
                              )
                            }
                          >
                            {skillLevels.map((level) => (
                              <option
                                key={level}
                                value={level}
                              >
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="skill-control years-control">
                          <label>Years</label>

                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.years ?? ""}
                            placeholder="0"
                            onChange={(event) =>
                              handleSkillChange(
                                item.id,
                                "years",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="update-skill-button"
                          onClick={() =>
                            handleUpdateSkill(item.id)
                          }
                          disabled={
                            savingId === item.id
                          }
                        >
                          {savingId === item.id ? (
                            <Loader2
                              size={16}
                              className="button-loader"
                            />
                          ) : (
                            <Save size={16} />
                          )}

                          Update
                        </button>
                      </div>

                      <div className="skill-progress">
                        <div className="skill-progress-info">
                          <span>Skill level</span>
                          <strong>{percentage}%</strong>
                        </div>

                        <div className="skill-progress-bar">
                          <div
                            style={{
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="skills-sidebar-card">
            <div className="skills-sidebar-icon">
              <Plus size={20} />
            </div>

            <h2>Add a new skill</h2>

            <p>
              Add skills that represent your technical knowledge,
              tools or professional strengths.
            </p>

            <form onSubmit={handleAddSkill}>
              <div className="skill-form-field">
                <label htmlFor="skillName">
                  Skill name
                </label>

                <input
                  id="skillName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Java"
                  required
                />
              </div>

              <div className="skill-form-field">
                <label htmlFor="skillCategory">
                  Category
                </label>

                <input
                  id="skillCategory"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Programming"
                />
              </div>

              <div className="skill-form-row">
                <div className="skill-form-field">
                  <label htmlFor="skillLevel">
                    Level
                  </label>

                  <select
                    id="skillLevel"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                  >
                    {skillLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="skill-form-field">
                  <label htmlFor="skillYears">
                    Years
                  </label>

                  <input
                    id="skillYears"
                    name="years"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.years}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="add-skill-button"
                disabled={adding}
              >
                {adding ? (
                  <>
                    <Loader2
                      size={17}
                      className="button-loader"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add skill
                  </>
                )}
              </button>
            </form>

            <div className="ai-skill-note">
              <Sparkles size={17} />

              <div>
                <strong>AI matching</strong>

                <p>
                  Your skills will help our matching engine find
                  relevant mentors and career opportunities.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="skill-insight-card">
          <div className="skill-insight-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>COMING NEXT</span>
            <h3>AI Skill Gap Analysis</h3>

            <p>
              Compare your current skills with the skills required
              for your target career and get a personalized
              improvement plan.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SkillsPage;