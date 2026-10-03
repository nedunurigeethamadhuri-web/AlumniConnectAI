import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";
import api from "../services/api";
import "./ProfilePage.css";

function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    careerGoal: "",
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    resumeUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login to access your profile.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/profile/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { user, profile, profileCompletion } =
        response.data.data;

      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: user?.location || "",
        college: profile?.college || "",
        degree: profile?.degree || "",
        branch: profile?.branch || "",
        graduationYear: profile?.graduationYear || "",
        careerGoal: profile?.careerGoal || "",
        bio: profile?.bio || "",
        githubUrl: profile?.githubUrl || "",
        linkedinUrl: profile?.linkedinUrl || "",
        portfolioUrl: profile?.portfolioUrl || "",
        resumeUrl: profile?.resumeUrl || "",
      });

      setCompletion(profileCompletion || 0);
    } catch (requestError) {
      console.error("Profile loading error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load your profile."
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

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("accessToken");

    try {
      const response = await api.put(
        "/profile",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          location: formData.location,
          college: formData.college,
          degree: formData.degree,
          branch: formData.branch,
          graduationYear: formData.graduationYear,
          careerGoal: formData.careerGoal,
          bio: formData.bio,
          githubUrl: formData.githubUrl,
          linkedinUrl: formData.linkedinUrl,
          portfolioUrl: formData.portfolioUrl,
          resumeUrl: formData.resumeUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { user, profile } = response.data.data;

      setFormData((previous) => ({
        ...previous,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        college: profile.college || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
        graduationYear: profile.graduationYear || "",
        careerGoal: profile.careerGoal || "",
        bio: profile.bio || "",
        githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        resumeUrl: profile.resumeUrl || "",
      }));

      setMessage("Profile saved successfully!");

      await refreshProfileSummary();
    } catch (requestError) {
      console.error("Profile save error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshProfileSummary() {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await api.get("/profile/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompletion(
        response.data.data.profileCompletion || 0
      );

      const updatedUser = response.data.data.user;

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
        })
      );
    } catch (requestError) {
      console.error(
        "Profile summary refresh error:",
        requestError
      );
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 className="profile-loader" size={32} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <Link to="/dashboard" className="back-dashboard">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="profile-top-logo">
          Alumni<span>Connect</span>
        </div>
      </header>

      <main className="profile-content">
        <section className="profile-intro">
          <div>
            <span className="profile-eyebrow">
              YOUR PROFESSIONAL PROFILE
            </span>

            <h1>Build your career profile</h1>

            <p>
              Tell us about yourself so AlumniConnect AI can
              understand your goals and recommend the right
              mentors, skills and opportunities.
            </p>
          </div>

          <div className="completion-card">
            <div className="completion-top">
              <div>
                <span>Profile completion</span>
                <strong>{completion}%</strong>
              </div>

              <div className="completion-circle">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="completion-bar">
              <div
                style={{
                  width: `${completion}%`,
                }}
              ></div>
            </div>

            <small>
              {completion === 100
                ? "Your profile is complete."
                : "Complete more details to improve AI recommendations."}
            </small>
          </div>
        </section>

        {message && (
          <div className="profile-success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="profile-section-card">
            <div className="profile-section-heading">
              <div className="section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <h2>Personal information</h2>
                <p>Basic information about you.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="firstName">
                  First name <span>*</span>
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="lastName">
                  Last name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                />

                <small>Email cannot be changed here.</small>
              </div>

              <div className="profile-field">
                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="profile-field full-width">
                <label htmlFor="location">
                  <MapPin size={13} />
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </section>

          <section className="profile-section-card">
            <div className="profile-section-heading">
              <div className="section-icon blue-section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <h2>Education & career</h2>
                <p>
                  Help us understand your academic background
                  and career direction.
                </p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field full-width">
                <label htmlFor="college">
                  College / University <span>*</span>
                </label>

                <input
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Enter your college or university"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="degree">
                  Degree <span>*</span>
                </label>

                <input
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="branch">
                  Branch / Specialization <span>*</span>
                </label>

                <input
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. AI & ML"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="graduationYear">
                  Graduation year
                </label>

                <input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="e.g. 2027"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="careerGoal">
                  Target career <span>*</span>
                </label>

                <input
                  id="careerGoal"
                  name="careerGoal"
                  value={formData.careerGoal}
                  onChange={handleChange}
                  placeholder="e.g. AI/ML Engineer"
                  required
                />
              </div>

              <div className="profile-field full-width">
                <label htmlFor="bio">About you</label>

                <textarea
                  id="bio"
                  name="bio"
                  rows="5"
                  maxLength="500"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write a short professional introduction about yourself..."
                ></textarea>

                <small>
                  {formData.bio.length}/500 characters
                </small>
              </div>
            </div>
          </section>

          <section className="profile-section-card">
            <div className="profile-section-heading">
              <div className="section-icon green-section-icon">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <h2>Professional links</h2>
                <p>
                  Connect your professional presence with your
                  AlumniConnect profile.
                </p>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="githubUrl">
                  GitHub
                </label>

                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="linkedinUrl">
                  LinkedIn
                </label>

                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="portfolioUrl">
                  <ExternalLink size={14} />
                  Portfolio
                </label>

                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="resumeUrl">
                  Resume link
                </label>

                <input
                  id="resumeUrl"
                  name="resumeUrl"
                  type="url"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
          </section>

          <div className="profile-save-bar">
            <div>
              <strong>Keep your profile updated</strong>
              <span>
                Better profile data means better AI recommendations.
              </span>
            </div>

            <button
              type="submit"
              className="save-profile-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="button-loader" size={17} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save profile
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ProfilePage;